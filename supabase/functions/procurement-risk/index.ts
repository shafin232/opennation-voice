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

    const { action, contractor_name, tender_id } = await req.json();

    const { data: allTenders } = await supabase.from("tenders").select("*");
    const tenders = allTenders ?? [];

    if (action === "win_rate_anomaly") {
      if (!contractor_name) {
        return new Response(JSON.stringify({ error: "contractor_name required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const contractorWins: Record<string, number> = {};
      for (const t of tenders) {
        const name = t.awarded_to || "unknown";
        contractorWins[name] = (contractorWins[name] || 0) + 1;
      }

      const totalTenders = tenders.length || 1;
      const winRates = Object.values(contractorWins).map((w) => w / totalTenders);
      const mean = winRates.reduce((a, b) => a + b, 0) / (winRates.length || 1);
      const stdDev = Math.sqrt(
        winRates.reduce((sum, r) => sum + (r - mean) ** 2, 0) / (winRates.length || 1)
      );

      const contractorWinRate = (contractorWins[contractor_name] || 0) / totalTenders;
      const zScore = stdDev > 0 ? (contractorWinRate - mean) / stdDev : 0;
      const anomalyLevel = Math.abs(zScore) > 2.5 ? "critical" : Math.abs(zScore) > 1.5 ? "high" : "normal";

      return new Response(
        JSON.stringify({
          contractor_name, win_rate: Math.round(contractorWinRate * 1000) / 1000,
          z_score: Math.round(zScore * 100) / 100, anomaly_level: anomalyLevel,
          regional_mean: Math.round(mean * 1000) / 1000, regional_std_dev: Math.round(stdDev * 1000) / 1000,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "bid_rotation") {
      const deptTenders: Record<string, string[]> = {};
      for (const t of tenders) {
        const dept = t.department || "unknown";
        if (!deptTenders[dept]) deptTenders[dept] = [];
        deptTenders[dept].push(t.awarded_to || "unknown");
      }

      const results: Array<{ department: string; dominant_contractors: string[]; consistency: number; risk: string }> = [];

      for (const [dept, winners] of Object.entries(deptTenders)) {
        if (winners.length < 3) continue;
        const freq: Record<string, number> = {};
        for (const w of winners) freq[w] = (freq[w] || 0) + 1;
        const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
        const topN = sorted.slice(0, 3);
        const topWins = topN.reduce((s, [, c]) => s + c, 0);
        const concentration = topWins / winners.length;
        const topCounts = topN.map(([, c]) => c);
        const topMean = topCounts.reduce((a, b) => a + b, 0) / topCounts.length;
        const topStd = Math.sqrt(topCounts.reduce((s, c) => s + (c - topMean) ** 2, 0) / topCounts.length);
        const cv = topMean > 0 ? topStd / topMean : 0;
        const risk = concentration > 0.7 && cv < 0.3 ? "high" : concentration > 0.5 ? "medium" : "low";
        results.push({ department: dept, dominant_contractors: topN.map(([name]) => name), consistency: Math.round(concentration * 100) / 100, risk });
      }

      return new Response(JSON.stringify({ departments: results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "hhi_index") {
      const deptAwards: Record<string, Record<string, number>> = {};
      for (const t of tenders) {
        const dept = t.department || "unknown";
        const contractor = t.awarded_to || "unknown";
        if (!deptAwards[dept]) deptAwards[dept] = {};
        deptAwards[dept][contractor] = (deptAwards[dept][contractor] || 0) + 1;
      }

      const hhiResults: Array<{ department: string; hhi: number; risk: string; total_tenders: number }> = [];

      for (const [dept, awards] of Object.entries(deptAwards)) {
        const total = Object.values(awards).reduce((a, b) => a + b, 0);
        if (total < 2) continue;
        let hhi = 0;
        for (const count of Object.values(awards)) {
          const share = count / total;
          hhi += share * share;
        }
        hhi = Math.round(hhi * 10000);
        const risk = hhi > 5000 ? "critical" : hhi > 2500 ? "high" : hhi > 1500 ? "moderate" : "low";
        hhiResults.push({ department: dept, hhi, risk, total_tenders: total });
      }

      return new Response(JSON.stringify({ departments: hhiResults }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "execution_risk") {
      if (!tender_id) {
        return new Response(JSON.stringify({ error: "tender_id required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: tender } = await supabase.from("tenders").select("*").eq("id", tender_id).single();
      if (!tender) {
        return new Response(JSON.stringify({ error: "Tender not found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const costOverrun = tender.estimated_cost > 0 ? (tender.actual_cost - tender.estimated_cost) / tender.estimated_cost : 0;
      const contractorTenders = tenders.filter((t) => t.awarded_to === tender.awarded_to);
      const failedCount = contractorTenders.filter((t) => t.status === "failed" || t.status === "delayed").length;
      const failureRate = contractorTenders.length > 0 ? failedCount / contractorTenders.length : 0;
      const delayedCount = contractorTenders.filter((t) => t.status === "delayed").length;
      const delayTrend = contractorTenders.length > 0 ? delayedCount / contractorTenders.length : 0;

      const executionRisk = Math.min(1, 0.5 * failureRate + 0.3 * Math.min(1, Math.max(0, costOverrun)) + 0.2 * delayTrend);

      await supabase.from("tenders").update({ execution_risk: Math.round(executionRisk * 1000) / 1000 }).eq("id", tender_id);

      return new Response(
        JSON.stringify({
          tender_id, execution_risk: Math.round(executionRisk * 1000) / 1000,
          failure_rate: Math.round(failureRate * 1000) / 1000,
          cost_overrun: Math.round(costOverrun * 1000) / 1000,
          delay_trend: Math.round(delayTrend * 1000) / 1000,
          contractor: tender.awarded_to, total_contractor_tenders: contractorTenders.length,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Unknown action. Use: win_rate_anomaly, bid_rotation, hhi_index, execution_risk" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
