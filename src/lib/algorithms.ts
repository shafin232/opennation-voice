import { supabase } from '@/integrations/supabase/client';

/**
 * Algorithm engine utilities for OpenNation.
 * All algorithms run server-side via Edge Functions.
 * These are plain async functions, NOT hooks.
 */

async function invoke(fnName: string, body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke(fnName, { body });
  if (error) throw error;
  return data;
}

// ====== Reputation & Trust Engine ======
export const computeReputation = (userId: string) =>
  invoke('reputation-engine', { user_id: userId });

// ====== Truth & Authenticity Verification ======
export const computeTruth = (reportId: string) =>
  invoke('truth-engine', { report_id: reportId });

// ====== Locality Engine ======
export const weightVote = (
  reportId: string,
  voterLat?: number,
  voterLng?: number,
  voterDistrict?: string
) =>
  invoke('locality-engine', {
    action: 'weight_vote',
    report_id: reportId,
    voter_lat: voterLat,
    voter_lng: voterLng,
    voter_district: voterDistrict,
  });

export const checkLocationIntegrity = (reportId: string) =>
  invoke('locality-engine', { action: 'location_integrity', report_id: reportId });

// ====== Procurement Risk ======
export const winRateAnomaly = (contractorName: string) =>
  invoke('procurement-risk', { action: 'win_rate_anomaly', contractor_name: contractorName });

export const bidRotation = () =>
  invoke('procurement-risk', { action: 'bid_rotation' });

export const hhiIndex = () =>
  invoke('procurement-risk', { action: 'hhi_index' });

export const executionRisk = (tenderId: string) =>
  invoke('procurement-risk', { action: 'execution_risk', tender_id: tenderId });

// ====== National Integrity Index ======
export const nationalIndex = (weightBy: 'volume' | 'equal' = 'volume') =>
  invoke('integrity-index', { action: 'national_index', weight_by: weightBy });

export const trendAnalysis = () =>
  invoke('integrity-index', { action: 'trend_analysis' });

export const districtRanking = () =>
  invoke('integrity-index', { action: 'district_ranking' });

// ====== Action Logging (Anti-Farming) ======
export const logAction = async (
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
};
