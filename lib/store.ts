import { create } from "zustand";
import { computeTimeOfDay, phaseFlags } from "@/engine/timeOfDay";
import { DEFAULT_LOCATION, LOCATIONS } from "./locations";
import type {
  ActiveView,
  LocationKey,
  TimeOfDay,
  WeatherPayload,
} from "./types";

// ---------------------------------------------------------------------------
// Zustand store. Holds all shared state so the RAF render loop can read the
// latest values via `useWeatherStore.getState()` without forcing React
// re-renders, while overlay components subscribe normally. Replaces the
// reference app's globals + sessionStorage + location.reload() flow: changing
// location/forecast now just updates state.
// ---------------------------------------------------------------------------

export type Status = "idle" | "loading" | "ready" | "error";

export interface AudioState {
  isPlaying: boolean;
  currentTitle: string | null;
}

interface Coords {
  lat: number;
  lon: number;
}

interface WeatherStore {
  locationKey: LocationKey;
  coords: Coords;
  current: WeatherPayload["current"] | null;
  forecast: WeatherPayload["forecast"];
  /** Time-of-day for "today", computed when weather is loaded. */
  todayTime: TimeOfDay | null;
  /** Selected forecast slot index, or null for live "Now" weather. */
  forecastSlot: number | null;
  /**
   * City-level name to show, overriding the weather API's micro-location name
   * (which is often a district). Null falls back to the API name (geolocation).
   */
  displayName: string | null;
  status: Status;
  error: string | null;
  audio: AudioState;

  /** Select a built-in location (coords come from the table). */
  selectLocation: (key: LocationKey) => void;
  /** Select "My location" coords, optionally with a searched city name. */
  selectMyLocation: (coords: Coords, name?: string) => void;
  setForecastSlot: (index: number | null) => void;
  setLoading: () => void;
  setWeather: (payload: WeatherPayload) => void;
  setError: (message: string) => void;
  setAudio: (partial: Partial<AudioState>) => void;
}

export const useWeatherStore = create<WeatherStore>((set) => ({
  locationKey: DEFAULT_LOCATION,
  coords: {
    lat: LOCATIONS[DEFAULT_LOCATION].lat,
    lon: LOCATIONS[DEFAULT_LOCATION].lon,
  },
  current: null,
  forecast: null,
  todayTime: null,
  forecastSlot: null,
  displayName: LOCATIONS[DEFAULT_LOCATION].label,
  status: "idle",
  error: null,
  audio: { isPlaying: false, currentTitle: null },

  selectLocation: (key) =>
    set({
      locationKey: key,
      coords: { lat: LOCATIONS[key].lat, lon: LOCATIONS[key].lon },
      // Show the canonical city label rather than the API's district name.
      displayName: LOCATIONS[key].label,
      // Reset to live weather the way a fresh page load did.
      forecastSlot: null,
    }),

  selectMyLocation: (coords, name) =>
    set({
      locationKey: "mylocation",
      coords,
      // A searched city passes its name; geolocation passes none (use API name).
      displayName: name ?? null,
      forecastSlot: null,
    }),

  setForecastSlot: (index) => set({ forecastSlot: index }),

  setLoading: () => set({ status: "loading", error: null }),

  setWeather: (payload) =>
    set({
      current: payload.current,
      forecast: payload.forecast,
      todayTime: computeTimeOfDay(payload.current.timezoneOffsetSeconds),
      status: "ready",
      error: null,
    }),

  setError: (message) => set({ status: "error", error: message }),

  setAudio: (partial) =>
    set((s) => ({ audio: { ...s.audio, ...partial } })),
}));

// ---------------------------------------------------------------------------
// Frame-read selector: resolves the active forecast selection into the single
// view the render loop draws. Pure function of store state.
// ---------------------------------------------------------------------------

export function selectActiveView(
  s: Pick<
    WeatherStore,
    "current" | "forecast" | "todayTime" | "forecastSlot"
  >,
): ActiveView | null {
  const { current, forecast, todayTime, forecastSlot } = s;
  if (!current || !todayTime) return null;

  const todayView: ActiveView = {
    weatherId: current.weatherId,
    description: current.description,
    tempC: current.tempC,
    windSpeedMs: current.windSpeedMs,
    windDeg: current.windDeg,
    time: todayTime,
    isToday: true,
  };

  if (forecastSlot === null) return todayView;

  // Fall back to live weather if the chosen slot is unavailable.
  const slot = forecast?.slots[forecastSlot];
  if (!slot) return todayView;

  // Render the forecast scene at the slot's real local time-of-day (an evening
  // slot looks like night, a morning slot like morning, etc.).
  const time: TimeOfDay = {
    timeInMinutes: slot.timeInMinutes,
    ...phaseFlags(slot.timeInMinutes),
    year: slot.year,
    month: slot.month,
    day: slot.dayOfMonth,
  };

  return {
    weatherId: slot.weatherId,
    description: slot.description,
    tempC: slot.tempC,
    windSpeedMs: slot.windSpeedMs,
    windDeg: slot.windDeg,
    time,
    isToday: false,
  };
}
