import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { IntegrityMetrics } from '@/types';

export function useIntegrity() {
  const [metrics, setMetrics] = useState<IntegrityMetrics[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async (district?: string) => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from('integrity_metrics').select('*');
      if (district) query = query.eq('district', district);

      const { data, error: err } = await query;
      if (err) throw err;

      setMetrics((data ?? []).map(m => ({
        district: m.district,
        trustScore: m.trust_score,
        truthScore: m.truth_score,
        totalReports: m.total_reports,
        verifiedReports: m.verified_reports,
        resolvedReports: m.resolved_reports,
        activeProjects: m.active_projects,
        rtiResponseRate: Number(m.rti_response_rate),
      })));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch integrity metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  return { metrics, loading, error, fetchMetrics };
}
