// A single snowflake. Ported from run.js SnowParticle (~lines 2094-2130).

export class SnowFlake {
  x: number;
  y: number;
  size: number;
  weight: number;
  directionX: number;

  constructor(x: number, y: number, cloudSpeed: number) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 3 + 2;
    this.weight = Math.random() * 0.05 + 0.15;
    this.directionX = Math.random() * cloudSpeed * 2;
  }

  update(canvasWidth: number, canvasHeight: number): void {
    if (this.y > canvasHeight) {
      this.y = 0 - this.size - 50;
      this.weight = Math.random() * 0.1 + 0.15;
      this.x = Math.random() * canvasWidth * 1.3;
    }
    this.weight += 0.004;
    this.y += this.weight;
    this.x += this.directionX;
  }
}

export function createSnow(
  count: number,
  canvasWidth: number,
  canvasHeight: number,
  cloudSpeed: number,
): SnowFlake[] {
  const flakes: SnowFlake[] = [];
  for (let i = 0; i < count; i++) {
    flakes.push(
      new SnowFlake(
        Math.random() * canvasWidth,
        Math.random() * canvasHeight,
        cloudSpeed,
      ),
    );
  }
  return flakes;
}
