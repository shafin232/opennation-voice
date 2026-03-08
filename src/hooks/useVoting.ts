import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { VotePayload, VoteResponse } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { weightVote, logAction, computeReputation, computeTruth } from '@/lib/algorithms';

export function useVoting() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { crisisMode } = useApp();

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

      // --- PREVENT SELF-VOTING ---
      const { data: report } = await supabase
        .from('reports')
        .select('author_id')
        .eq('id', payload.reportId)
        .single();

      if (report?.author_id === user.id) {
        setError('নিজের রিপোর্টে ভোট দেওয়া যাবে না');
        return null;
      }

      // --- Algorithm: Get geographic vote weight (non-blocking) ---
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('district')
          .eq('user_id', user.id)
          .single();

        weightVote(payload.reportId, undefined, undefined, profile?.district).catch(() => {});
      } catch {
        // If algorithm fails, continue
      }

      // Upsert vote
      const { error: err } = await supabase
        .from('votes')
        .upsert(
          { report_id: payload.reportId, user_id: user.id, vote_type: payload.type },
          { onConflict: 'report_id,user_id' }
        );

      if (err) throw err;

      // --- Algorithm: Log action & recompute reputation (non-blocking) ---
      logAction(user.id, 'vote', payload.reportId, 'report').catch(() => {});
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
  }, [crisisMode.active]);

  return { vote, loading, error };
}
