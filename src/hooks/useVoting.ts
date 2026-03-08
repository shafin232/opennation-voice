import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { VotePayload, VoteResponse } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { useAlgorithms } from './useAlgorithms';

export function useVoting() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { crisisMode } = useApp();
  const { weightVote, logAction, computeReputation } = useAlgorithms();

  const vote = useCallback(async (payload: VotePayload): Promise<VoteResponse | null> => {
    if (crisisMode.active) {
      setError('Voting disabled during crisis mode');
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // --- Algorithm: Get geographic vote weight ---
      let voteWeight = 1.0;
      try {
        // Try to get user's location for weighting
        const { data: profile } = await supabase
          .from('profiles')
          .select('district')
          .eq('user_id', user.id)
          .single();

        const weightResult = await weightVote(
          payload.reportId,
          undefined, // voter_lat - would come from geolocation API
          undefined, // voter_lng
          profile?.district
        );
        voteWeight = weightResult?.weight ?? 1.0;
      } catch {
        // If algorithm fails, use default weight
        voteWeight = 1.0;
      }

      // Upsert vote
      const { error: err } = await supabase
        .from('votes')
        .upsert(
          { report_id: payload.reportId, user_id: user.id, vote_type: payload.type },
          { onConflict: 'report_id,user_id' }
        );

      if (err) throw err;

      // --- Algorithm: Log action for anti-farming tracking ---
      try {
        await logAction(user.id, 'vote', payload.reportId, 'report');
      } catch {
        // Non-blocking: action logging failure shouldn't break voting
      }

      // --- Algorithm: Recompute voter's reputation (async, non-blocking) ---
      computeReputation(user.id).catch(() => {});

      // Get updated counts
      const { count: supportCount } = await supabase
        .from('votes')
        .select('*', { count: 'exact', head: true })
        .eq('report_id', payload.reportId)
        .eq('vote_type', 'support');

      const { count: doubtCount } = await supabase
        .from('votes')
        .select('*', { count: 'exact', head: true })
        .eq('report_id', payload.reportId)
        .eq('vote_type', 'doubt');

      return {
        reportId: payload.reportId,
        supportCount: supportCount ?? 0,
        doubtCount: doubtCount ?? 0,
        userVote: payload.type,
      };
    } catch (err: any) {
      setError(err.message || 'Failed to vote');
      return null;
    } finally {
      setLoading(false);
    }
  }, [crisisMode.active, weightVote, logAction, computeReputation]);

  return { vote, loading, error };
}
