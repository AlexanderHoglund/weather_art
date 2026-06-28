"use client";

import { useEffect, type RefObject } from "react";
import { selectActiveView, useWeatherStore } from "@/lib/store";
import { LOCATIONS } from "@/lib/locations";
import { localMinutesOfDay } from "@/engine/timeOfDay";
import { computeMetrics } from "@/engine/render/types";
import { buildScene, sceneKey, type Scene } from "@/engine/scene";
import { renderFrame } from "@/engine/render";
import type { FrameInfo, StageContexts } from "@/engine/render/types";

export interface StageRefs {
  sky: RefObject<HTMLCanvasElement | null>;
  sunMoon: RefObject<HTMLCanvasElement | null>;
  clouds: RefObject<HTMLCanvasElement | null>;
  cityMain: RefObject<HTMLCanvasElement | null>;
  cityBlack: RefObject<HTMLCanvasElement | null>;
  rain: RefObject<HTMLCanvasElement | null>;
}

// Owns the canvas refs and runs the single requestAnimationFrame loop. Replaces
// run.js's inline update() IIFE (and its stacked RAF loops): one loop reads the
// latest store state via getState() each frame, rebuilds the scene only when its
// inputs change, and draws every layer in order.

export function useRenderLoop(refs: StageRefs): void {
  useEffect(() => {
    const canvases = {
      sky: refs.sky.current,
      sunMoon: refs.sunMoon.current,
      clouds: refs.clouds.current,
      cityMain: refs.cityMain.current,
      cityBlack: refs.cityBlack.current,
      rain: refs.rain.current,
    };
    const entries = Object.values(canvases);
    if (entries.some((c) => c === null)) return;
    const list = entries as HTMLCanvasElement[];

    const ctx: StageContexts = {
      sky: canvases.sky!.getContext("2d")!,
      sunMoon: canvases.sunMoon!.getContext("2d")!,
      clouds: canvases.clouds!.getContext("2d")!,
      cityMain: canvases.cityMain!.getContext("2d")!,
      cityBlack: canvases.cityBlack!.getContext("2d")!,
      rain: canvases.rain!.getContext("2d")!,
    };

    const ctxList = Object.values(ctx);
    // Size to the stage box (#wrapper), not the window: on wide screens the
    // stage is aspect-capped + pillarboxed by CSS, so the scene must fill that
    // capped box rather than the full viewport.
    const host = canvases.sky!.parentElement as HTMLElement;
    let metrics = computeMetrics(host.clientWidth, host.clientHeight);
    let scene: Scene | null = null;
    let currentKey = "";
    let raf = 0;

    const resize = () => {
      metrics = computeMetrics(host.clientWidth, host.clientHeight);
      // Render in CSS pixels but back the canvas with device pixels for crisp
      // output on high-DPI phones. Cap at 2x so 3x screens don't quadruple the
      // fill cost of heavy particle scenes. Setting canvas.width resets the
      // context transform, so re-apply it here.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      list.forEach((c, i) => {
        c.width = metrics.width * dpr;
        c.height = metrics.height * dpr;
        c.style.width = `${metrics.width}px`;
        c.style.height = `${metrics.height}px`;
        ctxList[i].setTransform(dpr, 0, 0, dpr, 0, 0);
      });
      currentKey = ""; // force a scene rebuild so particles re-scale
    };

    // Coalesce bursts of resize events into one update per frame. A
    // ResizeObserver on the stage box catches everything that changes its size —
    // window resize, pillarbox cap kicking in, and mobile toolbar (dvh) shifts.
    let resizePending = false;
    const onResize = () => {
      if (resizePending) return;
      resizePending = true;
      requestAnimationFrame(() => {
        resizePending = false;
        resize();
      });
    };
    resize();
    const observer = new ResizeObserver(onResize);
    observer.observe(host);

    const loop = () => {
      const state = useWeatherStore.getState();
      const view = selectActiveView(state);
      const current = state.current;

      if (view && current) {
        const tz = current.timezoneOffsetSeconds;
        const sunriseMinutes = localMinutesOfDay(current.sunriseUnix, tz);
        const sunsetMinutes = localMinutesOfDay(current.sunsetUnix, tz);

        const inputs = {
          metrics,
          view,
          locationKey: state.locationKey,
        };
        const key = sceneKey(inputs);
        if (key !== currentKey || !scene) {
          scene = buildScene(inputs);
          currentKey = key;
        }

        const frame: FrameInfo = {
          metrics,
          timeInMinutes: view.time.timeInMinutes,
          sunriseMinutes,
          sunsetMinutes,
          lengthOfDay: sunsetMinutes - sunriseMinutes,
          isMorning: view.time.isMorning,
          isDay: view.time.isDay,
          isNight: view.time.isNight,
          isToday: view.isToday,
          darknessAdjuster: LOCATIONS[state.locationKey].darknessAdjuster,
          visual: scene.visual,
        };
        renderFrame(ctx, frame, scene);
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
    // refs are stable useRef containers; run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
