"use client";

import { ForecastTimeline } from "./ForecastTimeline";
import { LocationPicker } from "./LocationPicker";
import { ShareButton } from "./ShareButton";
import { SoundButton } from "./SoundButton";

// Consolidated top bar: a unified location picker (current city -> search +
// presets popover) on the left, sound on the right, with the scrollable hourly
// forecast timeline beneath.

export function ControlBar() {
  return (
    <div className="controlBar">
      <div className="controlBarRow">
        <LocationPicker />
        <ShareButton />
        <SoundButton />
      </div>
      <ForecastTimeline />
    </div>
  );
}
