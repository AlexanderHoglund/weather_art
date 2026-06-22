import { drawSky } from "@/engine/layers/sky";
import { drawSunMoon } from "@/engine/layers/sunMoon";
import { drawClouds } from "@/engine/layers/clouds";
import { drawBirds } from "@/engine/layers/birds";
import { drawThunder } from "@/engine/layers/thunder";
import {
  cityBlackAlpha,
  drawCityBlack,
  drawCityMain,
  drawCityWindows,
} from "@/engine/layers/city";
import { drawLeaves } from "@/engine/layers/leaves";
import { drawTints } from "@/engine/layers/tints";
import { drawRain } from "@/engine/layers/rain";
import { drawSnow } from "@/engine/layers/snow";
import type { FrameInfo, StageContexts } from "@/engine/render/types";
import type { Scene } from "@/engine/scene";

// Per-frame orchestrator. Clears every canvas then calls each layer in the
// exact order of run.js's update() loop (~lines 2569-2640). Keeping this order
// (and the per-context globalAlpha handling) identical preserves the look.

export function renderFrame(
  ctx: StageContexts,
  frame: FrameInfo,
  scene: Scene,
): void {
  const { width, height } = frame.metrics;

  // Clear all canvases.
  ctx.rain.clearRect(0, 0, width, height);
  ctx.clouds.clearRect(0, 0, width, height);
  ctx.sunMoon.clearRect(0, 0, width, height);
  ctx.cityMain.clearRect(0, 0, width, height);
  ctx.cityBlack.clearRect(0, 0, width, height);
  ctx.sky.clearRect(0, 0, width, height);

  drawSky(ctx.sky, frame, scene);
  drawSunMoon(ctx.sunMoon, frame, scene);
  drawClouds(ctx.clouds, frame, scene);

  // Birds render behind the city skyline.
  drawBirds(ctx.cityMain, scene);

  if (frame.visual.isThunder) {
    ctx.rain.globalAlpha = 1;
    drawThunder(ctx.rain, frame, scene);
  }

  drawCityMain(ctx.cityMain, frame, scene);

  // Dark mask + lit windows share the night alpha.
  ctx.cityBlack.globalAlpha = cityBlackAlpha(frame);
  drawCityBlack(ctx.cityBlack, frame, scene);
  drawCityWindows(ctx.cityBlack, frame, scene);
  ctx.cityBlack.globalAlpha = 1;

  drawLeaves(ctx.cityMain, frame, scene);
  drawTints(ctx.cityMain, frame);

  ctx.rain.globalAlpha = 1;
  drawRain(ctx.rain, frame, scene);
  drawSnow(ctx.rain, frame, scene);
}
