import type { CloudKind } from "@/lib/types";

// Centralised asset paths (absolute from public/). Replaces the inline
// `img.src = 'Images/...'` assignments throughout run.js.

const CLOUDS = "/Images/Clouds";
const SKY = "/Images/Sky";
const RAINSNOW = "/Images/rainandsnow";
const MOONSUN = "/Images/moonandsun";
const STOCKHOLM = "/Images/Locations/Stockholm";

/** The five cloud layers for a weather kind (storm vs fair-weather). */
export function cloudSprites(kind: CloudKind): string[] {
  const prefix = kind === "storm" ? "stormcloud" : "cloud";
  return [1, 2, 3, 4, 5].map((n) => `${CLOUDS}/${prefix}${n}.png`);
}

export function skySprite(phase: {
  isMorning: boolean;
  isDay: boolean;
  isNight: boolean;
}): string {
  if (phase.isMorning) return `${SKY}/morningSky.png`;
  if (phase.isDay) return `${SKY}/skySunny.png`;
  return `${SKY}/nightSky.png`;
}

export const SUN_SPRITE = `${MOONSUN}/sun.png`;
export const RAIN_SPRITE = `${RAINSNOW}/rain13.png`;
export const SNOW_SPRITE = `${RAINSNOW}/snowflake3.png`;
export const LEAF_SPRITE = `${STOCKHOLM}/leaves2.png`;

export const THUNDER_SPRITES = [1, 2, 3, 4, 5, 6].map(
  (n) => `${RAINSNOW}/thunder${n}.png`,
);

export const BIRD_SPRITES = [1, 2, 3].map(
  (n) => `${STOCKHOLM}/birdspritesheet${n}.png`,
);
