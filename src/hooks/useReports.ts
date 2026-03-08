import { useState, useCallback } from 'react';
import apiClient from '@/lib/apiClient';
import type { Report, ReportSubmission, PaginatedResponse, ApiResponse } from '@/types';

export function useReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const fetchReports = useCallback(async (pageNum = 1, reset = false) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<PaginatedResponse<Report>>('/reports', {
        params: { page: pageNum, limit: 20 },
      });
      setReports(prev => reset ? (data.data ?? []) : [...prev, ...(data.data ?? [])]);
      setHasMore(data.hasMore);
      setPage(pageNum);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  }, []);

  const submitReport = useCallback(async (submission: ReportSubmission) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('title', submission.title);
      formData.append('description', submission.description);
      formData.append('category', submission.category);
      formData.append('location', JSON.stringify(submission.location));
      submission.evidence?.forEach(file => formData.append('evidence', file));

      const { data } = await apiClient.post<ApiResponse<Report>>('/reports', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit report');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) fetchReports(page + 1);
  }, [loading, hasMore, page, fetchReports]);

  return { reports, loading, error, hasMore, fetchReports, submitReport, loadMore };
}
