"use client";

import { useRef } from "react";
import { useRenderLoop } from "@/hooks/useRenderLoop";
import { useWeatherData } from "@/hooks/useWeatherData";
import { useLocationUrl } from "@/hooks/useLocationUrl";

// The canvas stage. Renders the stacked canvases (DOM order == z-order, matching
// index.html lines 144-153 minus the unused fireworks canvas), drives weather
// fetching, and runs the single render loop.

export function WeatherStage() {
  useWeatherData();
  useLocationUrl();

  const sky = useRef<HTMLCanvasElement>(null);
  const sunMoon = useRef<HTMLCanvasElement>(null);
  const clouds = useRef<HTMLCanvasElement>(null);
  const cityMain = useRef<HTMLCanvasElement>(null);
  const cityBlack = useRef<HTMLCanvasElement>(null);
  const rain = useRef<HTMLCanvasElement>(null);

  useRenderLoop({ sky, sunMoon, clouds, cityMain, cityBlack, rain });

  return (
    <div id="wrapper">
      <canvas ref={sky} />
      <canvas ref={sunMoon} />
      <canvas ref={clouds} />
      <canvas ref={cityMain} />
      <canvas ref={cityBlack} />
      <canvas ref={rain} />
    </div>
  );
}
