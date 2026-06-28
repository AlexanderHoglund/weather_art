"use client";

import { useEffect, useRef } from "react";
import { LOCATIONS } from "@/lib/locations";
import { useWeatherStore } from "@/lib/store";
import type { LocationKey } from "@/lib/types";

// Makes the selected location shareable via the URL. On load it applies a deep
// link (?city=karlshamn, or ?lat=..&lon=..&name=.. for a searched city); on
// every change it writes the current selection back so the address bar is always
// a copy-pasteable link to exactly what's on screen.

/** A built-in city that's meaningful to share (everything except "my location"). */
function isShareableCity(key: string): key is LocationKey {
  return key in LOCATIONS && key !== "mylocation";
}

export function useLocationUrl(): void {
  const selectLocation = useWeatherStore((s) => s.selectLocation);
  const selectMyLocation = useWeatherStore((s) => s.selectMyLocation);
  const locationKey = useWeatherStore((s) => s.locationKey);
  const coords = useWeatherStore((s) => s.coords);
  const displayName = useWeatherStore((s) => s.displayName);

  // 1. Apply the incoming deep link once, after mount (post-hydration so the
  //    server-rendered default and the client agree).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const city = params.get("city");
    const latRaw = params.get("lat");
    const lonRaw = params.get("lon");
    const name = params.get("name");

    if (city && isShareableCity(city)) {
      selectLocation(city);
    } else if (latRaw && lonRaw) {
      const lat = Number(latRaw);
      const lon = Number(lonRaw);
      if (Number.isFinite(lat) && Number.isFinite(lon)) {
        selectMyLocation({ lat, lon }, name ?? undefined);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Keep the URL in sync with the selection. Skip the first run so mount
  //    (before the deep link above is applied) never clobbers an incoming link;
  //    replaceState avoids piling up history entries as the user browses cities.
  const firstWrite = useRef(true);
  useEffect(() => {
    if (firstWrite.current) {
      firstWrite.current = false;
      return;
    }

    const params = new URLSearchParams(window.location.search);
    ["city", "lat", "lon", "name"].forEach((k) => params.delete(k));

    if (isShareableCity(locationKey)) {
      params.set("city", locationKey);
    } else if (locationKey === "mylocation" && displayName) {
      // A searched custom city — share its coordinates and name.
      params.set("lat", coords.lat.toFixed(4));
      params.set("lon", coords.lon.toFixed(4));
      params.set("name", displayName);
    }
    // (Device geolocation has no displayName, so we never leak the visitor's
    //  own coordinates into a shareable URL.)

    const qs = params.toString();
    window.history.replaceState(
      null,
      "",
      qs ? `${window.location.pathname}?${qs}` : window.location.pathname,
    );
  }, [locationKey, coords, displayName]);
}
