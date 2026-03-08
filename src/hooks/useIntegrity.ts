import { useState, useCallback } from 'react';
import apiClient from '@/lib/apiClient';
import type { IntegrityMetrics, ApiResponse } from '@/types';

export function useIntegrity() {
  const [metrics, setMetrics] = useState<IntegrityMetrics[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async (district?: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<ApiResponse<IntegrityMetrics[]>>('/integrity', {
        params: district ? { district } : undefined,
      });
      setMetrics(data.data ?? []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch integrity metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  return { metrics, loading, error, fetchMetrics };
}
