import { getImage, isReady } from "@/engine/assets";
import { BIRD_SPRITES } from "@/engine/sprites";
import type { StageMetrics } from "@/engine/render/types";

// The three-bird flock animation. Ported from run.js (~lines 2292-2380). Birds
// drift slowly rightward forever (the reference app never wraps them) while
// their wing frames cycle. Drawn behind the city silhouette.

const SCALE = 1.5;
const FRAME_W = 16;
const FRAME_H = 18;
const SCALED_W = SCALE * FRAME_W;
const SCALED_H = SCALE * FRAME_H;

const fill = (value: number, count: number) => Array<number>(count).fill(value);
const CYCLE = [...fill(0, 18), ...fill(1, 18), ...fill(2, 20), ...fill(3, 20)];
const CYCLE2 = [...fill(0, 30), ...fill(1, 22), ...fill(2, 20), ...fill(3, 20)];

export class Birds {
  private loopIndex = 0;
  private x: number;
  private y: number;
  private x1: number;
  private y1: number;
  private x2: number;
  private y2: number;
  private readonly speedX = 0.2;
  private readonly speedX1 = 0.1;
  private readonly speedX2 = 0.07;

  constructor(metrics: StageMetrics) {
    const startX = 100 * metrics.relWidth;
    const startY = 450 * metrics.relHeight;
    this.x = startX;
    this.y = startY;
    this.x1 = startX;
    this.y1 = startY - 10;
    this.x2 = startX;
    this.y2 = startY + 10;
  }

  private static drawFrame(
    ctx: CanvasRenderingContext2D,
    src: string,
    frameX: number,
    canvasX: number,
    canvasY: number,
  ): void {
    const img = getImage(src);
    if (!isReady(img)) return;
    ctx.drawImage(
      img,
      frameX * FRAME_W,
      0,
      FRAME_W,
      FRAME_H,
      canvasX,
      canvasY,
      SCALED_W,
      SCALED_H,
    );
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const [b1, b2, b3] = BIRD_SPRITES;
    Birds.drawFrame(ctx, b1, CYCLE[this.loopIndex], this.x, this.y);
    Birds.drawFrame(ctx, b2, CYCLE[this.loopIndex], this.x1, this.y1);
    Birds.drawFrame(ctx, b3, CYCLE2[this.loopIndex], this.x2, this.y2);
    this.loopIndex++;
    if (this.loopIndex >= CYCLE.length) this.loopIndex = 0;
  }

  update(): void {
    this.x += this.speedX;
    this.x1 += this.speedX1;
    this.x2 += this.speedX2;
  }
}
