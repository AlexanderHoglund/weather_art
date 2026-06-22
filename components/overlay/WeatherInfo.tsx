"use client";

import { selectActiveView, useWeatherStore } from "@/lib/store";

// The location / day / description / temperature / wind text block. The "day"
// label reflects the selected forecast slot (weekday + date + time) or "Today".

export function WeatherInfo() {
  // Subscribe to raw slices (stable references) and derive the view in render.
  // Deriving inside the selector would return a fresh object each call and
  // trip zustand v5's "snapshot changed" infinite re-render.
  const current = useWeatherStore((s) => s.current);
  const forecast = useWeatherStore((s) => s.forecast);
  const todayTime = useWeatherStore((s) => s.todayTime);
  const forecastSlot = useWeatherStore((s) => s.forecastSlot);
  const displayName = useWeatherStore((s) => s.displayName);
  // City-level name (search result / pill label) overrides the API's district.
  const locationName = displayName ?? current?.locationName ?? "";

  const view = selectActiveView({ current, forecast, todayTime, forecastSlot });

  const slot =
    forecastSlot === null ? null : forecast?.slots[forecastSlot] ?? null;
  const dayLabel = slot
    ? `${slot.weekday}, ${slot.monthShort} ${slot.dayOfMonth} · ${slot.timeLabel}`
    : "Today";

  const tempC = view ? view.tempC.toFixed(1) : "–";
  const tempF = view ? ((view.tempC * 9) / 5 + 32).toFixed(0) : "–";

  return (
    <div id="textOverlayWeather">
      <span id="weatherLocation">{locationName}</span>{" "}
      <span id="weatherDay">{dayLabel}</span>
      <br />
      <span id="weatherDescription">{view?.description ?? ""}</span>
      <br />
      <span id="temperature">{tempC} °C</span>{" "}
      <span id="tempF">({tempF} °F)</span>
      <br />
      <span id="windSpeedAndDirection">
        {view ? `Wind speed ${view.windSpeedMs} m/s` : ""}
      </span>
    </div>
  );
}
