import { useState, useCallback } from 'react';
import apiClient from '@/lib/apiClient';
import type { Hospital, PaginatedResponse } from '@/types';

export function useHospitals() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHospitals = useCallback(async (district?: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<PaginatedResponse<Hospital>>('/hospitals', {
        params: district ? { district } : undefined,
      });
      setHospitals(data.data ?? []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch hospitals');
    } finally {
      setLoading(false);
    }
  }, []);

  return { hospitals, loading, error, fetchHospitals };
}
