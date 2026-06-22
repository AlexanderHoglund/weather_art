import { getImage, isReady } from "@/engine/assets";
import { mapTo } from "@/lib/mapTo";
import type { FrameInfo } from "@/engine/render/types";
import type { Scene } from "@/engine/scene";

// Sky layer: the cropped sky backdrop plus a time-driven black overlay that
// darkens toward night. Ported from run.js runSky() (~lines 1005-1043).

export function drawSky(
  ctx: CanvasRenderingContext2D,
  frame: FrameInfo,
  scene: Scene,
): void {
  const { metrics, timeInMinutes, sunriseMinutes } = frame;
  const img = getImage(scene.skySprite);
  if (isReady(img)) {
    ctx.drawImage(
      img,
      img.naturalWidth * metrics.cropStart,
      0,
      img.naturalWidth * metrics.cropEnd,
      img.naturalHeight,
      0,
      0,
      metrics.width,
      metrics.height,
    );
  }

  let skyBrightness: number;
  if (timeInMinutes <= 719) {
    skyBrightness = mapTo(timeInMinutes, sunriseMinutes, 500, 0.6, 0);
  } else {
    skyBrightness = mapTo(timeInMinutes, 1000, 1440, 0, 0.6);
  }
  // The reference math can go slightly negative around midday; clamp so the
  // overlay never lightens the scene.
  skyBrightness = Math.max(0, skyBrightness);

  ctx.fillStyle = `rgba(0,0,0,${skyBrightness})`;
  ctx.fillRect(0, 0, metrics.width, metrics.height);
}
