import { useState, useCallback } from 'react';
import apiClient from '@/lib/apiClient';
import type { RTIRequest, RTISubmission, PaginatedResponse, ApiResponse } from '@/types';

export function useRTI() {
  const [requests, setRequests] = useState<RTIRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<PaginatedResponse<RTIRequest>>('/rti');
      setRequests(data.data ?? []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch RTI requests');
    } finally {
      setLoading(false);
    }
  }, []);

  const submitRequest = useCallback(async (submission: RTISubmission) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.post<ApiResponse<RTIRequest>>('/rti', submission);
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit RTI');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { requests, loading, error, fetchRequests, submitRequest };
}
