import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RTIRequest, RTISubmission } from '@/types';

export function useRTI() {
  const [requests, setRequests] = useState<RTIRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('rti_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;

      setRequests((data ?? []).map(r => ({
        id: r.id,
        subject: r.subject,
        body: r.body,
        department: r.department,
        status: r.status as any,
        response: r.response ?? undefined,
        submittedBy: r.submitted_by,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      })));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch RTI requests');
    } finally {
      setLoading(false);
    }
  }, []);

  const submitRequest = useCallback(async (submission: RTISubmission) => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error: err } = await supabase
        .from('rti_requests')
        .insert({
          subject: submission.subject,
          body: submission.body,
          department: submission.department,
          submitted_by: user.id,
        })
        .select()
        .single();

      if (err) throw err;
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to submit RTI');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { requests, loading, error, fetchRequests, submitRequest };
}
