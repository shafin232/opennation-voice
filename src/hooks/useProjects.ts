import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { GovernmentProject, ProjectOpinion, OpinionSubmission, ProjectVoteType } from '@/types';

export function useProjects() {
  const [projects, setProjects] = useState<GovernmentProject[]>([]);
  const [opinions, setOpinions] = useState<ProjectOpinion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async (statusFilter?: string) => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error: err } = await query;
      if (err) throw err;

      // Fetch current user's votes
      const { data: { user } } = await supabase.auth.getUser();
      let userVotesMap = new Map<string, ProjectVoteType>();
      if (user && data && data.length > 0) {
        const projectIds = data.map((p: any) => p.id);
        const { data: votes } = await supabase
          .from('project_votes' as any)
          .select('project_id, vote_type')
          .eq('user_id', user.id)
          .in('project_id', projectIds);
        for (const v of votes ?? []) {
          userVotesMap.set((v as any).project_id, (v as any).vote_type as ProjectVoteType);
        }
      }

      setProjects((data ?? []).map((p: any) => ({
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
        needCount: p.need_count ?? 0,
        modifyCount: p.modify_count ?? 0,
        rejectCount: p.reject_count ?? 0,
        approvalPercent: p.approval_percent ?? 0,
        impactIncome: p.impact_income ?? 'medium',
        impactEnvironment: p.impact_environment ?? 'neutral',
        impactDisplacement: p.impact_displacement ?? 0,
        affectedPopulation: p.affected_population ?? 0,
        userVote: userVotesMap.get(p.id) || null,
      })));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, []);

  const voteOnProject = useCallback(async (projectId: string, voteType: ProjectVoteType) => {
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user's district for geographic weighting
      const { data: profile } = await supabase
        .from('profiles')
        .select('district')
        .eq('user_id', user.id)
        .single();

      // Get project district
      const { data: project } = await supabase
        .from('projects')
        .select('district')
        .eq('id', projectId)
        .single();

      // Geographic weight: same district = 1.5x, else 1.0
      const weight = (profile?.district && project?.district && 
        profile.district.toLowerCase() === project.district.toLowerCase()) ? 1.5 : 1.0;

      // Upsert vote
      const { error: err } = await supabase
        .from('project_votes' as any)
        .upsert({
          project_id: projectId,
          user_id: user.id,
          vote_type: voteType,
          voter_district: profile?.district || '',
          weight,
        } as any, { onConflict: 'project_id,user_id' });

      if (err) throw err;

      // Refresh projects to get updated counts
      await fetchProjects();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to vote');
      return false;
    }
  }, [fetchProjects]);

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
        ? await supabase.from('profiles').select('user_id, name, citizen_alias').in('user_id', userIds)
        : { data: [] };
      const profileMap = new Map((profilesData ?? []).map((p: any) => [p.user_id, p]));

      setOpinions((data ?? []).map((o: any) => {
        const p = profileMap.get(o.user_id);
        return {
          id: o.id,
          projectId: o.project_id,
          userId: o.user_id,
          userName: p?.citizen_alias || p?.name || 'Anonymous',
          opinion: o.opinion,
          createdAt: o.created_at,
        };
      }));
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

  return { projects, opinions, loading, error, fetchProjects, fetchProjectOpinions, submitOpinion, voteOnProject };
}
