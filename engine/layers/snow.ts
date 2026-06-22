import { getImage, isReady } from "@/engine/assets";
import { SNOW_SPRITE } from "@/engine/sprites";
import type { FrameInfo } from "@/engine/render/types";
import type { Scene } from "@/engine/scene";

// Snow layer. Ported from run.js SnowParticle.drawSnow() + its update loop
// (~lines 2106-2130). Drawn on the rain canvas, same as rain.

export function drawSnow(
  ctx: CanvasRenderingContext2D,
  frame: FrameInfo,
  scene: Scene,
): void {
  const img = getImage(SNOW_SPRITE);
  const { width, height } = frame.metrics;
  for (const flake of scene.snow) {
    flake.update(width, height);
    if (isReady(img)) {
      ctx.drawImage(img, flake.x, flake.y, flake.size, flake.size * 2);
    }
  }
}
