import type { FrameInfo } from "@/engine/render/types";

// Colour tints drawn over the city: the per-weather `weatherLight` overlay plus
// the night/morning colour washes. Ported from run.js weatherLight(),
// nightColor(), morningColor() (~lines 1046-1058, 1431-1435). The original used
// path rect()+fill() without beginPath (a latent path leak); fillRect() gives
// the same visual without it.

export function drawTints(ctx: CanvasRenderingContext2D, frame: FrameInfo): void {
  const { metrics, visual, isDay, isNight, isMorning } = frame;
  const { r, g, b, a } = visual.light;

  ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
  ctx.fillRect(0, 0, metrics.width, metrics.height);

  if (isNight && !isDay) {
    ctx.fillStyle = "rgba(31,15,187,0.3)";
    ctx.fillRect(0, 0, metrics.width, metrics.height);
  }
  if (isMorning && !isDay) {
    ctx.fillStyle = "rgba(255,0,255,0.1)";
    ctx.fillRect(0, 0, metrics.width, metrics.height);
  }
}
