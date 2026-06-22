"use client";

import { useCallback } from "react";
import { useWeatherStore } from "@/lib/store";

// Wraps navigator.geolocation for the "My location" option. Resolves the user's
// coordinates and pushes them into the store, which triggers a refetch.

export function useGeolocation(): () => void {
  const selectMyLocation = useWeatherStore((s) => s.selectMyLocation);

  return useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      console.warn("Geolocation is unavailable in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        selectMyLocation({
          lat: Number(position.coords.latitude.toFixed(6)),
          lon: Number(position.coords.longitude.toFixed(6)),
        });
      },
      (error) => {
        console.warn("Geolocation error:", error.message);
      },
    );
  }, [selectMyLocation]);
}
