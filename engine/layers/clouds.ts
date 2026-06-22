import { getImage, isReady } from "@/engine/assets";
import { mapTo } from "@/lib/mapTo";
import type { FrameInfo } from "@/engine/render/types";
import type { Scene } from "@/engine/scene";

// Cloud layer. Ported from run.js Cloud.drawCloud() + the cloudAlpha mapping
// (~lines 1942-2002). Four of the five cloud images are overlaid at fixed
// offsets (cloud2 was commented out in the original and stays unused).

function cloudAlpha(frame: FrameInfo): number {
  const { timeInMinutes, sunriseMinutes, sunsetMinutes } = frame;
  if (timeInMinutes <= sunriseMinutes) {
    return mapTo(timeInMinutes, 0, sunriseMinutes, 0.1, 0.2);
  }
  if (timeInMinutes < sunsetMinutes) return 0.5;
  return mapTo(timeInMinutes, sunsetMinutes, 1440, 0.15, 0.1);
}

export function drawClouds(
  ctx: CanvasRenderingContext2D,
  frame: FrameInfo,
  scene: Scene,
): void {
  ctx.globalAlpha = cloudAlpha(frame);

  const [c1, , c3, c4, c5] = scene.cloudSprites;
  const img1 = getImage(c1);
  const img3 = getImage(c3);
  const img4 = getImage(c4);
  const img5 = getImage(c5);

  for (const cloud of scene.clouds) {
    cloud.update(frame.metrics.width);
    const { xPos, yPos, length, height } = cloud;
    if (isReady(img1)) ctx.drawImage(img1, xPos + 50, yPos - 50, length, height);
    if (isReady(img3)) ctx.drawImage(img3, xPos - 50, yPos + 50, length, height);
    if (isReady(img4)) ctx.drawImage(img4, xPos - 70, yPos + 70, length, height);
    if (isReady(img5)) ctx.drawImage(img5, xPos, yPos, length, height);
  }

  ctx.globalAlpha = 1;
}
