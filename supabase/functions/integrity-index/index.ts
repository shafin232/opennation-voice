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

    const { action, weight_by } = await req.json();

    // Fetch all district integrity metrics
    const { data: districts } = await supabase
      .from("integrity_metrics")
      .select("*");

    const allDistricts = districts ?? [];

    if (action === "national_index") {
      // ---------- National Integrity Index (NII) ----------

      // Volume Threshold: exclude districts with < 50 reports
      let eligible = allDistricts.filter((d) => d.total_reports >= 50);

      // Anomaly Filter: Z-score > 2.5 excluded (unless > 10% of national pop)
      const scores = eligible.map((d) => d.trust_score);
      const mean =
        scores.reduce((a, b) => a + b, 0) / (scores.length || 1);
      const stdDev = Math.sqrt(
        scores.reduce((s, v) => s + (v - mean) ** 2, 0) /
          (scores.length || 1)
      );

      const totalReports = eligible.reduce(
        (s, d) => s + d.total_reports,
        0
      );

      eligible = eligible.filter((d) => {
        const z = stdDev > 0 ? Math.abs(d.trust_score - mean) / stdDev : 0;
        const reportShare = totalReports > 0 ? d.total_reports / totalReports : 0;
        // Keep if Z < 2.5 OR represents > 10% of volume
        return z <= 2.5 || reportShare > 0.1;
      });

      // Weighted Aggregation
      const useReportVolume = weight_by === "volume";
      let weightedSum = 0;
      let totalWeight = 0;

      for (const d of eligible) {
        const w = useReportVolume ? d.total_reports : 1; // population weight = 1 (equal) or report volume
        weightedSum += d.trust_score * w;
        totalWeight += w;
      }

      const nii = totalWeight > 0 ? weightedSum / totalWeight : 0;

      return new Response(
        JSON.stringify({
          national_integrity_index: Math.round(nii * 100) / 100,
          eligible_districts: eligible.length,
          excluded_districts: allDistricts.length - eligible.length,
          weight_method: useReportVolume ? "report_volume" : "equal",
          mean_score: Math.round(mean * 100) / 100,
          std_dev: Math.round(stdDev * 100) / 100,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "trend_analysis") {
      // ---------- Trend Analysis ----------
      // YoY change, 3-period SMA, 6-period volatility
      // Simplified: use district trust_score history (currently single snapshot)
      // In production, would need a time-series table

      const districtTrends = allDistricts.map((d) => {
        // Simulated: using current trust_score as latest data point
        const currentScore = d.trust_score;
        const resolvedRate =
          d.total_reports > 0
            ? d.resolved_reports / d.total_reports
            : 0;

        return {
          district: d.district,
          current_score: currentScore,
          resolved_rate: Math.round(resolvedRate * 1000) / 1000,
          rti_response_rate: d.rti_response_rate,
          active_projects: d.active_projects,
          // These would use historical data in production:
          yoy_change: null,
          sma_3: currentScore, // single point = itself
          volatility_6: 0, // single point = no volatility
        };
      });

      return new Response(
        JSON.stringify({
          districts: districtTrends,
          note: "YoY and volatility require historical time-series data. Currently showing snapshot.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "district_ranking") {
      // ---------- District Ranking ----------
      const ranked = allDistricts
        .filter((d) => d.total_reports >= 10) // minimum threshold
        .map((d) => ({
          district: d.district,
          trust_score: d.trust_score,
          truth_score: d.truth_score,
          composite:
            0.4 * d.trust_score +
            0.3 * d.truth_score +
            0.15 * (d.rti_response_rate * 100) +
            0.15 *
              (d.total_reports > 0
                ? (d.resolved_reports / d.total_reports) * 100
                : 0),
          total_reports: d.total_reports,
          resolved_reports: d.resolved_reports,
        }))
        .sort((a, b) => b.composite - a.composite);

      return new Response(
        JSON.stringify({ ranking: ranked }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        error: "Unknown action. Use: national_index, trend_analysis, district_ranking",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
