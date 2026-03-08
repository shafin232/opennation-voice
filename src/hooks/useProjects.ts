import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { GovernmentProject, ProjectOpinion, OpinionSubmission } from '@/types';

export function useProjects() {
  const [projects, setProjects] = useState<GovernmentProject[]>([]);
  const [opinions, setOpinions] = useState<ProjectOpinion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;

      setProjects((data ?? []).map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        department: p.department,
        budget: p.budget,
        district: p.district,
        status: p.status as any,
        startDate: p.start_date ?? undefined,
        endDate: p.end_date ?? undefined,
        opinionCount: p.opinion_count,
        approvalStatus: p.approval_status as any,
        isFrozen: p.is_frozen,
        createdAt: p.created_at,
      })));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProjectOpinions = useCallback(async (projectId: string) => {
    setLoading(true);
    try {
      const { data, error: err } = await supabase
        .from('project_opinions')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (err) throw err;

      const userIds = [...new Set((data ?? []).map((o: any) => o.user_id))];
      const { data: profilesData } = userIds.length > 0
        ? await supabase.from('profiles').select('user_id, name').in('user_id', userIds)
        : { data: [] };
      const nameMap = new Map((profilesData ?? []).map((p: any) => [p.user_id, p.name]));

      setOpinions((data ?? []).map((o: any) => ({
        id: o.id,
        projectId: o.project_id,
        userId: o.user_id,
        userName: nameMap.get(o.user_id) || 'Anonymous',
        opinion: o.opinion,
        createdAt: o.created_at,
      })));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch opinions');
    } finally {
      setLoading(false);
    }
  }, []);

  const submitOpinion = useCallback(async (submission: OpinionSubmission) => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error: err } = await supabase
        .from('project_opinions')
        .insert({
          project_id: submission.projectId,
          user_id: user.id,
          opinion: submission.opinion,
        })
        .select()
        .single();

      if (err) throw err;
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to submit opinion');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { projects, opinions, loading, error, fetchProjects, fetchProjectOpinions, submitOpinion };
}
