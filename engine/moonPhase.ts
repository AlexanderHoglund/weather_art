// Moon-phase calculation and art selection, ported verbatim (logic-wise) from
// run.js getMoonPhase() (~lines 848-896).

const MOON = "/Images/moonandsun";

/**
 * Returns the moon phase as an integer 0-7:
 *   0 New · 1 Waxing Crescent · 2 First Quarter · 3 Waxing Gibbous
 *   4 Full · 5 Waning Gibbous · 6 Last Quarter · 7 Waning Crescent
 */
export function getMoonPhase(year: number, month: number, day: number): number {
  let y = year;
  let m = month;
  if (m < 3) {
    y--;
    m += 12;
  }
  m += 1;
  const daysInYear = 365.25 * y;
  const daysInMonth = 30.6 * m;
  let elapsed = daysInYear + daysInMonth + day - 694039.09; // total days elapsed
  elapsed /= 29.5305882; // divide by the moon cycle
  const integerPart = Math.floor(elapsed);
  elapsed -= integerPart; // fractional part of the cycle
  let phase = Math.round(elapsed * 8); // scale 0-8 and round
  if (phase >= 8) phase = 0; // 0 and 8 are the same phase
  return phase;
}

/** Maps a phase index to the (3-image) moon artwork the reference app uses. */
export function moonImageForPhase(phase: number): string {
  if (phase === 4 || phase === 5) return `${MOON}/moonfull.png`;
  if (phase > 2 && phase < 5) return `${MOON}/mooncrescent.png`;
  // phase < 3, or 5 < phase < 8
  return `${MOON}/moonhalf.png`;
}
