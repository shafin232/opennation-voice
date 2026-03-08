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

    const { action, weight_by } = await req.json();

    const { data: districts } = await supabase.from("integrity_metrics").select("*");
    const allDistricts = districts ?? [];

    if (action === "national_index") {
      let eligible = allDistricts.filter((d) => d.total_reports >= 50);
      const scores = eligible.map((d) => d.trust_score);
      const mean = scores.reduce((a, b) => a + b, 0) / (scores.length || 1);
      const stdDev = Math.sqrt(scores.reduce((s, v) => s + (v - mean) ** 2, 0) / (scores.length || 1));
      const totalReports = eligible.reduce((s, d) => s + d.total_reports, 0);

      eligible = eligible.filter((d) => {
        const z = stdDev > 0 ? Math.abs(d.trust_score - mean) / stdDev : 0;
        const reportShare = totalReports > 0 ? d.total_reports / totalReports : 0;
        return z <= 2.5 || reportShare > 0.1;
      });

      const useReportVolume = weight_by === "volume";
      let weightedSum = 0;
      let totalWeight = 0;

      for (const d of eligible) {
        const w = useReportVolume ? d.total_reports : 1;
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
      const districtTrends = allDistricts.map((d) => {
        const resolvedRate = d.total_reports > 0 ? d.resolved_reports / d.total_reports : 0;
        return {
          district: d.district, current_score: d.trust_score,
          resolved_rate: Math.round(resolvedRate * 1000) / 1000,
          rti_response_rate: d.rti_response_rate, active_projects: d.active_projects,
          yoy_change: null, sma_3: d.trust_score, volatility_6: 0,
        };
      });

      return new Response(
        JSON.stringify({ districts: districtTrends, note: "YoY and volatility require historical data." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "district_ranking") {
      const ranked = allDistricts
        .filter((d) => d.total_reports >= 10)
        .map((d) => ({
          district: d.district, trust_score: d.trust_score, truth_score: d.truth_score,
          composite: 0.4 * d.trust_score + 0.3 * d.truth_score +
            0.15 * (d.rti_response_rate * 100) +
            0.15 * (d.total_reports > 0 ? (d.resolved_reports / d.total_reports) * 100 : 0),
          total_reports: d.total_reports, resolved_reports: d.resolved_reports,
        }))
        .sort((a, b) => b.composite - a.composite);

      return new Response(JSON.stringify({ ranking: ranked }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ error: "Unknown action. Use: national_index, trend_analysis, district_ranking" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
