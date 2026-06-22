import { getVisualConfig } from "@/engine/weatherVisuals";
import { getMoonPhase, moonImageForPhase } from "@/engine/moonPhase";
import {
  cloudSprites,
  skySprite,
  SUN_SPRITE,
} from "@/engine/sprites";
import { Cloud, createClouds } from "@/engine/particles/Cloud";
import { RainDrop, createRain } from "@/engine/particles/RainDrop";
import { SnowFlake, createSnow } from "@/engine/particles/SnowFlake";
import { Leaf, createLeaves } from "@/engine/particles/Leaf";
import { Birds } from "@/engine/particles/Birds";
import {
  StageMetrics,
  windDirectionSign,
  windSpeedToCloudSpeed,
} from "@/engine/render/types";
import { LOCATIONS } from "@/lib/locations";
import type { ActiveView, LocationKey, VisualConfig } from "@/lib/types";
import type { CityAssets } from "@/lib/locations";

// A Scene is the fully-resolved set of artwork + particle systems for a given
// (location, weather, time-of-day) combination. It is rebuilt only when those
// inputs change (see sceneKey); the render loop then mutates particle positions
// each frame. This consolidates run.js's per-load asset loading + initClouds /
// init / initSnow / initLeafs into one place.

export interface Scene {
  visual: VisualConfig;
  cloudSprites: string[];
  skySprite: string;
  sunSprite: string;
  moonSprite: string;
  city: CityAssets;
  darknessAdjuster: number;
  cloudSpeed: number;
  clouds: Cloud[];
  rain: RainDrop[];
  snow: SnowFlake[];
  leaves: Leaf[];
  birds: Birds;
  thunder: { counter: number };
}

export interface SceneInputs {
  metrics: StageMetrics;
  view: ActiveView;
  locationKey: LocationKey;
}

/**
 * A stable string identifying the artwork/particle inputs. When it changes the
 * scene is rebuilt (and particle fields reset). Wind is bucketed so a tiny gust
 * change doesn't reshuffle every particle.
 */
export function sceneKey(inputs: SceneInputs): string {
  const { view, locationKey, metrics } = inputs;
  const { isMorning, isDay, isNight, month } = view.time;
  return [
    locationKey,
    view.weatherId,
    `${isMorning ? "m" : ""}${isDay ? "d" : ""}${isNight ? "n" : ""}`,
    month,
    `${windDirectionSign(view.windDeg)}:${windSpeedToCloudSpeed(view.windSpeedMs)}`,
    view.isToday ? "today" : "fc",
    `${metrics.width}x${metrics.height}`,
  ].join("|");
}

export function buildScene(inputs: SceneInputs): Scene {
  const { metrics, view, locationKey } = inputs;
  const { time } = view;
  const visual = getVisualConfig(view.weatherId);
  const location = LOCATIONS[locationKey];

  const cloudSpeed =
    windSpeedToCloudSpeed(view.windSpeedMs) * windDirectionSign(view.windDeg);

  const moonPhase = getMoonPhase(time.year, time.month, time.day);

  const city = location.resolveAssets({
    month: time.month,
    isDay: time.isDay,
  });

  return {
    visual,
    cloudSprites: cloudSprites(visual.cloudKind),
    skySprite: skySprite(time),
    sunSprite: SUN_SPRITE,
    moonSprite: moonImageForPhase(moonPhase),
    city,
    darknessAdjuster: location.darknessAdjuster,
    cloudSpeed,
    clouds: createClouds(
      visual.numberOfClouds,
      metrics,
      visual.cloudSizeMultiply,
      cloudSpeed,
    ),
    rain: createRain(
      visual.numberOfRainDrops,
      metrics.width,
      metrics.height,
      visual.drizzleVar,
      cloudSpeed,
    ),
    snow: createSnow(
      visual.numberOfSnowFlakes,
      metrics.width,
      metrics.height,
      cloudSpeed,
    ),
    leaves: createLeaves(1, metrics, cloudSpeed),
    birds: new Birds(metrics),
    thunder: { counter: 0 },
  };
}
