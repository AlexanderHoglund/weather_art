"use client";

import { Fragment, useEffect, useRef } from "react";
import { useWeatherStore } from "@/lib/store";
import type { ForecastSlot } from "@/lib/types";
import { ForecastGlyph } from "./ForecastGlyph";

// Scrollable hourly forecast timeline. Exposes every 3-hour slot the free tier
// returns (~40 across ~5 days) with day-divider labels. A leading "Now" cell
// returns to live weather. Selecting a cell repaints the whole scene (via the
// store's forecastSlot) — the readable strip doubles as the selector, replacing
// both the old segmented control and the tiny on-canvas chips.

const EMPTY: ForecastSlot[] = [];

export function ForecastTimeline() {
  const slots = useWeatherStore((s) => s.forecast?.slots ?? EMPTY);
  const selected = useWeatherStore((s) => s.forecastSlot);
  const setSlot = useWeatherStore((s) => s.setForecastSlot);
  const nowTemp = useWeatherStore((s) => s.current?.tempC);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: "smooth",
    });
  }, [selected, slots]);

  if (nowTemp === undefined || slots.length === 0) return null;

  // A divider precedes the first slot of each calendar day (computed purely).
  const showDividerAt = slots.map(
    (slot, i) => i === 0 || slot.dayKey !== slots[i - 1].dayKey,
  );

  return (
    <div className="forecastTimeline" role="radiogroup" aria-label="Forecast">
      <button
        ref={selected === null ? activeRef : undefined}
        type="button"
        role="radio"
        aria-checked={selected === null}
        aria-label="Now (live weather)"
        className={`forecastSlot${selected === null ? " forecastSlotActive" : ""}`}
        onClick={() => setSlot(null)}
      >
        <span className="forecastTime">Now</span>
        <span className="forecastTemp">{Math.round(nowTemp)}°</span>
      </button>

      {slots.map((slot, i) => {
        const showDivider = showDividerAt[i];
        const active = selected === i;
        return (
          <Fragment key={i}>
            {showDivider && (
              <div className="forecastDay" aria-hidden="true">
                <span className="forecastDayName">{slot.weekday}</span>
                <span className="forecastDayNum">{slot.dayOfMonth}</span>
              </div>
            )}
            <button
              ref={active ? activeRef : undefined}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={`${slot.weekday} ${slot.monthShort} ${slot.dayOfMonth}, ${slot.timeLabel}, ${Math.round(slot.tempC)} degrees`}
              className={`forecastSlot${active ? " forecastSlotActive" : ""}`}
              onClick={() => setSlot(i)}
            >
              <span className="forecastTime">{slot.timeLabel}</span>
              <ForecastGlyph weatherId={slot.weatherId} isDay={slot.isDayIcon} />
              <span className="forecastTemp">{Math.round(slot.tempC)}°</span>
            </button>
          </Fragment>
        );
      })}
    </div>
  );
}
