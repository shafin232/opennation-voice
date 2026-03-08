import { useState, useCallback } from 'react';
import apiClient from '@/lib/apiClient';
import type { GovernmentProject, ProjectOpinion, OpinionSubmission, PaginatedResponse, ApiResponse } from '@/types';

export function useProjects() {
  const [projects, setProjects] = useState<GovernmentProject[]>([]);
  const [opinions, setOpinions] = useState<ProjectOpinion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<PaginatedResponse<GovernmentProject>>('/projects');
      setProjects(data.data ?? []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProjectOpinions = useCallback(async (projectId: string) => {
    setLoading(true);
    try {
      const { data } = await apiClient.get<PaginatedResponse<ProjectOpinion>>(`/projects/${projectId}/opinions`);
      setOpinions(data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch opinions');
    } finally {
      setLoading(false);
    }
  }, []);

  const submitOpinion = useCallback(async (submission: OpinionSubmission) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.post<ApiResponse<ProjectOpinion>>(`/projects/${submission.projectId}/opinions`, {
        opinion: submission.opinion,
      });
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit opinion');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { projects, opinions, loading, error, fetchProjects, fetchProjectOpinions, submitOpinion };
}
