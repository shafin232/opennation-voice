import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Report, ReportSubmission } from '@/types';
import { computeTruth, logAction, computeReputation } from '@/lib/algorithms';

export function useReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const LIMIT = 20;

  const fetchReports = useCallback(async (pageNum = 1, reset = false) => {
    setLoading(true);
    setError(null);
    try {
      const from = (pageNum - 1) * LIMIT;
      const to = from + LIMIT - 1;

      const { data, error: err, count } = await supabase
        .from('reports')
        .select('*', { count: 'exact' })
        .neq('approval_decision', 'rejected')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (err) throw err;

      // Fetch author names
      const authorIds = [...new Set((data ?? []).map((r: any) => r.author_id))];
      const { data: profilesData } = authorIds.length > 0
        ? await supabase.from('profiles').select('user_id, name, avatar_url').in('user_id', authorIds)
        : { data: [] };
      const profileMap = new Map((profilesData ?? []).map((p: any) => [p.user_id, p]));

      // Fetch current user's votes on these reports
      const { data: { user } } = await supabase.auth.getUser();
      let userVotesMap = new Map<string, 'support' | 'doubt'>();
      if (user && data && data.length > 0) {
        const reportIds = data.map((r: any) => r.id);
        const { data: userVotes } = await supabase
          .from('votes')
          .select('report_id, vote_type')
          .eq('user_id', user.id)
          .in('report_id', reportIds);

        for (const v of userVotes ?? []) {
          userVotesMap.set(v.report_id, v.vote_type as 'support' | 'doubt');
        }
      }

      // Fetch evidence for these reports
      const reportIds = (data ?? []).map((r: any) => r.id);
      const { data: evidenceData } = reportIds.length > 0
        ? await supabase.from('evidence').select('*').in('report_id', reportIds)
        : { data: [] };
      const evidenceMap = new Map<string, any[]>();
      for (const e of evidenceData ?? []) {
        if (!evidenceMap.has(e.report_id)) evidenceMap.set(e.report_id, []);
        evidenceMap.get(e.report_id)!.push({ id: e.id, type: e.type, url: e.url, blurred: e.blurred });
      }

      const mapped: Report[] = (data ?? []).map((r: any) => {
        const profile = profileMap.get(r.author_id);
        return {
          id: r.id,
          title: r.title,
          description: r.description,
          category: r.category,
          location: { district: r.district, upazila: r.upazila, address: r.address, lat: r.lat, lng: r.lng },
          evidence: evidenceMap.get(r.id) || [],
          authorId: r.author_id,
          authorName: profile?.name || 'Anonymous',
          authorAvatar: profile?.avatar_url || undefined,
          supportCount: r.support_count,
          doubtCount: r.doubt_count,
          commentCount: r.comment_count ?? 0,
          userVote: userVotesMap.get(r.id) || null,
          status: r.status,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
          truthProbability: r.truth_probability,
          authenticityScore: r.authenticity_score,
          approvalDecision: r.approval_decision,
        };
      });

      setReports(prev => reset ? mapped : [...prev, ...mapped]);
      setHasMore((count ?? 0) > pageNum * LIMIT);
      setPage(pageNum);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  }, []);

  const submitReport = useCallback(async (submission: ReportSubmission) => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Anti-bot: Check recent submission rate (max 5 reports in 10 minutes)
      const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const { count: recentCount } = await supabase
        .from('reports')
        .select('id', { count: 'exact', head: true })
        .eq('author_id', user.id)
        .gte('created_at', tenMinAgo);

      if ((recentCount ?? 0) >= 5) {
        throw new Error('অতিরিক্ত রিপোর্ট সাবমিশন। অনুগ্রহ করে কিছুক্ষণ পর চেষ্টা করুন।');
      }

      // Anti-bot: Check for duplicate title in last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count: dupCount } = await supabase
        .from('reports')
        .select('id', { count: 'exact', head: true })
        .eq('author_id', user.id)
        .eq('title', submission.title)
        .gte('created_at', oneHourAgo);

      if ((dupCount ?? 0) > 0) {
        throw new Error('একই শিরোনামে রিপোর্ট ইতিমধ্যে জমা করা হয়েছে।');
      }

      const { data, error: err } = await supabase
        .from('reports')
        .insert({
          title: submission.title,
          description: submission.description,
          category: submission.category,
          district: submission.location.district,
          upazila: submission.location.upazila,
          address: submission.location.address,
          lat: submission.location.lat,
          lng: submission.location.lng,
          author_id: user.id,
        })
        .select()
        .single();

      if (err) throw err;

      // Upload evidence files
      if (submission.evidence?.length && data) {
        for (const file of submission.evidence) {
          const filePath = `${data.id}/${Date.now()}_${file.name}`;
          const { error: uploadErr } = await supabase.storage
            .from('evidence')
            .upload(filePath, file);

          if (!uploadErr) {
            const { data: urlData } = supabase.storage.from('evidence').getPublicUrl(filePath);
            await supabase.from('evidence').insert({
              report_id: data.id,
              type: file.type.startsWith('image') ? 'image' : file.type.startsWith('video') ? 'video' : 'document',
              url: urlData.publicUrl,
            });
          }
        }
      }

      // --- Algorithms (non-blocking) ---
      if (data) {
        logAction(user.id, 'report', data.id, 'report', submission.location.lat, submission.location.lng).catch(() => {});
        computeTruth(data.id).catch(() => {});
        computeReputation(user.id).catch(() => {});
      }

      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to submit report');
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
