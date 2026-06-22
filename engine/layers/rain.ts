import { getImage, isReady } from "@/engine/assets";
import { RAIN_SPRITE } from "@/engine/sprites";
import type { FrameInfo } from "@/engine/render/types";
import type { Scene } from "@/engine/scene";

// Rain layer. Ported from run.js Particle.draw() + its update loop
// (~lines 2040-2070). Drawn on the rain canvas at full opacity.

export function drawRain(
  ctx: CanvasRenderingContext2D,
  frame: FrameInfo,
  scene: Scene,
): void {
  const img = getImage(RAIN_SPRITE);
  const { width, height } = frame.metrics;
  for (const drop of scene.rain) {
    drop.update(width, height);
    if (isReady(img)) {
      ctx.drawImage(img, drop.x, drop.y, drop.size, drop.size * 2);
    }
  }
}
