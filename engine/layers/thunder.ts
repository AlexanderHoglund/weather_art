import { getImage, isReady } from "@/engine/assets";
import { THUNDER_SPRITES } from "@/engine/sprites";
import type { FrameInfo } from "@/engine/render/types";
import type { Scene } from "@/engine/scene";

// Thunder layer. Ported from run.js runThunder() (~lines 2168-2215). A frame
// counter triggers six lightning bolts with white flashes at fixed intervals,
// looping every 1000 frames. Only invoked when the weather is a thunderstorm.

interface Flash {
  start: number;
  end: number;
  bolt: number; // index into THUNDER_SPRITES
  alpha: number;
}

const FLASHES: Flash[] = [
  { start: 100, end: 110, bolt: 0, alpha: 0.2 },
  { start: 200, end: 210, bolt: 1, alpha: 0.3 },
  { start: 570, end: 575, bolt: 2, alpha: 0.3 },
  { start: 590, end: 596, bolt: 3, alpha: 0.3 },
  { start: 730, end: 740, bolt: 4, alpha: 0.3 },
  { start: 930, end: 935, bolt: 5, alpha: 0.3 },
];

export function drawThunder(
  ctx: CanvasRenderingContext2D,
  frame: FrameInfo,
  scene: Scene,
): void {
  scene.thunder.counter += 1;
  const counter = scene.thunder.counter;
  const { width, height } = frame.metrics;

  for (const f of FLASHES) {
    if (counter > f.start && counter < f.end) {
      const bolt = getImage(THUNDER_SPRITES[f.bolt]);
      if (isReady(bolt)) ctx.drawImage(bolt, 0, 0, width, height);
      ctx.fillStyle = `rgba(255,255,255,${f.alpha})`;
      ctx.fillRect(0, 0, width, height);
    }
  }

  if (counter > 1000) scene.thunder.counter = 0;
}
