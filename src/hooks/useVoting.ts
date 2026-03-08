import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { VotePayload, VoteResponse } from '@/types';
import { useApp } from '@/contexts/AppContext';

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

      // Upsert vote
      const { error: err } = await supabase
        .from('votes')
        .upsert(
          { report_id: payload.reportId, user_id: user.id, vote_type: payload.type },
          { onConflict: 'report_id,user_id' }
        );

      if (err) throw err;

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
