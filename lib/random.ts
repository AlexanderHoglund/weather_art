// Math/random helpers ported from the original public/weather.js.
// Note: randomFloat keeps the original "+1" quirk so particle sizing matches the
// reference app exactly.

export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min + 1) + min;
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
