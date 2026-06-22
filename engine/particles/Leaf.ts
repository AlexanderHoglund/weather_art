import { randomInt } from "@/lib/random";
import type { StageMetrics } from "@/engine/render/types";

// A drifting autumn leaf. Ported from run.js Leaf (~lines 2232-2285). The
// reference app spawns a single leaf below the viewport that never scrolls into
// view; preserved for fidelity. Drawing lives in the leaves layer.

export class Leaf {
  xPos: number;
  yPos: number;
  length: number;
  height: number;
  speed: number;
  turnSpeed: number;

  constructor(
    rawX: number,
    rawY: number,
    rawLength: number,
    rawHeight: number,
    metrics: StageMetrics,
    cloudSpeed: number,
  ) {
    this.xPos = rawX * metrics.relWidth;
    this.yPos = rawY * metrics.relHeight;
    this.length = rawLength * metrics.relWidth;
    this.height = rawHeight * metrics.relHeight;
    this.speed = cloudSpeed * randomInt(4, 5);
    this.turnSpeed = randomInt(-1, 2);
  }

  update(canvasWidth: number): void {
    this.xPos += this.speed;
    this.height += this.turnSpeed;
    if (this.height > 23 || this.height < -23) this.turnSpeed *= -1;
    if (this.xPos > canvasWidth) this.xPos = -20;
    if (this.xPos < -310) this.xPos = canvasWidth;
  }
}

export function createLeaves(
  count: number,
  metrics: StageMetrics,
  cloudSpeed: number,
): Leaf[] {
  const leaves: Leaf[] = [];
  for (let i = 0; i < count; i++) {
    const rawX = Math.random() * metrics.width * 2;
    const rawY = metrics.height + 200; // below the viewport, as in run.js
    leaves.push(
      new Leaf(rawX, rawY, randomInt(10, 20), randomInt(10, 20), metrics, cloudSpeed),
    );
  }
  return leaves;
}
