import type { Scene } from "@/engine/scene";

// Birds layer. Delegates to the Birds flock (engine/particles/Birds). Drawn on
// the city canvas before the city image, so birds sit behind the skyline like
// the reference app.

export function drawBirds(
  ctx: CanvasRenderingContext2D,
  scene: Scene,
): void {
  scene.birds.draw(ctx);
  scene.birds.update();
}
