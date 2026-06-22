// A single raindrop. Ported from run.js Particle (~lines 2027-2070).

export class RainDrop {
  x: number;
  y: number;
  size: number;
  weight: number;
  directionX: number;

  constructor(x: number, y: number, drizzleVar: number, cloudSpeed: number) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 6 + 1 - drizzleVar;
    this.weight = Math.random() * 0.5 + 1;
    this.directionX = Math.random() * cloudSpeed * 2;
  }

  update(canvasWidth: number, canvasHeight: number): void {
    if (this.y > canvasHeight) {
      this.y = 0 - this.size;
      this.weight = Math.random() * 0.5 + 1;
      this.x = Math.random() * canvasWidth * 1.3;
    }
    this.weight += 0.01;
    this.y += this.weight;
    this.x += this.directionX;
  }
}

export function createRain(
  count: number,
  canvasWidth: number,
  canvasHeight: number,
  drizzleVar: number,
  cloudSpeed: number,
): RainDrop[] {
  const drops: RainDrop[] = [];
  for (let i = 0; i < count; i++) {
    drops.push(
      new RainDrop(
        Math.random() * canvasWidth,
        Math.random() * canvasHeight,
        drizzleVar,
        cloudSpeed,
      ),
    );
  }
  return drops;
}
