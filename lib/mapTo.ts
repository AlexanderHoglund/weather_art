// Linear remap from one numeric range to another (the original `mapTo`).
// Used heavily by the render engine to map time-of-day to alpha/position.

export function mapTo(
  num: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  return ((num - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}
