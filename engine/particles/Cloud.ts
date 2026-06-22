import { randomInt } from "@/lib/random";
import type { StageMetrics } from "@/engine/render/types";

// A single cloud cluster. Ported from run.js Cloud (~lines 1921-1964). The
// drawing of the four overlaid cloud images lives in the clouds layer; this
// class only owns position, size and drift.

export class Cloud {
  xPos: number;
  yPos: number;
  length: number;
  height: number;
  speed: number;

  constructor(
    rawX: number,
    rawY: number,
    rawLength: number,
    rawHeight: number,
    metrics: StageMetrics,
    sizeMultiply: number,
    speed: number,
  ) {
    // Note: the reference app multiplies already-pixel values by rel* again;
    // preserved verbatim so cloud spread matches.
    this.xPos = rawX * metrics.relWidth;
    this.yPos = rawY * metrics.relHeight;
    this.length = rawLength * metrics.relWidth * sizeMultiply;
    this.height = rawHeight * metrics.relHeight * sizeMultiply;
    this.speed = speed;
  }

  update(canvasWidth: number): void {
    this.xPos += this.speed;
    if (this.xPos > canvasWidth) this.xPos = -300;
    if (this.xPos < -310) this.xPos = canvasWidth;
  }
}

/** Builds the cloud field for a weather state (run.js initClouds). */
export function createClouds(
  count: number,
  metrics: StageMetrics,
  sizeMultiply: number,
  speed: number,
): Cloud[] {
  const clouds: Cloud[] = [];
  for (let i = 0; i < count; i++) {
    const rawX = Math.random() * metrics.width * 2;
    const rawY = Math.random() * metrics.height + 100;
    const rawLength = randomInt(200, 500);
    const rawHeight = randomInt(100, 300);
    clouds.push(
      new Cloud(rawX, rawY, rawLength, rawHeight, metrics, sizeMultiply, speed),
    );
  }
  return clouds;
}
