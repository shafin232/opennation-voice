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

    const { action, contractor_name, tender_id } = await req.json();
    const { data: allTenders } = await supabase.from("tenders").select("*");
    const tenders = allTenders ?? [];

    // ===== Win-Rate Anomaly (Z-Score Analysis) =====
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
      const variance = winRates.reduce((sum, r) => sum + (r - mean) ** 2, 0) / (winRates.length || 1);
      const stdDev = Math.sqrt(variance);

      const contractorWinRate = (contractorWins[contractor_name] || 0) / totalTenders;
      const zScore = stdDev > 0 ? (contractorWinRate - mean) / stdDev : 0;

      let anomalyLevel = "normal";
      if (Math.abs(zScore) > 3.0) anomalyLevel = "critical";
      else if (Math.abs(zScore) > 2.5) anomalyLevel = "high";
      else if (Math.abs(zScore) > 1.5) anomalyLevel = "elevated";

      // Update tender win_rate_anomaly scores for this contractor
      if (Math.abs(zScore) > 1.5) {
        const contractorTenderIds = tenders
          .filter((t) => t.awarded_to === contractor_name)
          .map((t) => t.id);
        for (const id of contractorTenderIds) {
          await supabase.from("tenders").update({
            win_rate_anomaly: Math.round(zScore * 100) / 100,
          }).eq("id", id);
        }
      }

      return new Response(
        JSON.stringify({
          contractor_name,
          total_wins: contractorWins[contractor_name] || 0,
          total_tenders: totalTenders,
          win_rate: Math.round(contractorWinRate * 10000) / 10000,
          z_score: Math.round(zScore * 100) / 100,
          anomaly_level: anomalyLevel,
          regional_mean: Math.round(mean * 10000) / 10000,
          regional_std_dev: Math.round(stdDev * 10000) / 10000,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ===== Bid Rotation Detection =====
    if (action === "bid_rotation") {
      const deptTenders: Record<string, { winners: string[]; tenderIds: string[] }> = {};
      for (const t of tenders) {
        const dept = t.department || "unknown";
        if (!deptTenders[dept]) deptTenders[dept] = { winners: [], tenderIds: [] };
        deptTenders[dept].winners.push(t.awarded_to || "unknown");
        deptTenders[dept].tenderIds.push(t.id);
      }

      const results: Array<{
        department: string; dominant_contractors: string[];
        concentration: number; cv: number; risk: string; pattern: string;
      }> = [];

      for (const [dept, { winners }] of Object.entries(deptTenders)) {
        if (winners.length < 3) continue;

        const freq: Record<string, number> = {};
        for (const w of winners) freq[w] = (freq[w] || 0) + 1;
        const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
        const topN = sorted.slice(0, 3);
        const topWins = topN.reduce((s, [, c]) => s + c, 0);
        const concentration = topWins / winners.length;

        // Coefficient of Variation for top contractors
        const topCounts = topN.map(([, c]) => c);
        const topMean = topCounts.reduce((a, b) => a + b, 0) / topCounts.length;
        const topStd = Math.sqrt(topCounts.reduce((s, c) => s + (c - topMean) ** 2, 0) / topCounts.length);
        const cv = topMean > 0 ? topStd / topMean : 0;

        // Pattern detection: rotation = high concentration + low CV (turns being taken)
        let risk = "low";
        let pattern = "competitive";
        if (concentration > 0.8 && cv < 0.2) {
          risk = "critical";
          pattern = "suspected_rotation";
        } else if (concentration > 0.7 && cv < 0.3) {
          risk = "high";
          pattern = "possible_rotation";
        } else if (concentration > 0.5) {
          risk = "medium";
          pattern = "moderate_concentration";
        }

        results.push({
          department: dept,
          dominant_contractors: topN.map(([name]) => name),
          concentration: Math.round(concentration * 1000) / 1000,
          cv: Math.round(cv * 1000) / 1000,
          risk,
          pattern,
        });
      }

      return new Response(JSON.stringify({ departments: results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ===== HHI Index (Cronyism Detection) =====
    if (action === "hhi_index") {
      const deptAwards: Record<string, Record<string, number>> = {};
      for (const t of tenders) {
        const dept = t.department || "unknown";
        const contractor = t.awarded_to || "unknown";
        if (!deptAwards[dept]) deptAwards[dept] = {};
        deptAwards[dept][contractor] = (deptAwards[dept][contractor] || 0) + 1;
      }

      const hhiResults: Array<{
        department: string; hhi: number; risk: string;
        total_tenders: number; unique_contractors: number;
      }> = [];

      for (const [dept, awards] of Object.entries(deptAwards)) {
        const total = Object.values(awards).reduce((a, b) => a + b, 0);
        if (total < 2) continue;

        // HHI = sum of squared market shares (scaled to 10,000)
        let hhi = 0;
        for (const count of Object.values(awards)) {
          const share = count / total;
          hhi += share * share;
        }
        hhi = Math.round(hhi * 10000);

        let risk = "low";
        if (hhi > 6000) risk = "critical";
        else if (hhi > 4000) risk = "high";
        else if (hhi > 2500) risk = "moderate";

        // Update tenders in this department
        if (risk !== "low") {
          const deptTenderIds = tenders.filter((t) => t.department === dept).map((t) => t.id);
          for (const id of deptTenderIds) {
            await supabase.from("tenders").update({ hhi_index: hhi / 10000 }).eq("id", id);
          }
        }

        hhiResults.push({
          department: dept, hhi, risk, total_tenders: total,
          unique_contractors: Object.keys(awards).length,
        });
      }

      return new Response(JSON.stringify({ departments: hhiResults }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ===== Execution Risk =====
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

      // Cost overrun ratio
      const costOverrun = tender.estimated_cost > 0
        ? (tender.actual_cost - tender.estimated_cost) / tender.estimated_cost : 0;

      // Contractor track record
      const contractorTenders = tenders.filter((t) => t.awarded_to === tender.awarded_to);
      const failedCount = contractorTenders.filter((t) =>
        t.status === "failed" || t.status === "delayed" || t.status === "abandoned"
      ).length;
      const failureRate = contractorTenders.length > 0 ? failedCount / contractorTenders.length : 0;

      // Delay trend
      const delayedCount = contractorTenders.filter((t) => t.status === "delayed").length;
      const delayTrend = contractorTenders.length > 0 ? delayedCount / contractorTenders.length : 0;

      // Cost anomaly: compare to similar department tenders
      const deptTenders = tenders.filter((t) => t.department === tender.department && t.id !== tender.id);
      let costAnomaly = 0;
      if (deptTenders.length > 2) {
        const deptCosts = deptTenders.map((t) => t.estimated_cost > 0 ? t.actual_cost / t.estimated_cost : 1);
        const deptMean = deptCosts.reduce((a, b) => a + b, 0) / deptCosts.length;
        const deptStd = Math.sqrt(deptCosts.reduce((s, c) => s + (c - deptMean) ** 2, 0) / deptCosts.length);
        const tenderRatio = tender.estimated_cost > 0 ? tender.actual_cost / tender.estimated_cost : 1;
        costAnomaly = deptStd > 0 ? Math.abs(tenderRatio - deptMean) / deptStd : 0;
      }

      // Composite execution risk
      const executionRisk = Math.min(1, Math.max(0,
        0.35 * failureRate +
        0.25 * Math.min(1, Math.max(0, costOverrun)) +
        0.20 * delayTrend +
        0.20 * Math.min(1, costAnomaly / 3)
      ));

      await supabase.from("tenders").update({
        execution_risk: Math.round(executionRisk * 1000) / 1000,
      }).eq("id", tender_id);

      return new Response(
        JSON.stringify({
          tender_id,
          execution_risk: Math.round(executionRisk * 1000) / 1000,
          failure_rate: Math.round(failureRate * 1000) / 1000,
          cost_overrun: Math.round(costOverrun * 1000) / 1000,
          delay_trend: Math.round(delayTrend * 1000) / 1000,
          cost_anomaly_z: Math.round(costAnomaly * 100) / 100,
          contractor: tender.awarded_to,
          total_contractor_tenders: contractorTenders.length,
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
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
