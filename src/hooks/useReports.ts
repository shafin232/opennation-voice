import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Report, ReportSubmission } from '@/types';
import { useAlgorithms } from './useAlgorithms';

export function useReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const LIMIT = 20;
  const { computeTruth, logAction, computeReputation } = useAlgorithms();

  const fetchReports = useCallback(async (pageNum = 1, reset = false) => {
    setLoading(true);
    setError(null);
    try {
      const from = (pageNum - 1) * LIMIT;
      const to = from + LIMIT - 1;

      const { data, error: err, count } = await supabase
        .from('reports')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (err) throw err;

      // Fetch author names
      const authorIds = [...new Set((data ?? []).map((r: any) => r.author_id))];
      const { data: profilesData } = authorIds.length > 0
        ? await supabase.from('profiles').select('user_id, name').in('user_id', authorIds)
        : { data: [] };
      const nameMap = new Map((profilesData ?? []).map((p: any) => [p.user_id, p.name]));

      const mapped: Report[] = (data ?? []).map((r: any) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        category: r.category,
        location: { district: r.district, upazila: r.upazila, address: r.address, lat: r.lat, lng: r.lng },
        evidence: [],
        authorId: r.author_id,
        authorName: nameMap.get(r.author_id) || 'Anonymous',
        supportCount: r.support_count,
        doubtCount: r.doubt_count,
        status: r.status,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        // Algorithm fields
        truthProbability: r.truth_probability,
        authenticityScore: r.authenticity_score,
        approvalDecision: r.approval_decision,
      }));

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

      // --- Algorithm: Log action ---
      if (data) {
        try {
          await logAction(user.id, 'report', data.id, 'report', submission.location.lat, submission.location.lng);
        } catch {
          // Non-blocking
        }

        // --- Algorithm: Compute truth score (async, non-blocking) ---
        computeTruth(data.id).catch(() => {});

        // --- Algorithm: Update author reputation (async, non-blocking) ---
        computeReputation(user.id).catch(() => {});
      }

      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to submit report');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [logAction, computeTruth, computeReputation]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) fetchReports(page + 1);
  }, [loading, hasMore, page, fetchReports]);

  return { reports, loading, error, hasMore, fetchReports, submitReport, loadMore };
}
