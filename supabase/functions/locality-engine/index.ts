import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Haversine distance in km
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

// Geographic vote weight based on distance from report
function geoWeight(distanceKm: number, sameDistrict: boolean): number {
  if (distanceKm <= 0.5) return 1.0;   // Within 500m - full weight
  if (distanceKm <= 2) return 0.85;     // Within 2km - high weight
  if (distanceKm <= 5) return 0.6;      // Within 5km - moderate
  if (distanceKm <= 10) return 0.4;     // Within 10km - reduced
  if (sameDistrict) return 0.3;         // Same district but far
  if (distanceKm <= 50) return 0.15;    // Neighboring area
  return 0.05;                          // Very far - minimal weight
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

    const { action, report_id, voter_lat, voter_lng, voter_district } = await req.json();

    if (action === "weight_vote") {
      const { data: report } = await supabase
        .from("reports")
        .select("lat, lng, district")
        .eq("id", report_id)
        .single();

      if (!report) {
        return new Response(JSON.stringify({ error: "Report not found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // If report has no GPS, fall back to district matching
      if (!report.lat || !report.lng) {
        const sameDistrict = voter_district?.toLowerCase() === report.district?.toLowerCase();
        return new Response(
          JSON.stringify({
            weight: sameDistrict ? 0.5 : 0.15,
            reason: sameDistrict ? "Same district (no GPS)" : "Different district (no GPS)",
            distance_km: null,
            same_district: sameDistrict,
            carpetbagging_detected: false,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check for local witnesses (votes from within 2km)
      const { data: localActions } = await supabase
        .from("user_actions")
        .select("lat, lng")
        .eq("target_id", report_id)
        .not("lat", "is", null);

      const localWitnessCount = (localActions ?? []).filter((a: any) => {
        if (!a.lat || !a.lng) return false;
        return haversineKm(report.lat!, report.lng!, a.lat, a.lng) < 2;
      }).length;

      const hasLocalWitnesses = localWitnessCount >= 3;

      // Calculate voter distance
      let distance = Infinity;
      if (voter_lat && voter_lng) {
        distance = haversineKm(report.lat, report.lng, voter_lat, voter_lng);
      }

      const sameDistrict = voter_district?.toLowerCase() === report.district?.toLowerCase();

      // Digital Carpetbagging Protection:
      // If there are local witnesses AND this voter is far AND not from same district
      let carpetbaggingDetected = false;
      if (hasLocalWitnesses && !sameDistrict && distance > 10) {
        carpetbaggingDetected = true;
        return new Response(
          JSON.stringify({
            weight: 0.02,
            reason: "Digital carpetbagging protection - local witnesses present, remote vote suppressed",
            distance_km: Math.round(distance * 10) / 10,
            same_district: false,
            local_witness_count: localWitnessCount,
            carpetbagging_detected: true,
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
          local_witness_count: localWitnessCount,
          carpetbagging_detected: false,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "location_integrity") {
      const { data: report } = await supabase
        .from("reports")
        .select("lat, lng, district")
        .eq("id", report_id)
        .single();

      const { data: evidenceList } = await supabase
        .from("evidence")
        .select("*")
        .eq("report_id", report_id);

      const hasGps = !!(report?.lat && report?.lng);
      const evidenceCount = evidenceList?.length ?? 0;

      // Location integrity score
      let locationIntegrity = 0.3; // no GPS baseline
      if (hasGps) {
        locationIntegrity = 0.7;
        if (evidenceCount > 0) locationIntegrity = 0.85;
        if (evidenceCount > 2) locationIntegrity = 0.95;
      }

      return new Response(
        JSON.stringify({
          report_id,
          location_integrity: locationIntegrity,
          has_gps: hasGps,
          evidence_count: evidenceCount,
          district: report?.district ?? null,
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
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
