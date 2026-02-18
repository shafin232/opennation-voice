import { useState, useCallback } from 'react';
import apiClient from '@/lib/apiClient';
import type { VotePayload, VoteResponse, ApiResponse } from '@/types';
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
      const { data } = await apiClient.post<ApiResponse<VoteResponse>>('/votes', payload);
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to vote');
      return null;
    } finally {
      setLoading(false);
    }
  }, [crisisMode.active]);

  return { vote, loading, error };
}
