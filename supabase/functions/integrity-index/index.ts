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

    const { action, weight_by } = await req.json();
    const { data: districts } = await supabase.from("integrity_metrics").select("*");
    const allDistricts = districts ?? [];

    // ===== National Integrity Index (NII) =====
    if (action === "national_index") {
      // Step 1: Filter districts with minimum report threshold
      const MIN_REPORTS = 10;
      let eligible = allDistricts.filter((d) => d.total_reports >= MIN_REPORTS);

      if (eligible.length === 0) {
        // Fallback: use all districts if none meet threshold
        eligible = [...allDistricts];
      }

      // Step 2: Calculate composite score per district
      const compositeScores = eligible.map((d) => {
        const resolvedRate = d.total_reports > 0 ? d.resolved_reports / d.total_reports : 0;
        return {
          ...d,
          composite: 0.35 * d.trust_score + 0.25 * d.truth_score +
            0.20 * (d.rti_response_rate * 100) +
            0.20 * (resolvedRate * 100),
        };
      });

      // Step 3: Outlier detection (Z-score > 2.5 excluded unless >10% report share)
      const scores = compositeScores.map((d) => d.composite);
      const mean = scores.reduce((a, b) => a + b, 0) / (scores.length || 1);
      const stdDev = Math.sqrt(
        scores.reduce((s, v) => s + (v - mean) ** 2, 0) / (scores.length || 1)
      );
      const totalReports = compositeScores.reduce((s, d) => s + d.total_reports, 0);

      const filtered = compositeScores.filter((d) => {
        const z = stdDev > 0 ? Math.abs(d.composite - mean) / stdDev : 0;
        const reportShare = totalReports > 0 ? d.total_reports / totalReports : 0;
        return z <= 2.5 || reportShare > 0.1;
      });

      const outliers = compositeScores.filter((d) => !filtered.includes(d));

      // Step 4: Weighted average NII
      const useVolume = weight_by === "volume";
      let weightedSum = 0;
      let totalWeight = 0;

      for (const d of filtered) {
        const w = useVolume ? d.total_reports : 1;
        weightedSum += d.composite * w;
        totalWeight += w;
      }

      const nii = totalWeight > 0 ? weightedSum / totalWeight : 0;

      // Step 5: Confidence interval
      const filteredScores = filtered.map((d) => d.composite);
      const filteredMean = filteredScores.reduce((a, b) => a + b, 0) / (filteredScores.length || 1);
      const filteredStd = Math.sqrt(
        filteredScores.reduce((s, v) => s + (v - filteredMean) ** 2, 0) / (filteredScores.length || 1)
      );
      const marginOfError = filteredScores.length > 0 ? 1.96 * filteredStd / Math.sqrt(filteredScores.length) : 0;

      return new Response(
        JSON.stringify({
          national_integrity_index: Math.round(nii * 100) / 100,
          confidence_interval: {
            lower: Math.round((nii - marginOfError) * 100) / 100,
            upper: Math.round((nii + marginOfError) * 100) / 100,
          },
          eligible_districts: filtered.length,
          excluded_outliers: outliers.map((d) => d.district),
          total_districts: allDistricts.length,
          weight_method: useVolume ? "report_volume" : "equal",
          mean_composite: Math.round(mean * 100) / 100,
          std_dev: Math.round(stdDev * 100) / 100,
          total_reports_nationwide: totalReports,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ===== Trend Analysis =====
    if (action === "trend_analysis") {
      const districtTrends = allDistricts.map((d) => {
        const resolvedRate = d.total_reports > 0 ? d.resolved_reports / d.total_reports : 0;
        const verifiedRate = d.total_reports > 0 ? d.verified_reports / d.total_reports : 0;

        // Composite score
        const composite = 0.35 * d.trust_score + 0.25 * d.truth_score +
          0.20 * (d.rti_response_rate * 100) + 0.20 * (resolvedRate * 100);

        // Health indicator
        let health = "stable";
        if (composite > 70) health = "good";
        else if (composite < 30) health = "critical";
        else if (composite < 50) health = "concerning";

        return {
          district: d.district,
          trust_score: d.trust_score,
          truth_score: d.truth_score,
          composite: Math.round(composite * 100) / 100,
          resolved_rate: Math.round(resolvedRate * 1000) / 1000,
          verified_rate: Math.round(verifiedRate * 1000) / 1000,
          rti_response_rate: d.rti_response_rate,
          active_projects: d.active_projects,
          total_reports: d.total_reports,
          health,
        };
      }).sort((a, b) => b.composite - a.composite);

      // National averages
      const avgTrust = allDistricts.reduce((s, d) => s + d.trust_score, 0) / (allDistricts.length || 1);
      const avgTruth = allDistricts.reduce((s, d) => s + d.truth_score, 0) / (allDistricts.length || 1);

      return new Response(
        JSON.stringify({
          districts: districtTrends,
          national_averages: {
            trust: Math.round(avgTrust * 100) / 100,
            truth: Math.round(avgTruth * 100) / 100,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ===== District Ranking =====
    if (action === "district_ranking") {
      const MIN_REPORTS_RANKING = 5;
      const ranked = allDistricts
        .filter((d) => d.total_reports >= MIN_REPORTS_RANKING)
        .map((d) => {
          const resolvedRate = d.total_reports > 0 ? d.resolved_reports / d.total_reports : 0;
          const verifiedRate = d.total_reports > 0 ? d.verified_reports / d.total_reports : 0;
          const composite = 0.35 * d.trust_score + 0.25 * d.truth_score +
            0.20 * (d.rti_response_rate * 100) + 0.20 * (resolvedRate * 100);

          return {
            district: d.district,
            trust_score: d.trust_score,
            truth_score: d.truth_score,
            composite: Math.round(composite * 100) / 100,
            resolved_rate: Math.round(resolvedRate * 1000) / 1000,
            verified_rate: Math.round(verifiedRate * 1000) / 1000,
            rti_response_rate: d.rti_response_rate,
            total_reports: d.total_reports,
            active_projects: d.active_projects,
          };
        })
        .sort((a, b) => b.composite - a.composite)
        .map((d, i) => ({ ...d, rank: i + 1 }));

      return new Response(JSON.stringify({ ranking: ranked, total_eligible: ranked.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ error: "Unknown action. Use: national_index, trend_analysis, district_ranking" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
