import { getImage, isReady } from "@/engine/assets";
import { LEAF_SPRITE } from "@/engine/sprites";
import type { FrameInfo } from "@/engine/render/types";
import type { Scene } from "@/engine/scene";

// Leaves layer. Ported from run.js Leaf.leafDraw() + its update loop
// (~lines 2243-2271, 2602-2605). Drawn on the city canvas after the city image.

export function drawLeaves(
  ctx: CanvasRenderingContext2D,
  frame: FrameInfo,
  scene: Scene,
): void {
  const img = getImage(LEAF_SPRITE);
  for (const leaf of scene.leaves) {
    leaf.update(frame.metrics.width);
    if (isReady(img)) {
      ctx.drawImage(img, leaf.xPos + 60, leaf.yPos - 70, leaf.length, leaf.height);
    }
  }
}
