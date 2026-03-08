import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Hospital } from '@/types';

export function useHospitals() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHospitals = useCallback(async (district?: string) => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from('hospitals').select('*').order('name');
      if (district) query = query.eq('district', district);

      const { data, error: err } = await query;
      if (err) throw err;

      setHospitals((data ?? []).map(h => ({
        id: h.id,
        name: h.name,
        district: h.district,
        type: h.type as any,
        totalBeds: h.total_beds,
        availableBeds: h.available_beds,
        rating: Number(h.rating),
        services: h.services,
        lastUpdated: h.last_updated,
      })));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch hospitals');
    } finally {
      setLoading(false);
    }
  }, []);

  return { hospitals, loading, error, fetchHospitals };
}
