import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ===== Integrity Points Configuration =====
const POINTS = {
  TRUE_REPORT: 8,
  REPORT_CONFIRMED: 5,
  IDENTITY_VERIFIED: 50,
  ACCOUNT_AGE_PER_30D: 1,
  FALSE_REPORT: -20,
  FALSE_VOTE: -5,
  BOT_BEHAVIOR: -25,
};

const TIERS = [
  { name: "highly_trusted", min: 90, voteWeight: 2.0, label: "অত্যন্ত বিশ্বস্ত" },
  { name: "trusted", min: 70, voteWeight: 1.5, label: "বিশ্বস্ত" },
  { name: "verified", min: 40, voteWeight: 1.0, label: "যাচাইকৃত" },
  { name: "low", min: 20, voteWeight: 0.25, label: "নিম্ন নির্ভরযোগ্যতা" },
  { name: "untrusted", min: 0, voteWeight: 0, label: "অনির্ভরযোগ্য" },
];

function getTier(score: number) {
  return TIERS.find((t) => score >= t.min) ?? TIERS[TIERS.length - 1];
}

const HALF_LIFE_DAYS = 180;
const DECAY_CONSTANT = Math.LN2 / HALF_LIFE_DAYS;
const INITIAL_SCORE = 50;
const MIN_SCORE = 0;
const MAX_SCORE = 100;

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

    // Verify caller
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller }, error: authErr } = await callerClient.auth.getUser();
    if (authErr || !caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { user_id } = await req.json();

    // 1. Get profile & auth user
    const [profileRes, authUserRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user_id).single(),
      supabase.auth.admin.getUserById(user_id),
    ]);

    const profile = profileRes.data;
    const authUser = authUserRes.data?.user;
    if (!profile || !authUser) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Account age bonus: +1 per 30 days
    const accountAgeDays = (Date.now() - new Date(authUser.created_at).getTime()) / (1000 * 60 * 60 * 24);
    const accountAgeBonus = Math.floor(accountAgeDays / 30) * POINTS.ACCOUNT_AGE_PER_30D;

    // 3. Count verified reports (TRUE_REPORT events)
    const { count: verifiedReports } = await supabase
      .from("reports")
      .select("id", { count: "exact", head: true })
      .eq("author_id", user_id)
      .eq("status", "verified");

    const trueReportPoints = (verifiedReports ?? 0) * POINTS.TRUE_REPORT;

    // 4. Count confirmed votes (votes on reports that became verified)
    const { data: userVotes } = await supabase
      .from("votes")
      .select("report_id, vote_type")
      .eq("user_id", user_id)
      .eq("vote_type", "support");

    let confirmedVotePoints = 0;
    if (userVotes && userVotes.length > 0) {
      const reportIds = [...new Set(userVotes.map((v) => v.report_id))];
      const { data: verifiedVotedReports } = await supabase
        .from("reports")
        .select("id")
        .in("id", reportIds)
        .eq("status", "verified");
      confirmedVotePoints = (verifiedVotedReports?.length ?? 0) * POINTS.REPORT_CONFIRMED;
    }

    // 5. Count false reports (rejected)
    const { count: falseReports } = await supabase
      .from("reports")
      .select("id", { count: "exact", head: true })
      .eq("author_id", user_id)
      .eq("approval_decision", "rejected");

    const falseReportPenalty = (falseReports ?? 0) * POINTS.FALSE_REPORT;

    // 6. False votes: votes supporting reports that got rejected
    let falseVotePenalty = 0;
    if (userVotes && userVotes.length > 0) {
      const reportIds = [...new Set(userVotes.map((v) => v.report_id))];
      const { data: rejectedVotedReports } = await supabase
        .from("reports")
        .select("id")
        .in("id", reportIds)
        .eq("approval_decision", "rejected");
      falseVotePenalty = (rejectedVotedReports?.length ?? 0) * POINTS.FALSE_VOTE;
    }

    // 7. Anti-Farming: Burst Detection (30-sec window)
    const { data: recentActions } = await supabase
      .from("user_actions")
      .select("created_at")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .limit(100);

    let burstCount = 0;
    if (recentActions && recentActions.length > 1) {
      for (let i = 1; i < recentActions.length; i++) {
        const gap = (new Date(recentActions[i - 1].created_at).getTime() -
          new Date(recentActions[i].created_at).getTime()) / 1000;
        if (gap < 30) burstCount++;
      }
    }
    // If >20% of actions are bursts, apply BOT_BEHAVIOR penalty
    const burstRatio = recentActions && recentActions.length > 5
      ? burstCount / recentActions.length : 0;
    const botPenalty = burstRatio > 0.2 ? POINTS.BOT_BEHAVIOR : 0;

    // 8. Temporal Decay on raw score
    let decayedActionSum = 0;
    let totalActionWeight = 0;
    for (const action of recentActions ?? []) {
      const ageDays = (Date.now() - new Date(action.created_at).getTime()) / (1000 * 60 * 60 * 24);
      const decayFactor = Math.exp(-DECAY_CONSTANT * ageDays);
      decayedActionSum += decayFactor;
      totalActionWeight += 1;
    }
    // Decay multiplier: ratio of decayed sum to total (measures recency of activity)
    const activityDecay = totalActionWeight > 0 ? decayedActionSum / totalActionWeight : 0.5;

    // 9. Confidence Saturator: C(n) = n / (n + 10)
    const totalActions = totalActionWeight;
    const confidence = totalActions / (totalActions + 10);

    // 10. Maturity Multiplier
    let maturityMultiplier = 1.0;
    if (accountAgeDays > 180) maturityMultiplier = 1.1;
    else if (accountAgeDays < 7) maturityMultiplier = 0.7;

    // 11. Calculate raw reputation points
    const rawPoints = INITIAL_SCORE
      + trueReportPoints
      + confirmedVotePoints
      + accountAgeBonus
      + falseReportPenalty  // negative
      + falseVotePenalty    // negative
      + botPenalty;         // negative

    // 12. Apply modifiers: Effective Trust = clamp(rawPoints * confidence * maturity * activityDecay)
    const effectiveTrust = Math.min(MAX_SCORE, Math.max(MIN_SCORE,
      rawPoints * confidence * maturityMultiplier * activityDecay
    ));

    // Round
    const finalScore = Math.round(effectiveTrust * 100) / 100;
    const tier = getTier(finalScore);

    // 13. Update profile
    await supabase
      .from("profiles")
      .update({
        reputation_raw: Math.round(Math.min(MAX_SCORE, Math.max(MIN_SCORE, rawPoints))),
        effective_trust: finalScore,
        trust_score: Math.round(finalScore),
      })
      .eq("user_id", user_id);

    return new Response(
      JSON.stringify({
        user_id,
        reputation_raw: Math.round(Math.min(MAX_SCORE, Math.max(MIN_SCORE, rawPoints))),
        effective_trust: finalScore,
        tier: tier.name,
        tier_label: tier.label,
        vote_weight: tier.voteWeight,
        breakdown: {
          initial: INITIAL_SCORE,
          true_reports: { count: verifiedReports ?? 0, points: trueReportPoints },
          confirmed_votes: { points: confirmedVotePoints },
          account_age: { days: Math.round(accountAgeDays), bonus: accountAgeBonus },
          false_reports: { count: falseReports ?? 0, penalty: falseReportPenalty },
          false_votes: { penalty: falseVotePenalty },
          bot_detection: { burst_ratio: Math.round(burstRatio * 100) / 100, penalty: botPenalty },
          confidence,
          maturity_multiplier: maturityMultiplier,
          activity_decay: Math.round(activityDecay * 1000) / 1000,
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
