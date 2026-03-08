import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function geoWeight(distanceKm: number, sameDistrict: boolean): number {
  if (distanceKm < 0.5) return 1.0;
  if (distanceKm < 2) return 0.8;
  if (distanceKm < 10) return 0.5;
  if (sameDistrict) return 0.3;
  return 0.1;
}

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

    const { action, report_id, voter_lat, voter_lng, voter_district } = await req.json();

    if (action === "weight_vote") {
      const { data: report } = await supabase
        .from("reports")
        .select("lat, lng, district")
        .eq("id", report_id)
        .single();

      if (!report || !report.lat || !report.lng) {
        return new Response(
          JSON.stringify({ weight: 0.3, reason: "Report has no GPS, using district match" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: localActions } = await supabase
        .from("user_actions")
        .select("lat, lng")
        .eq("target_id", report_id)
        .not("lat", "is", null);

      const hasLocalWitnesses = (localActions ?? []).some((a) => {
        if (!a.lat || !a.lng) return false;
        return haversineKm(report.lat!, report.lng!, a.lat, a.lng) < 2;
      });

      let distance = Infinity;
      if (voter_lat && voter_lng) {
        distance = haversineKm(report.lat, report.lng, voter_lat, voter_lng);
      }

      const sameDistrict = voter_district?.toLowerCase() === report.district?.toLowerCase();

      if (hasLocalWitnesses && !sameDistrict && distance > 10) {
        return new Response(
          JSON.stringify({
            weight: 0.05,
            reason: "Digital carpetbagging protection",
            distance_km: Math.round(distance * 10) / 10,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const weight = geoWeight(distance, sameDistrict);

      return new Response(
        JSON.stringify({
          weight,
          distance_km: distance === Infinity ? null : Math.round(distance * 10) / 10,
          same_district: sameDistrict,
          has_local_witnesses: hasLocalWitnesses,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "location_integrity") {
      const { data: report } = await supabase
        .from("reports")
        .select("lat, lng")
        .eq("id", report_id)
        .single();

      const { data: evidenceList } = await supabase
        .from("evidence")
        .select("*")
        .eq("report_id", report_id);

      let locationIntegrity = 0.5;
      if (report?.lat && report?.lng) locationIntegrity = 0.8;

      return new Response(
        JSON.stringify({
          report_id,
          location_integrity: locationIntegrity,
          has_gps: !!(report?.lat && report?.lng),
          evidence_count: evidenceList?.length ?? 0,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Unknown action. Use: weight_vote, location_integrity" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
