import type { VisualConfig } from "@/lib/types";

// Internal render types shared by the engine layers. Each layer is a pure
// function (ctx, frame, scene) => void; this file describes the inputs.

/**
 * Per-resize stage geometry. In the reference app every canvas is the window
 * size; positions are authored in "opt" space (1366x768 desktop / 360x760
 * mobile) and scaled by relWidth/relHeight.
 */
export interface StageMetrics {
  width: number;
  height: number;
  relWidth: number;
  relHeight: number;
  /** Horizontal crop fractions for source artwork (mobile zooms in). */
  cropStart: number;
  cropEnd: number;
}

/** The 2D contexts for each stacked canvas (DOM/z order). */
export interface StageContexts {
  sky: CanvasRenderingContext2D;
  sunMoon: CanvasRenderingContext2D;
  clouds: CanvasRenderingContext2D;
  cityMain: CanvasRenderingContext2D;
  cityBlack: CanvasRenderingContext2D;
  rain: CanvasRenderingContext2D;
}

/** The mutable per-frame values derived from store state. */
export interface FrameInfo {
  metrics: StageMetrics;
  timeInMinutes: number;
  sunriseMinutes: number;
  sunsetMinutes: number;
  lengthOfDay: number;
  isMorning: boolean;
  isDay: boolean;
  isNight: boolean;
  isToday: boolean;
  /** Location-specific lightening of the night mask (Hong Kong). */
  darknessAdjuster: number;
  visual: VisualConfig;
}

/** Compute stage geometry from the current window size. */
export function computeMetrics(width: number, height: number): StageMetrics {
  const isDesktop = width > 601;
  const optWidth = isDesktop ? 1366 : 360;
  const optHeight = isDesktop ? 768 : 760;
  return {
    width,
    height,
    relWidth: width / optWidth,
    relHeight: height / optHeight,
    cropStart: isDesktop ? 0 : 0.43,
    cropEnd: isDesktop ? 1 : 0.42,
  };
}

/** Cloud/particle horizontal speed from wind, matching run.js. */
export function windSpeedToCloudSpeed(windSpeedMs: number): number {
  if (windSpeedMs > 7) return 0.3;
  if (windSpeedMs > 3) return 0.2;
  return 0.1;
}

/** -1 (leftward) or +1 (rightward) from wind degrees, matching run.js. */
export function windDirectionSign(windDeg: number): number {
  return windDeg < 181 ? -1 : 1;
}
