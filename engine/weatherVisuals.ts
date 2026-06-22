import type { VisualConfig } from "@/lib/types";

// ---------------------------------------------------------------------------
// weatherId -> VisualConfig. Replaces the ~460-line `if (weatherId ...)` ladder
// in run.js (lines ~1452-1910). The original used a sequence of independent
// `if` blocks where later matches overwrite earlier ones; this preserves that
// exact "last match wins" behaviour while collapsing the duplication.
//
// Reference: https://openweathermap.org/weather-conditions
// ---------------------------------------------------------------------------

const STORM_LIGHT = { r: 30, g: 30, b: 90 };

function base(): VisualConfig {
  return {
    numberOfClouds: 0,
    cloudSizeMultiply: 1,
    cloudBrightness: 0,
    cloudKind: "normal",
    numberOfRainDrops: 0,
    numberOfSnowFlakes: 0,
    drizzleVar: 0,
    light: { r: 0, g: 0, b: 0, a: 0 },
    isThunder: false,
  };
}

export function getVisualConfig(weatherId: number): VisualConfig {
  const c = base();

  // 200-232 Thunderstorm
  if (weatherId > 199 && weatherId < 233) {
    c.numberOfClouds = 20;
    c.cloudSizeMultiply = 1.5;
    c.cloudKind = "storm";
    c.numberOfRainDrops = 70;
    c.light = { ...STORM_LIGHT, a: 0.4 };
    c.isThunder = true;
  }

  // 300-321 Drizzle
  if (weatherId === 300) {
    c.numberOfClouds = 30;
    c.cloudSizeMultiply = 1.5;
    c.cloudKind = "storm";
    c.drizzleVar = 2;
    c.numberOfRainDrops = 100;
    c.light = { ...STORM_LIGHT, a: 0.3 };
  }
  if (weatherId === 301) {
    c.numberOfClouds = 40;
    c.cloudSizeMultiply = 1.5;
    c.cloudKind = "storm";
    c.drizzleVar = 1.5;
    c.numberOfRainDrops = 300;
    c.light = { ...STORM_LIGHT, a: 0.4 };
  }
  if (weatherId > 301 && weatherId < 322) {
    c.numberOfClouds = 40;
    c.cloudSizeMultiply = 1.5;
    c.cloudKind = "storm";
    c.drizzleVar = 1;
    c.numberOfRainDrops = 400;
    c.light = { ...STORM_LIGHT, a: 0.4 };
  }

  // 500-531 Rain
  if (weatherId === 500) {
    c.numberOfClouds = 40;
    c.cloudSizeMultiply = 1.5;
    c.cloudKind = "storm";
    c.numberOfRainDrops = 100;
    c.light = { ...STORM_LIGHT, a: 0.3 };
  }
  if (weatherId === 501) {
    c.numberOfClouds = 40;
    c.cloudSizeMultiply = 1.5;
    c.cloudKind = "storm";
    c.numberOfRainDrops = 200;
    c.light = { ...STORM_LIGHT, a: 0.4 };
  }
  if (weatherId === 502) {
    c.numberOfClouds = 40;
    c.cloudSizeMultiply = 1.5;
    c.cloudKind = "storm";
    c.numberOfRainDrops = 300;
    c.light = { ...STORM_LIGHT, a: 0.4 };
  }
  if (weatherId > 502 && weatherId < 532) {
    c.numberOfClouds = 40;
    c.cloudSizeMultiply = 1.5;
    c.cloudKind = "storm";
    c.numberOfRainDrops = 400;
    c.light = { ...STORM_LIGHT, a: 0.5 };
  }

  // 600-622 Snow
  if (weatherId === 600) {
    c.numberOfClouds = 40;
    c.cloudSizeMultiply = 1.5;
    c.cloudKind = "storm";
    c.numberOfSnowFlakes = 50;
    c.light = { ...STORM_LIGHT, a: 0.5 };
  }
  if (weatherId === 601) {
    c.numberOfClouds = 40;
    c.cloudSizeMultiply = 1.5;
    c.cloudKind = "storm";
    c.numberOfSnowFlakes = 100;
    c.light = { ...STORM_LIGHT, a: 0.5 };
  }
  if (weatherId === 602) {
    c.numberOfClouds = 40;
    c.cloudSizeMultiply = 1.5;
    c.cloudKind = "storm";
    c.numberOfSnowFlakes = 400;
    c.light = { ...STORM_LIGHT, a: 0.5 };
  }
  if (weatherId > 619 && weatherId < 623) {
    c.numberOfClouds = 40;
    c.cloudSizeMultiply = 1.5;
    c.cloudKind = "storm";
    c.numberOfSnowFlakes = 300;
    c.light = { ...STORM_LIGHT, a: 0.5 };
  }
  // 611-616 Light snow + rain (sleet) — overlaps the snow band by design.
  if (weatherId > 610 && weatherId < 617) {
    c.numberOfClouds = 40;
    c.cloudSizeMultiply = 1.5;
    c.cloudKind = "storm";
    c.numberOfRainDrops = 50;
    c.numberOfSnowFlakes = 100;
    c.light = { ...STORM_LIGHT, a: 0.5 };
  }

  // 700-781 Atmosphere (mist/fog/haze)
  if (weatherId > 699 && weatherId < 782) {
    c.numberOfClouds = 40;
    c.cloudSizeMultiply = 1.5;
    c.cloudKind = "normal";
    c.light = { r: 200, g: 200, b: 220, a: 0.5 };
  }

  // 800-804 Clear / clouds
  if (weatherId === 800) {
    c.numberOfClouds = 6;
    c.cloudSizeMultiply = 0.5;
    c.cloudKind = "normal";
    c.light = { r: 0, g: 0, b: 0, a: 0 };
  }
  if (weatherId === 801) {
    c.numberOfClouds = 10;
    c.cloudSizeMultiply = 1;
    c.cloudKind = "normal";
  }
  if (weatherId === 802) {
    c.numberOfClouds = 20;
    c.cloudSizeMultiply = 1;
    c.cloudKind = "normal";
  }
  if (weatherId === 803) {
    c.numberOfClouds = 20;
    c.cloudSizeMultiply = 1;
    c.cloudKind = "normal";
  }
  if (weatherId === 804) {
    c.numberOfClouds = 50;
    c.cloudSizeMultiply = 1;
    c.cloudKind = "normal";
  }

  return c;
}
