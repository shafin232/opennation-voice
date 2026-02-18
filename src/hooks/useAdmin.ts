import { useState, useCallback } from 'react';
import apiClient from '@/lib/apiClient';
import type {
  ModerationItem, TenderAnalysis, AuditLog, IdentityUnlockRequest,
  VoteAnomaly, CrisisMode, PaginatedResponse, ApiResponse
} from '@/types';

export function useAdmin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Moderation
  const [moderationQueue, setModerationQueue] = useState<ModerationItem[]>([]);
  const fetchModerationQueue = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await apiClient.get<PaginatedResponse<ModerationItem>>('/admin/moderation');
      setModerationQueue(data.data);
    } catch (err: any) { setError(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  }, []);

  const moderateReport = useCallback(async (id: string, action: 'approve' | 'hide' | 'restore') => {
    setLoading(true); setError(null);
    try {
      await apiClient.post<ApiResponse<null>>(`/admin/moderation/${id}`, { action });
      setModerationQueue(prev => prev.filter(m => m.id !== id));
    } catch (err: any) { setError(err.response?.data?.message || 'Failed'); throw err; }
    finally { setLoading(false); }
  }, []);

  // Crisis
  const toggleCrisisMode = useCallback(async (activate: boolean, reason?: string) => {
    setLoading(true); setError(null);
    try {
      const { data } = await apiClient.post<ApiResponse<CrisisMode>>('/admin/crisis-mode', { active: activate, reason });
      return data.data;
    } catch (err: any) { setError(err.response?.data?.message || 'Failed'); throw err; }
    finally { setLoading(false); }
  }, []);

  // Tender Analysis
  const [tenders, setTenders] = useState<TenderAnalysis[]>([]);
  const fetchTenders = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await apiClient.get<PaginatedResponse<TenderAnalysis>>('/admin/tenders');
      setTenders(data.data);
    } catch (err: any) { setError(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  }, []);

  // Project Approval
  const approveProject = useCallback(async (projectId: string, approved: boolean, notes?: string) => {
    setLoading(true); setError(null);
    try {
      await apiClient.post<ApiResponse<null>>(`/admin/projects/${projectId}/approve`, { approved, notes });
    } catch (err: any) { setError(err.response?.data?.message || 'Failed'); throw err; }
    finally { setLoading(false); }
  }, []);

  // RTI Response
  const respondToRTI = useCallback(async (rtiId: string, response: string) => {
    setLoading(true); setError(null);
    try {
      await apiClient.post<ApiResponse<null>>(`/admin/rti/${rtiId}/respond`, { response });
    } catch (err: any) { setError(err.response?.data?.message || 'Failed'); throw err; }
    finally { setLoading(false); }
  }, []);

  // Identity Unlock
  const [unlockRequests, setUnlockRequests] = useState<IdentityUnlockRequest[]>([]);
  const fetchUnlockRequests = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await apiClient.get<PaginatedResponse<IdentityUnlockRequest>>('/admin/identity-unlock');
      setUnlockRequests(data.data);
    } catch (err: any) { setError(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  }, []);

  const processUnlock = useCallback(async (id: string, approved: boolean) => {
    setLoading(true); setError(null);
    try {
      await apiClient.post<ApiResponse<null>>(`/admin/identity-unlock/${id}`, { approved });
      setUnlockRequests(prev => prev.filter(r => r.id !== id));
    } catch (err: any) { setError(err.response?.data?.message || 'Failed'); throw err; }
    finally { setLoading(false); }
  }, []);

  // Vote Anomaly
  const [anomalies, setAnomalies] = useState<VoteAnomaly[]>([]);
  const fetchAnomalies = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await apiClient.get<PaginatedResponse<VoteAnomaly>>('/admin/vote-anomalies');
      setAnomalies(data.data);
    } catch (err: any) { setError(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  }, []);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const fetchAuditLogs = useCallback(async (filters?: { action?: string; dateFrom?: string; dateTo?: string }) => {
    setLoading(true); setError(null);
    try {
      const { data } = await apiClient.get<PaginatedResponse<AuditLog>>('/admin/audit-logs', { params: filters });
      setAuditLogs(data.data);
    } catch (err: any) { setError(err.response?.data?.message || 'Failed'); }
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
