"use client";

import { useEffect } from "react";
import { useWeatherStore } from "@/lib/store";
import type { WeatherPayload } from "@/lib/types";

// Fetches /api/weather whenever the selected coordinates change and populates
// the store. Replaces the reference app's `runWeatherAndTimeSystem` IIFE and its
// location.reload() flow — selecting a location now just refetches.

export function useWeatherData(): void {
  const lat = useWeatherStore((s) => s.coords.lat);
  const lon = useWeatherStore((s) => s.coords.lon);
  const setLoading = useWeatherStore((s) => s.setLoading);
  const setWeather = useWeatherStore((s) => s.setWeather);
  const setError = useWeatherStore((s) => s.setError);

  useEffect(() => {
    let cancelled = false;
    setLoading();

    fetch(`/api/weather?lat=${lat}&lon=${lon}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(body.error ?? `Request failed (${res.status})`);
        }
        return (await res.json()) as WeatherPayload;
      })
      .then((payload) => {
        if (!cancelled) setWeather(payload);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError((err as Error).message);
      });

    return () => {
      cancelled = true;
    };
  }, [lat, lon, setLoading, setWeather, setError]);
}
