"use client";

import { useWeatherStore } from "@/lib/store";

// Scrolling song-title marquee (#songInfo). Shows the current track while audio
// is playing.
export function SongMarquee() {
  const { isPlaying, currentTitle } = useWeatherStore((s) => s.audio);

  return (
    <div className="marqueeWrapper">
      <div className="marquee">
        <span id="songInfo">{isPlaying ? currentTitle : ""}</span>
      </div>
    </div>
  );
}
