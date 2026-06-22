import { getImage, isReady } from "@/engine/assets";
import { mapTo } from "@/lib/mapTo";
import type { FrameInfo } from "@/engine/render/types";
import type { Scene } from "@/engine/scene";

// Sun/moon layer. Ported from run.js sunAndMoon()/runSun()/runMoon()
// (~lines 902-999). The sun arcs across the day; the moon tracks night. The
// odd extra rel* scaling on the sun position is preserved from the original.

export function drawSunMoon(
  ctx: CanvasRenderingContext2D,
  frame: FrameInfo,
  scene: Scene,
): void {
  const {
    metrics,
    timeInMinutes,
    sunriseMinutes,
    sunsetMinutes,
    lengthOfDay,
    isDay,
    isMorning,
  } = frame;

  if (isDay || isMorning) {
    const sunXPos = mapTo(
      timeInMinutes,
      sunriseMinutes,
      sunriseMinutes + lengthOfDay,
      0,
      metrics.width,
    );
    const sunYPos =
      timeInMinutes < 720
        ? mapTo(
            timeInMinutes,
            sunriseMinutes,
            sunriseMinutes + lengthOfDay / 2,
            metrics.height / 2,
            metrics.height / 6,
          )
        : mapTo(
            timeInMinutes,
            sunriseMinutes + lengthOfDay / 2,
            sunriseMinutes + lengthOfDay,
            metrics.height / 6,
            metrics.height / 2,
          );
    const sun = getImage(scene.sunSprite);
    if (isReady(sun)) {
      ctx.drawImage(
        sun,
        sunXPos * metrics.relWidth,
        sunYPos * metrics.relHeight,
        100,
        100,
      );
    }
    return;
  }

  const moonXPos =
    timeInMinutes < sunriseMinutes
      ? mapTo(timeInMinutes, 0, sunriseMinutes, 0, metrics.width / 2)
      : mapTo(timeInMinutes, sunsetMinutes, 1440, metrics.width / 2, metrics.width);
  const moon = getImage(scene.moonSprite);
  if (isReady(moon)) {
    ctx.drawImage(moon, moonXPos, 150, 55, 55);
  }
}
