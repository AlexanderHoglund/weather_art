import type { GeocodeResult } from "@/lib/types";

// ---------------------------------------------------------------------------
// Geocoding proxy for typed location search. Keeps the OpenWeather key
// server-side (same key as the weather route). Free Geocoding API:
// https://openweathermap.org/api/geocoding-api
// ---------------------------------------------------------------------------

interface OWGeoEntry {
  name: string;
  state?: string;
  country: string;
  lat: number;
  lon: number;
}

function toResult(e: OWGeoEntry): GeocodeResult {
  const label = [e.name, e.state, e.country].filter(Boolean).join(", ");
  return {
    name: e.name,
    state: e.state,
    country: e.country,
    lat: e.lat,
    lon: e.lon,
    label,
  };
}

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const key = process.env.WEATHER_API_KEY;

  if (!q) {
    return Response.json({ error: "q is required" }, { status: 400 });
  }
  if (!key) {
    return Response.json(
      { error: "WEATHER_API_KEY is not configured" },
      { status: 500 },
    );
  }

  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
    q,
  )}&limit=5&appid=${key}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      return Response.json(
        { error: `OpenWeather geocoding failed (${res.status})` },
        { status: 502 },
      );
    }
    const entries = (await res.json()) as OWGeoEntry[];
    const results: GeocodeResult[] = entries.map(toResult);
    return Response.json({ results });
  } catch (err) {
    return Response.json(
      { error: `Upstream request failed: ${(err as Error).message}` },
      { status: 502 },
    );
  }
}
