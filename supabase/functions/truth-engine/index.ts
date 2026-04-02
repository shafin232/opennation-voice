import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ===== Weights for Truth Probability =====
const W_EVIDENCE = 0.35;
const W_TRUST = 0.25;
const W_LOCATION = 0.15;
const W_CONSENSUS = 0.25;

// ===== Legal Risk Factors =====
// LegalRisk = 0.25*N + 0.20*S + 0.25*E + 0.20*T + 0.10*D
function computeLegalRisk(text: string, hasEvidence: boolean): {
  score: number; n: number; s: number; e: number; t: number; d: number;
} {
  // N: Named Entity detection (heuristic: check for proper nouns / common title patterns)
  const namePatterns = /(?:জনাব|মিস্টার|ড\.|প্রফেসর|মন্ত্রী|চেয়ারম্যান|ম্যানেজার|ডাঃ|Mr\.|Mrs\.|Dr\.)\s+\S+/gi;
  const n = namePatterns.test(text) ? 1.0 : 0.0;

  // S: Severity (keywords for serious accusations)
  const severeWords = /খুন|হত্যা|ধর্ষণ|murder|rape|assassination|embezzl|বিলিয়ন|কোটি/gi;
  const moderateWords = /দুর্নীতি|corruption|ঘুষ|bribe|fraud|জালিয়াতি/gi;
  const s = severeWords.test(text) ? 1.0 : moderateWords.test(text) ? 0.6 : 0.2;

  // E: Evidence gap (no evidence = high risk)
  const e = hasEvidence ? 0.2 : 0.9;

  // T: Toxicity (offensive language detection)
  const toxicWords = /শালা|হারামি|বদমাশ|চোর|নষ্ট|bastard|corrupt|thief|criminal/gi;
  const matches = text.match(toxicWords);
  const t = matches ? Math.min(1.0, matches.length * 0.3) : 0.0;

  // D: Direct Accusation
  const directAccusation = /সে করেছে|তিনি করেছেন|he did|she did|they are responsible|দায়ী|অপরাধী/gi;
  const d = directAccusation.test(text) ? 1.0 : 0.0;

  const score = 0.25 * n + 0.20 * s + 0.25 * e + 0.20 * t + 0.10 * d;
  return { score: Math.round(score * 1000) / 1000, n, s, e, t, d };
}

// ===== Evidence Forensics =====
function computeEvidenceStrength(
  evidenceCount: number,
  hasVideo: boolean,
  hasImage: boolean,
  hasDocument: boolean,
  hasLocation: boolean,
  locationDistanceKm: number | null
): { score: number; duplicate_risk: number; location_verified: boolean } {
  let score = 0.1; // baseline for text-only

  if (hasVideo) score = 0.85;
  else if (hasImage && hasDocument) score = 0.75;
  else if (hasImage) score = 0.6;
  else if (hasDocument) score = 0.5;

  // Multiple evidence bonus
  if (evidenceCount > 3) score = Math.min(1.0, score + 0.1);
  if (evidenceCount > 1) score = Math.min(1.0, score + 0.05);

  // Location verification: if GPS and evidence location match within 5km
  let locationVerified = false;
  if (hasLocation && locationDistanceKm !== null) {
    if (locationDistanceKm <= 5) {
      locationVerified = true;
      score = Math.min(1.0, score + 0.05);
    } else {
      // Suspicious: report location far from evidence location
      score = Math.max(0.1, score - 0.2);
    }
  }

  // Duplicate risk placeholder (would need perceptual hashing service)
  const duplicateRisk = 0; // 0 = no duplicates detected

  return { score: Math.round(score * 1000) / 1000, duplicate_risk: duplicateRisk, location_verified: locationVerified };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization") ?? req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller }, error: authErr } = await callerClient.auth.getUser();
    if (authErr || !caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { report_id } = await req.json();

    // Fetch report, evidence, author profile in parallel
    const [reportRes, evidenceRes] = await Promise.all([
      supabase.from("reports").select("*").eq("id", report_id).single(),
      supabase.from("evidence").select("*").eq("report_id", report_id),
    ]);

    const report = reportRes.data;
    if (!report) {
      return new Response(JSON.stringify({ error: "Report not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: authorProfile } = await supabase
      .from("profiles")
      .select("effective_trust, trust_score")
      .eq("user_id", report.author_id)
      .single();

    const evidence = evidenceRes.data ?? [];

    // ===== Step 1: Legal Risk Score =====
    const fullText = `${report.title} ${report.description}`;
    const legalRisk = computeLegalRisk(fullText, evidence.length > 0);

    // ===== Step 2: Evidence Forensics =====
    const hasVideo = evidence.some((e: any) => e.type === "video");
    const hasImage = evidence.some((e: any) => e.type === "image");
    const hasDocument = evidence.some((e: any) => e.type === "document");
    const hasLocation = report.lat !== null && report.lng !== null;

    const evidenceResult = computeEvidenceStrength(
      evidence.length, hasVideo, hasImage, hasDocument, hasLocation, null
    );

    // ===== Step 3: Reporter Trust (T_eff) =====
    const effectiveTrust = (authorProfile?.effective_trust ?? 50) / 100;

    // ===== Step 4: Location Integrity =====
    let locationScore = 0.3; // no GPS = low
    if (hasLocation) {
      locationScore = 0.8;
      // If evidence also has GPS consistency, boost
      if (evidenceResult.location_verified) locationScore = 0.95;
    }

    // ===== Step 5: Community Consensus =====
    const totalVotes = report.support_count + report.doubt_count;
    let communityConsensus = 0.5; // neutral if no votes
    if (totalVotes > 0) {
      communityConsensus = report.support_count / totalVotes;
    }

    // ===== Step 6: Anti-Farming Penalty =====
    const { data: recentActions } = await supabase
      .from("user_actions")
      .select("created_at, user_id")
      .eq("target_id", report_id)
      .order("created_at", { ascending: false })
      .limit(100);

    let botPenalty = 0;
    if (recentActions && recentActions.length > 1) {
      let burstCount = 0;
      for (let i = 1; i < recentActions.length; i++) {
        const gap = (new Date(recentActions[i - 1].created_at).getTime() -
          new Date(recentActions[i].created_at).getTime()) / 1000;
        if (gap < 30) burstCount++;
      }
      botPenalty = (burstCount / recentActions.length) * 0.3;
    }

    // ===== Step 7: Truth Probability Synthesis =====
    // P(truth) = w_e*E + w_t*T + w_l*L + w_c*C - botPenalty
    const truthProbability = Math.max(0, Math.min(1,
      W_EVIDENCE * evidenceResult.score +
      W_TRUST * effectiveTrust +
      W_LOCATION * locationScore +
      W_CONSENSUS * communityConsensus -
      botPenalty
    ));

    // ===== Classification =====
    let classification = "pending_review";
    let status = report.status;
    if (truthProbability >= 0.75) {
      classification = "verified";
      status = "verified";
    } else if (truthProbability < 0.40) {
      classification = "rejected";
      status = "rejected";
    }

    // ===== Approval Decision =====
    // Combine truth + authenticity + trust for approval
    const approvalScore = 0.45 * truthProbability + 0.35 * evidenceResult.score + 0.2 * effectiveTrust;
    let approvalDecision = report.approval_decision;

    // Only auto-decide if still pending
    if (report.approval_decision === "pending") {
      if (approvalScore > 0.75 && legalRisk.score < 0.5) {
        approvalDecision = "auto_approved";
      } else if (approvalScore < 0.35 || legalRisk.score > 0.8) {
        approvalDecision = "auto_rejected";
      } else {
        approvalDecision = "human_review";
      }
    }

    // ===== Update report =====
    await supabase.from("reports").update({
      truth_probability: Math.round(truthProbability * 1000) / 1000,
      authenticity_score: Math.round(evidenceResult.score * 1000) / 1000,
      status,
      approval_decision: approvalDecision,
    }).eq("id", report_id);

    return new Response(
      JSON.stringify({
        report_id,
        truth_probability: Math.round(truthProbability * 1000) / 1000,
        classification,
        authenticity_score: evidenceResult.score,
        approval_score: Math.round(approvalScore * 1000) / 1000,
        approval_decision: approvalDecision,
        legal_risk: legalRisk,
        components: {
          evidence_strength: evidenceResult.score,
          evidence_count: evidence.length,
          has_video: hasVideo,
          has_image: hasImage,
          effective_trust: effectiveTrust,
          location_score: locationScore,
          community_consensus: Math.round(communityConsensus * 1000) / 1000,
          total_votes: totalVotes,
          bot_penalty: Math.round(botPenalty * 1000) / 1000,
          duplicate_risk: evidenceResult.duplicate_risk,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
