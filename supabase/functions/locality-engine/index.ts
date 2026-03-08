import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Haversine distance in km
function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
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

// Geographic Vote Weight
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

    const { action, report_id, voter_lat, voter_lng, voter_district } =
      await req.json();

    if (action === "weight_vote") {
      // ---------- Geographic Vote Weighting ----------
      const { data: report } = await supabase
        .from("reports")
        .select("lat, lng, district")
        .eq("id", report_id)
        .single();

      if (!report || !report.lat || !report.lng) {
        return new Response(
          JSON.stringify({
            weight: 0.3,
            reason: "Report has no GPS, using district match",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Locality Safeguard: Check if local witnesses exist
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

      const sameDistrict =
        voter_district?.toLowerCase() === report.district?.toLowerCase();

      // If local witnesses exist and voter is outside district, apply carpetbagging protection
      if (hasLocalWitnesses && !sameDistrict && distance > 10) {
        return new Response(
          JSON.stringify({
            weight: 0.05,
            reason: "Digital carpetbagging protection: local witnesses present, outside district vote suppressed",
            distance_km: Math.round(distance * 10) / 10,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const weight = geoWeight(distance, sameDistrict);

      return new Response(
        JSON.stringify({
          weight,
          distance_km:
            distance === Infinity ? null : Math.round(distance * 10) / 10,
          same_district: sameDistrict,
          has_local_witnesses: hasLocalWitnesses,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "location_integrity") {
      // ---------- Location Integrity Score ----------
      const { data: report } = await supabase
        .from("reports")
        .select("lat, lng")
        .eq("id", report_id)
        .single();

      const { data: evidenceList } = await supabase
        .from("evidence")
        .select("*")
        .eq("report_id", report_id);

      let locationIntegrity = 0.5; // default neutral
      if (report?.lat && report?.lng) {
        locationIntegrity = 0.8; // Has claimed GPS
        // In real implementation, compare with EXIF metadata
        // If mismatch > 5km → 0.1 (Suspicious)
      }

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
