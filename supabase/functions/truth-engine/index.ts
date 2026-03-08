import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: claimsData, error: claimsErr } = await anonClient.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsErr || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { report_id } = await req.json();

    // ---------- Fetch report data ----------
    const { data: report } = await supabase
      .from("reports")
      .select("*")
      .eq("id", report_id)
      .single();

    if (!report) {
      return new Response(JSON.stringify({ error: "Report not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---------- Get author's effective trust ----------
    const { data: authorProfile } = await supabase
      .from("profiles")
      .select("effective_trust")
      .eq("user_id", report.author_id)
      .single();

    const effectiveTrust = (authorProfile?.effective_trust ?? 50) / 100;

    // ---------- Authenticity Score (simplified without actual media forensics) ----------
    // Weights: Duplicate(25%), ImageReuse(20%), Tampering(25%), AI-Gen(20%), LocationMeta(10%)
    const { data: evidence } = await supabase
      .from("evidence")
      .select("*")
      .eq("report_id", report_id);

    const hasEvidence = (evidence?.length ?? 0) > 0;
    const evidenceStrength = hasEvidence ? 0.7 : 0.2;

    // Location metadata bonus
    const hasLocation = report.lat !== null && report.lng !== null;
    const locationMetaBonus = hasLocation ? 1.0 : 0.0;

    // Simplified authenticity (no actual forensics available)
    const authenticityScore =
      0.25 * 0.9 + // Assume no duplicate (0.9)
      0.2 * 0.9 + // Assume no image reuse
      0.25 * 0.85 + // Assume no tampering
      0.2 * 0.85 + // Assume not AI-generated
      0.1 * locationMetaBonus;

    // ---------- Location Integrity Score ----------
    // Compare report GPS with evidence EXIF (simplified)
    let locationScore = 0.5;
    if (hasLocation) {
      locationScore = 0.8; // Has GPS data
    }

    // ---------- Community Consensus ----------
    const totalVotes = report.support_count + report.doubt_count;
    let communityConsensus = 0.5;
    if (totalVotes > 0) {
      communityConsensus = report.support_count / totalVotes;
    }

    // ---------- Anti-Farming: Burst Activity Check ----------
    const { data: recentActions } = await supabase
      .from("user_actions")
      .select("created_at")
      .eq("target_id", report_id)
      .order("created_at", { ascending: false })
      .limit(50);

    let botPenalty = 0;
    if (recentActions && recentActions.length > 1) {
      let burstCount = 0;
      for (let i = 1; i < recentActions.length; i++) {
        const gap =
          (new Date(recentActions[i - 1].created_at).getTime() -
            new Date(recentActions[i].created_at).getTime()) /
          1000;
        if (gap < 30) burstCount++; // <30s = burst
      }
      botPenalty = (burstCount / recentActions.length) * 0.3;
    }

    // ---------- Target Satiation Check ----------
    // If user repeatedly acts on same report, diminish weight
    const { data: userActionsOnTarget } = await supabase
      .from("user_actions")
      .select("id")
      .eq("user_id", claimsData.claims.sub)
      .eq("target_id", report_id);

    const repeatCount = userActionsOnTarget?.length ?? 0;
    const satiationPenalty =
      repeatCount > 1 ? 1 / Math.log(repeatCount + 1) : 0;

    // ---------- Truth Probability ----------
    // P(truth) = Evidence(40%) + Trust(25%) + Location(15%) + Consensus(20%) - BotPenalty
    const truthProbability = Math.max(
      0,
      Math.min(
        1,
        0.4 * evidenceStrength +
          0.25 * effectiveTrust +
          0.15 * locationScore +
          0.2 * communityConsensus -
          botPenalty -
          satiationPenalty * 0.1
      )
    );

    // ---------- Classification ----------
    let classification = "uncertain";
    if (truthProbability > 0.9) classification = "highly_true";
    else if (truthProbability > 0.7) classification = "likely_true";
    else if (truthProbability < 0.4) classification = "false";

    // ---------- Approval Protocol ----------
    // Final = Truth(45%) + Authenticity(35%) + Trust(20%)
    const approvalScore =
      0.45 * truthProbability +
      0.35 * authenticityScore +
      0.2 * effectiveTrust;

    let approvalDecision = "human_review";
    if (approvalScore > 0.75) approvalDecision = "auto_approved";
    else if (approvalScore < 0.4) approvalDecision = "auto_rejected";

    // ---------- Update report ----------
    await supabase
      .from("reports")
      .update({
        truth_probability: Math.round(truthProbability * 1000) / 1000,
        authenticity_score: Math.round(authenticityScore * 1000) / 1000,
        approval_decision: approvalDecision,
      })
      .eq("id", report_id);

    return new Response(
      JSON.stringify({
        report_id,
        truth_probability: Math.round(truthProbability * 1000) / 1000,
        classification,
        authenticity_score: Math.round(authenticityScore * 1000) / 1000,
        approval_score: Math.round(approvalScore * 1000) / 1000,
        approval_decision: approvalDecision,
        components: {
          evidence_strength: evidenceStrength,
          effective_trust: effectiveTrust,
          location_score: locationScore,
          community_consensus: communityConsensus,
          bot_penalty: botPenalty,
          satiation_penalty: satiationPenalty,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
