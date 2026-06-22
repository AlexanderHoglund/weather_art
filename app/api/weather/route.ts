import type {
  CurrentWeather,
  ForecastData,
  ForecastSlot,
  WeatherPayload,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Weather proxy. Replaces the original Express server's stateful POST / + GET
// /current, /forecast, /forcastCurrent handlers. The OpenWeather key stays
// server-side; lat/lon are passed per request (no server-side globals).
//
// The free plan only exposes /data/2.5/weather (current) and /data/2.5/forecast
// (5-day / 3-hour). Every 3-hourly slot is exposed as a labeled ForecastSlot for
// the timeline; the retired One Call API is not used.
// ---------------------------------------------------------------------------

const KELVIN = 273.15;
const weekdayFmt = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  timeZone: "UTC",
});
const monthFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  timeZone: "UTC",
});

interface OWWeatherEntry {
  id: number;
  main: string;
  description: string;
  icon: string;
}

interface OWCurrentResponse {
  name: string;
  weather: OWWeatherEntry[];
  main: { temp: number };
  wind: { speed: number; deg: number };
  sys: { sunrise: number; sunset: number };
  timezone: number;
}

interface OWForecastItem {
  dt: number;
  main: { temp: number };
  weather: OWWeatherEntry[];
  wind: { speed: number; deg: number };
  dt_txt: string;
}

interface OWForecastResponse {
  list: OWForecastItem[];
  city: { timezone: number };
}

/** Convert a forecast item into a labeled slot in the location's local time. */
function toSlot(item: OWForecastItem, tz: number): ForecastSlot {
  // Shift into local time and read via UTC getters / Intl with timeZone: UTC.
  const local = new Date((item.dt + tz) * 1000);
  const hour = local.getUTCHours();
  return {
    weatherId: item.weather[0].id,
    description: item.weather[0].description,
    tempC: item.main.temp - KELVIN,
    windSpeedMs: item.wind.speed,
    windDeg: item.wind.deg,
    isDayIcon: hour > 5 && hour < 22,
    weekday: weekdayFmt.format(local),
    monthShort: monthFmt.format(local),
    dayOfMonth: local.getUTCDate(),
    timeLabel: `${hour < 10 ? "0" : ""}${hour}:00`,
    dayKey: `${local.getUTCFullYear()}-${local.getUTCMonth() + 1}-${local.getUTCDate()}`,
    timeInMinutes: hour * 60 + local.getUTCMinutes(),
    year: local.getUTCFullYear(),
    month: local.getUTCMonth() + 1,
  };
}

function buildForecast(data: OWForecastResponse): ForecastData {
  const tz = data.city.timezone;
  // Expose every 3-hourly slot the free tier returns (~40 across ~5 days).
  return { slots: data.list.map((item) => toSlot(item, tz)) };
}

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const key = process.env.WEATHER_API_KEY;

  if (!lat || !lon) {
    return Response.json({ error: "lat and lon are required" }, { status: 400 });
  }
  if (!key) {
    return Response.json(
      { error: "WEATHER_API_KEY is not configured" },
      { status: 500 },
    );
  }

  const base = "https://api.openweathermap.org/data/2.5";
  const currentUrl = `${base}/weather?lat=${lat}&lon=${lon}&appid=${key}`;
  const forecastUrl = `${base}/forecast?lat=${lat}&lon=${lon}&appid=${key}`;

  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(currentUrl),
      fetch(forecastUrl),
    ]);

    if (!currentRes.ok) {
      return Response.json(
        { error: `OpenWeather current failed (${currentRes.status})` },
        { status: 502 },
      );
    }

    const cw = (await currentRes.json()) as OWCurrentResponse;
    const current: CurrentWeather = {
      locationName: cw.name,
      weatherId: cw.weather[0].id,
      description: cw.weather[0].description,
      tempC: cw.main.temp - KELVIN,
      windSpeedMs: cw.wind.speed,
      windDeg: cw.wind.deg,
      sunriseUnix: cw.sys.sunrise,
      sunsetUnix: cw.sys.sunset,
      timezoneOffsetSeconds: cw.timezone,
    };

    // Forecast is best-effort; a failure still returns current weather.
    let forecast: ForecastData | null = null;
    if (forecastRes.ok) {
      forecast = buildForecast((await forecastRes.json()) as OWForecastResponse);
    }

    const payload: WeatherPayload = { current, forecast };
    return Response.json(payload);
  } catch (err) {
    return Response.json(
      { error: `Upstream request failed: ${(err as Error).message}` },
      { status: 502 },
    );
  }
}
