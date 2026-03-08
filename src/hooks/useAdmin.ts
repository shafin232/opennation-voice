import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type {
  ModerationItem, TenderAnalysis, AuditLog, IdentityUnlockRequest,
  VoteAnomaly, CrisisMode
} from '@/types';

export function useAdmin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Moderation
  const [moderationQueue, setModerationQueue] = useState<ModerationItem[]>([]);
  const fetchModerationQueue = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { data, error: err } = await supabase
        .from('moderation_queue')
        .select('*, reports(*)')
        .eq('status', 'pending')
        .order('flagged_at', { ascending: false });

      if (err) throw err;

      setModerationQueue((data ?? []).map((m: any) => ({
        id: m.id,
        report: {
          id: m.reports.id,
          title: m.reports.title,
          description: m.reports.description,
          category: m.reports.category,
          location: { district: m.reports.district },
          evidence: [],
          authorId: m.reports.author_id,
          authorName: '',
          supportCount: m.reports.support_count,
          doubtCount: m.reports.doubt_count,
          status: m.reports.status,
          createdAt: m.reports.created_at,
          updatedAt: m.reports.updated_at,
        },
        flagReason: m.flag_reason,
        flaggedBy: m.flagged_by,
        flaggedAt: m.flagged_at,
        status: m.status,
      })));
    } catch (err: any) { setError(err.message || 'Failed'); }
    finally { setLoading(false); }
  }, []);

  const moderateReport = useCallback(async (id: string, action: 'approve' | 'hide' | 'restore') => {
    setLoading(true); setError(null);
    try {
      const newStatus = action === 'approve' ? 'approved' : 'hidden';
      const { error: err } = await supabase
        .from('moderation_queue')
        .update({ status: newStatus })
        .eq('id', id);

      if (err) throw err;
      setModerationQueue(prev => prev.filter(m => m.id !== id));
    } catch (err: any) { setError(err.message || 'Failed'); throw err; }
    finally { setLoading(false); }
  }, []);

  // Crisis
  const toggleCrisisMode = useCallback(async (activate: boolean, reason?: string) => {
    setLoading(true); setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error: err } = await supabase
        .from('crisis_mode')
        .upsert({
          id: '00000000-0000-0000-0000-000000000001',
          active: activate,
          activated_by: user?.id,
          activated_at: activate ? new Date().toISOString() : null,
          reason: reason || null,
        })
        .select()
        .single();

      if (err) throw err;
      return { active: data.active, activatedBy: data.activated_by, activatedAt: data.activated_at, reason: data.reason } as CrisisMode;
    } catch (err: any) { setError(err.message || 'Failed'); throw err; }
    finally { setLoading(false); }
  }, []);

  // Tenders
  const [tenders, setTenders] = useState<TenderAnalysis[]>([]);
  const fetchTenders = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { data, error: err } = await supabase
        .from('tenders')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;
      setTenders((data ?? []).map(t => ({
        id: t.id,
        tenderTitle: t.tender_title,
        department: t.department,
        estimatedCost: t.estimated_cost,
        actualCost: t.actual_cost,
        riskScore: t.risk_score,
        riskFactors: t.risk_factors,
        status: t.status as any,
        awardedTo: t.awarded_to,
        createdAt: t.created_at,
      })));
    } catch (err: any) { setError(err.message || 'Failed'); }
    finally { setLoading(false); }
  }, []);

  // Project Approval
  const approveProject = useCallback(async (projectId: string, approved: boolean) => {
    setLoading(true); setError(null);
    try {
      const { error: err } = await supabase
        .from('projects')
        .update({ approval_status: approved ? 'approved' : 'rejected' })
        .eq('id', projectId);

      if (err) throw err;
    } catch (err: any) { setError(err.message || 'Failed'); throw err; }
    finally { setLoading(false); }
  }, []);

  // RTI Response
  const respondToRTI = useCallback(async (rtiId: string, response: string) => {
    setLoading(true); setError(null);
    try {
      const { error: err } = await supabase
        .from('rti_requests')
        .update({ response, status: 'responded' })
        .eq('id', rtiId);

      if (err) throw err;
    } catch (err: any) { setError(err.message || 'Failed'); throw err; }
    finally { setLoading(false); }
  }, []);

  // Identity Unlock
  const [unlockRequests, setUnlockRequests] = useState<IdentityUnlockRequest[]>([]);
  const fetchUnlockRequests = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { data, error: err } = await supabase
        .from('identity_unlock_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;
      setUnlockRequests((data ?? []).map(r => ({
        id: r.id,
        requestedBy: r.requested_by,
        targetUserId: r.target_user_id,
        reason: r.reason,
        status: r.status as any,
        approvedBy: r.approved_by ?? undefined,
        createdAt: r.created_at,
      })));
    } catch (err: any) { setError(err.message || 'Failed'); }
    finally { setLoading(false); }
  }, []);

  const processUnlock = useCallback(async (id: string, approved: boolean) => {
    setLoading(true); setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error: err } = await supabase
        .from('identity_unlock_requests')
        .update({
          status: approved ? 'approved' : 'rejected',
          approved_by: approved ? user?.id : null,
        })
        .eq('id', id);

      if (err) throw err;
      setUnlockRequests(prev => prev.filter(r => r.id !== id));
    } catch (err: any) { setError(err.message || 'Failed'); throw err; }
    finally { setLoading(false); }
  }, []);

  // Vote Anomaly
  const [anomalies, setAnomalies] = useState<VoteAnomaly[]>([]);
  const fetchAnomalies = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { data, error: err } = await supabase
        .from('vote_anomalies')
        .select('*')
        .order('detected_at', { ascending: false });

      if (err) throw err;
      setAnomalies((data ?? []).map(a => ({
        id: a.id,
        reportId: a.report_id,
        reportTitle: a.report_title,
        anomalyType: a.anomaly_type,
        severity: a.severity as any,
        details: a.details,
        detectedAt: a.detected_at,
      })));
    } catch (err: any) { setError(err.message || 'Failed'); }
    finally { setLoading(false); }
  }, []);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const fetchAuditLogs = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { data, error: err } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (err) throw err;
      setAuditLogs((data ?? []).map(l => ({
        id: l.id,
        action: l.action,
        performedBy: l.performed_by ?? '',
        performedByRole: l.performed_by_role as any,
        targetType: l.target_type,
        targetId: l.target_id,
        details: l.details,
        timestamp: l.created_at,
      })));
    } catch (err: any) { setError(err.message || 'Failed'); }
    finally { setLoading(false); }
  }, []);

  return {
    loading, error,
    moderationQueue, fetchModerationQueue, moderateReport,
    toggleCrisisMode,
    tenders, fetchTenders,
    approveProject,
    respondToRTI,
    unlockRequests, fetchUnlockRequests, processUnlock,
    anomalies, fetchAnomalies,
    auditLogs, fetchAuditLogs,
  };
}
