import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization") ?? req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { user_id } = await req.json();

    // 1. Get user profile & auth metadata
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user_id)
      .single();

    const { data: authUser } = await supabase.auth.admin.getUserById(user_id);

    if (!profile || !authUser?.user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Count total actions
    const { count: totalActions } = await supabase
      .from("user_actions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user_id);

    const n = totalActions ?? 0;

    // 3. Confidence Saturator: C(n) = n / (n + 10)
    const confidence = n / (n + 10);

    // 4. Raw reputation
    const rawReputation = profile.reputation_raw ?? 50;

    // 5. Maturity Adjustment
    const createdAt = new Date(authUser.user.created_at);
    const accountAgeDays = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    let maturityMultiplier = 1.0;
    if (accountAgeDays > 180) maturityMultiplier = 1.1;
    else if (accountAgeDays < 7) maturityMultiplier = 0.7;

    // 6. Temporal Decay (180-day half-life)
    const { data: recentActions } = await supabase
      .from("user_actions")
      .select("created_at, weight")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .limit(200);

    const HALF_LIFE_DAYS = 180;
    const decayConstant = Math.LN2 / HALF_LIFE_DAYS;
    const now = Date.now();

    let decayedReputationSum = 0;
    for (const action of recentActions ?? []) {
      const ageDays = (now - new Date(action.created_at).getTime()) / (1000 * 60 * 60 * 24);
      const decayFactor = Math.exp(-decayConstant * ageDays);
      decayedReputationSum += (action.weight ?? 1) * decayFactor;
    }

    // 7. Diminishing Returns
    let diminishingFactor = 1.0;
    if (n > 50) diminishingFactor = 1 / Math.log(n);

    // 8. Final Effective Trust
    const effectiveTrust = Math.min(
      100,
      Math.max(0, confidence * rawReputation * maturityMultiplier * diminishingFactor)
    );

    // 9. Update profile
    await supabase
      .from("profiles")
      .update({
        effective_trust: Math.round(effectiveTrust * 100) / 100,
        trust_score: Math.round(effectiveTrust),
      })
      .eq("user_id", user_id);

    return new Response(
      JSON.stringify({
        user_id,
        effective_trust: Math.round(effectiveTrust * 100) / 100,
        confidence,
        maturity_multiplier: maturityMultiplier,
        diminishing_factor: diminishingFactor,
        account_age_days: Math.round(accountAgeDays),
        total_actions: n,
        decayed_reputation_sum: Math.round(decayedReputationSum * 100) / 100,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
