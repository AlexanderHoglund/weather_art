import { getImage, isReady } from "@/engine/assets";
import { mapTo } from "@/lib/mapTo";
import type { FrameInfo, StageMetrics } from "@/engine/render/types";
import type { Scene } from "@/engine/scene";

// City layers. Ported from run.js cityDrawMain(), cityBlackDraw(),
// cityWindowsDraw() (~lines 1066-1135). The main image and the dark mask /
// window overlay share the same crop + placement geometry.

function drawCityImage(
  ctx: CanvasRenderingContext2D,
  src: string,
  metrics: StageMetrics,
): void {
  const img = getImage(src);
  if (!isReady(img)) return;
  ctx.drawImage(
    img,
    img.naturalWidth * metrics.cropStart,
    0,
    img.naturalWidth * metrics.cropEnd,
    img.naturalHeight,
    0,
    metrics.height - 650 * metrics.relHeight,
    metrics.width - 1 * metrics.relWidth,
    metrics.height - 110 * metrics.relHeight,
  );
}

export function drawCityMain(
  ctx: CanvasRenderingContext2D,
  frame: FrameInfo,
  scene: Scene,
): void {
  drawCityImage(ctx, scene.city.city, frame.metrics);
}

/** Alpha of the dark night mask, faded by time of day. */
export function cityBlackAlpha(frame: FrameInfo): number {
  const { timeInMinutes, sunriseMinutes, sunsetMinutes, darknessAdjuster } =
    frame;
  const peak = 0.6 - darknessAdjuster;
  if (timeInMinutes <= sunriseMinutes) {
    return mapTo(timeInMinutes, 0, sunriseMinutes + 100, peak, 0);
  }
  if (timeInMinutes < sunsetMinutes) return 0;
  return mapTo(timeInMinutes, sunsetMinutes - 100, 1350, 0, peak);
}

/**
 * Draws the dark mask and the lit-window overlay on the black canvas. The
 * caller sets globalAlpha to cityBlackAlpha(frame) first so both inherit it
 * (matching the reference app, where windows are only visible at night).
 */
export function drawCityBlack(
  ctx: CanvasRenderingContext2D,
  frame: FrameInfo,
  scene: Scene,
): void {
  drawCityImage(ctx, scene.city.black, frame.metrics);
}

export function drawCityWindows(
  ctx: CanvasRenderingContext2D,
  frame: FrameInfo,
  scene: Scene,
): void {
  drawCityImage(ctx, scene.city.windows, frame.metrics);
}
