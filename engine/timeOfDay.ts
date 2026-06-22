import type { TimeOfDay } from "@/lib/types";

// ---------------------------------------------------------------------------
// Pure time-of-day math, ported from run.js (~lines 516-572). The reference
// app fetched local time from ipgeolocation; we instead derive it from the
// OpenWeather `timezone` offset, so no second API/key is needed. All wall-clock
// values are computed in the *location's* local time, not the browser's.
// ---------------------------------------------------------------------------

const MS = 1000;
const MINUTES_PER_HOUR = 60;

/** Shift a UTC unix time into the location's local time, read via UTC getters. */
function localDate(unixSeconds: number, tzSeconds: number): Date {
  return new Date((unixSeconds + tzSeconds) * MS);
}

/** Minutes since local midnight (0-1439) for a unix time at the given offset. */
export function localMinutesOfDay(unixSeconds: number, tzSeconds: number): number {
  const d = localDate(unixSeconds, tzSeconds);
  return d.getUTCHours() * MINUTES_PER_HOUR + d.getUTCMinutes();
}

/**
 * Morning / day / night flags from minutes-since-midnight.
 * Thresholds match the reference app exactly (including its 1200 gap, where
 * exactly 20:00 is none of the three).
 */
export function phaseFlags(timeInMinutes: number): {
  isMorning: boolean;
  isDay: boolean;
  isNight: boolean;
} {
  return {
    isMorning: timeInMinutes <= 450,
    isDay: timeInMinutes > 450 && timeInMinutes < 1200,
    isNight: timeInMinutes > 1200,
  };
}

/** The full "today" time-of-day for a location, from its timezone offset. */
export function computeTimeOfDay(
  tzSeconds: number,
  nowUnixSeconds: number = Date.now() / MS,
): TimeOfDay {
  const d = localDate(nowUnixSeconds, tzSeconds);
  const timeInMinutes =
    d.getUTCHours() * MINUTES_PER_HOUR + d.getUTCMinutes();
  return {
    timeInMinutes,
    ...phaseFlags(timeInMinutes),
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1, // 1-12
    day: d.getUTCDate(),
  };
}
