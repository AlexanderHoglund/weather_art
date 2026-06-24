import type { LocationKey } from "./types";

// ---------------------------------------------------------------------------
// Typed location table. Replaces the scattered, duplicated per-location asset
// logic from run.js (lines ~726-822 and ~1254-1350). Each entry knows its
// coordinates and how to resolve its city artwork given the month / day-night
// state. Asset paths are absolute from the Next.js `public/` root.
// ---------------------------------------------------------------------------

export interface CityAssets {
  /** Main, full-colour city image. */
  city: string;
  /** Dark mask drawn on top and faded in at night. */
  black: string;
  /** Lit-window overlay (mostly empty except Stockholm). */
  windows: string;
}

export interface AssetContext {
  /** 1-12 local month. */
  month: number;
  isDay: boolean;
}

export interface LocationConfig {
  key: LocationKey;
  label: string;
  lat: number;
  lon: number;
  /** Lightens the night mask for already-dark artwork (Hong Kong). */
  darknessAdjuster: number;
  resolveAssets: (ctx: AssetContext) => CityAssets;
}

const IMG = "/Images/Locations";
const EMPTY_WINDOWS = `${IMG}/MyLocation/emptyWindows.png`;

export const LOCATIONS: Record<LocationKey, LocationConfig> = {
  stockholm: {
    key: "stockholm",
    label: "Stockholm",
    lat: 59.336889,
    lon: 18.110014,
    darknessAdjuster: 0,
    resolveAssets: ({ month }) => ({
      // Sunny art in months 3-8, autumn art otherwise (matches run.js).
      city:
        month > 2 && month < 9
          ? `${IMG}/Stockholm/stockholmCitySunnyDay.png`
          : `${IMG}/Stockholm/stockholmCityAutumnDay.png`,
      black: `${IMG}/Stockholm/StockholmCityBlackBox.png`,
      windows: `${IMG}/Stockholm/windows.png`,
    }),
  },
  hongkong: {
    key: "hongkong",
    label: "Hong Kong",
    lat: 22.253872457574207,
    lon: 113.90494773653444,
    darknessAdjuster: 0.4,
    resolveAssets: ({ isDay }) => ({
      city: isDay
        ? `${IMG}/HongKong/hongKongDay.png`
        : `${IMG}/HongKong/hongKongNight.png`,
      black: `${IMG}/HongKong/hongKongBlack.png`,
      windows: EMPTY_WINDOWS,
    }),
  },
  washington: {
    key: "washington",
    label: "Washington",
    lat: 38.88978443210114,
    lon: -77.03523618408674,
    darknessAdjuster: 0,
    resolveAssets: () => ({
      city: `${IMG}/Washington/washingtonDay.png`,
      black: `${IMG}/Washington/washingtonBlack.png`,
      windows: EMPTY_WINDOWS,
    }),
  },
  malmo: {
    key: "malmo",
    label: "Malmö",
    lat: 55.604981,
    lon: 13.003822,
    darknessAdjuster: 0,
    resolveAssets: () => ({
      city: `${IMG}/Malmo/malmoDag.png`,
      black: `${IMG}/Malmo/malmoBlack.png`,
      windows: EMPTY_WINDOWS,
    }),
  },
  paris: {
    key: "paris",
    label: "Paris",
    lat: 48.8566,
    lon: 2.3522,
    darknessAdjuster: 0,
    resolveAssets: () => ({
      city: `${IMG}/Paris/parisDay.png`,
      black: `${IMG}/Paris/parisBlack.png`,
      windows: EMPTY_WINDOWS,
    }),
  },
  la: {
    key: "la",
    label: "Los Angeles",
    lat: 33.99751362917054,
    lon: -118.2197155818907,
    darknessAdjuster: 0,
    resolveAssets: () => ({
      city: `${IMG}/LA/LADay.png`,
      black: `${IMG}/LA/LABlack.png`,
      windows: EMPTY_WINDOWS,
    }),
  },
  kyiv: {
    key: "kyiv",
    label: "Kyiv",
    lat: 50.42662738426463,
    lon: 30.56303064690026,
    darknessAdjuster: 0,
    resolveAssets: () => ({
      city: `${IMG}/Kyiv/kyivDay.png`,
      // NOTE: the original used kyivDay.png as the dark mask too (likely a bug;
      // kyivBlack.png exists). Preserved for visual parity with the reference app.
      black: `${IMG}/Kyiv/kyivDay.png`,
      windows: EMPTY_WINDOWS,
    }),
  },
  mylocation: {
    key: "mylocation",
    label: "My location",
    // Coordinates are overwritten at runtime from the Geolocation API; these are
    // the Stockholm-ish defaults the reference app shipped with.
    lat: 59.336889,
    lon: 18.110014,
    darknessAdjuster: 0,
    resolveAssets: () => ({
      city: `${IMG}/MyLocation/mylocationCitySunnyDay.png`,
      black: `${IMG}/MyLocation/mylocationCityBlackBox.png`,
      windows: EMPTY_WINDOWS,
    }),
  },
};

/** Great-circle distance in km between two lat/lon points (haversine). */
function distanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/**
 * Maps a searched coordinate onto a defined city (so it uses that city's bespoke
 * art) when it's within ~50 km, else null (caller falls back to generic art).
 * `mylocation` is excluded — it has no fixed real-world location.
 */
export function matchDefinedCity(lat: number, lon: number): LocationKey | null {
  const THRESHOLD_KM = 50;
  let best: LocationKey | null = null;
  let bestDist = THRESHOLD_KM;
  for (const cfg of Object.values(LOCATIONS)) {
    if (cfg.key === "mylocation") continue;
    const d = distanceKm(lat, lon, cfg.lat, cfg.lon);
    if (d < bestDist) {
      bestDist = d;
      best = cfg.key;
    }
  }
  return best;
}

/** The location selected on first load, matching the reference app. */
export const DEFAULT_LOCATION: LocationKey = "kyiv";

/** Order shown in the <select>, including the placeholder. */
export const LOCATION_ORDER: LocationKey[] = [
  "mylocation",
  "hongkong",
  "stockholm",
  "malmo",
  "paris",
  "washington",
  "la",
  "kyiv",
];
