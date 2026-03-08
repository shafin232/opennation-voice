import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to interact with OpenNation's algorithm engine (Edge Functions).
 * All algorithms run server-side for security and accuracy.
 */
export function useAlgorithms() {
  const invoke = useCallback(async (fnName: string, body: Record<string, unknown>) => {
    const { data, error } = await supabase.functions.invoke(fnName, { body });
    if (error) throw error;
    return data;
  }, []);

  // ====== Reputation & Trust Engine ======
  const computeReputation = useCallback(
    (userId: string) => invoke('reputation-engine', { user_id: userId }),
    [invoke]
  );

  // ====== Truth & Authenticity Verification ======
  const computeTruth = useCallback(
    (reportId: string) => invoke('truth-engine', { report_id: reportId }),
    [invoke]
  );

  // ====== Locality Engine ======
  const weightVote = useCallback(
    (reportId: string, voterLat?: number, voterLng?: number, voterDistrict?: string) =>
      invoke('locality-engine', {
        action: 'weight_vote',
        report_id: reportId,
        voter_lat: voterLat,
        voter_lng: voterLng,
        voter_district: voterDistrict,
      }),
    [invoke]
  );

  const checkLocationIntegrity = useCallback(
    (reportId: string) =>
      invoke('locality-engine', { action: 'location_integrity', report_id: reportId }),
    [invoke]
  );

  // ====== Procurement Risk ======
  const winRateAnomaly = useCallback(
    (contractorName: string) =>
      invoke('procurement-risk', { action: 'win_rate_anomaly', contractor_name: contractorName }),
    [invoke]
  );

  const bidRotation = useCallback(
    () => invoke('procurement-risk', { action: 'bid_rotation' }),
    [invoke]
  );

  const hhiIndex = useCallback(
    () => invoke('procurement-risk', { action: 'hhi_index' }),
    [invoke]
  );

  const executionRisk = useCallback(
    (tenderId: string) =>
      invoke('procurement-risk', { action: 'execution_risk', tender_id: tenderId }),
    [invoke]
  );

  // ====== National Integrity Index ======
  const nationalIndex = useCallback(
    (weightBy: 'volume' | 'equal' = 'volume') =>
      invoke('integrity-index', { action: 'national_index', weight_by: weightBy }),
    [invoke]
  );

  const trendAnalysis = useCallback(
    () => invoke('integrity-index', { action: 'trend_analysis' }),
    [invoke]
  );

  const districtRanking = useCallback(
    () => invoke('integrity-index', { action: 'district_ranking' }),
    [invoke]
  );

  // ====== Action Logging (Anti-Farming) ======
  const logAction = useCallback(
    async (
      userId: string,
      actionType: string,
      targetId: string,
      targetType: string,
      lat?: number,
      lng?: number
    ) => {
      const { error } = await supabase.from('user_actions').insert({
        user_id: userId,
        action_type: actionType,
        target_id: targetId,
        target_type: targetType,
        lat,
        lng,
      });
      if (error) throw error;
    },
    []
  );

  return {
    // Reputation
    computeReputation,
    // Truth
    computeTruth,
    // Locality
    weightVote,
    checkLocationIntegrity,
    // Procurement
    winRateAnomaly,
    bidRotation,
    hhiIndex,
    executionRisk,
    // Integrity Index
    nationalIndex,
    trendAnalysis,
    districtRanking,
    // Anti-Farming
    logAction,
  };
}
