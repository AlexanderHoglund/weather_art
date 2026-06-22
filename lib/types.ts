// Shared domain types for pixelWeather. The route handler normalizes raw
// OpenWeather responses into these shapes; the store and render engine consume
// them.

export type LocationKey =
  | "mylocation"
  | "hongkong"
  | "stockholm"
  | "paris"
  | "washington"
  | "la"
  | "kyiv";

// ---------------------------------------------------------------------------
// Normalized weather payload returned by /api/weather
// ---------------------------------------------------------------------------

export interface CurrentWeather {
  locationName: string;
  weatherId: number;
  description: string;
  tempC: number;
  windSpeedMs: number;
  windDeg: number;
  /** Unix seconds (UTC) of sunrise/sunset for the location. */
  sunriseUnix: number;
  sunsetUnix: number;
  /** Seconds offset from UTC for the location (from OpenWeather `timezone`). */
  timezoneOffsetSeconds: number;
}

/**
 * One 3-hourly forecast entry from the free 5-day/3-hour API. Carries both the
 * weather (for scene-switching) and the label fields (weekday/date/time) the
 * timeline displays. All label fields are computed in the location's local time.
 */
export interface ForecastSlot {
  weatherId: number;
  description: string;
  tempC: number;
  windSpeedMs: number;
  windDeg: number;
  /** Whether the local hour is daytime (drives day/night icon art). */
  isDayIcon: boolean;
  /** Short weekday, e.g. "Tue". */
  weekday: string;
  /** Short month, e.g. "Jun". */
  monthShort: string;
  /** Day of month, 1-31. */
  dayOfMonth: number;
  /** Local "HH:00" label. */
  timeLabel: string;
  /** "YYYY-M-D" local key for grouping into day dividers. */
  dayKey: string;
  /** Local minutes since midnight — drives the slot's time-of-day rendering. */
  timeInMinutes: number;
  /** Local year + month (1-12); the day is `dayOfMonth`. */
  year: number;
  month: number;
}

export interface ForecastData {
  slots: ForecastSlot[];
}

export interface WeatherPayload {
  current: CurrentWeather;
  forecast: ForecastData | null;
}

// ---------------------------------------------------------------------------
// Geocoding (typed location search)
// ---------------------------------------------------------------------------

export interface GeocodeResult {
  name: string;
  /** State/region, when provided (mostly US). */
  state?: string;
  country: string;
  lat: number;
  lon: number;
  /** Display label, e.g. "Paris, Texas, US". */
  label: string;
}

// ---------------------------------------------------------------------------
// Time-of-day (derived client-side from the timezone offset)
// ---------------------------------------------------------------------------

export interface TimeOfDay {
  /** Minutes since local midnight (0-1439). */
  timeInMinutes: number;
  isMorning: boolean;
  isDay: boolean;
  isNight: boolean;
  /** Local calendar date at the location (used for moon phase). */
  year: number;
  month: number; // 1-12
  day: number; // 1-31
}

// ---------------------------------------------------------------------------
// Weather visuals (replaces the giant weatherId switch in run.js)
// ---------------------------------------------------------------------------

export type CloudKind = "storm" | "normal";

export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface VisualConfig {
  numberOfClouds: number;
  cloudSizeMultiply: number;
  cloudBrightness: number;
  cloudKind: CloudKind;
  numberOfRainDrops: number;
  numberOfSnowFlakes: number;
  /** Subtracted from raindrop size to thin out drizzle. */
  drizzleVar: number;
  /** The `weatherLight` overlay tint applied over the city. */
  light: RGBA;
  isThunder: boolean;
}

// ---------------------------------------------------------------------------
// The fully-resolved view the render loop reads each frame
// ---------------------------------------------------------------------------

export interface ActiveView {
  weatherId: number;
  description: string;
  tempC: number;
  windSpeedMs: number;
  windDeg: number;
  time: TimeOfDay;
  /** True when showing live "today" weather (forecast icons only draw then). */
  isToday: boolean;
}
