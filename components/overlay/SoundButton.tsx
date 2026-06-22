"use client";

import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useWeatherStore } from "@/lib/store";

// Compact sound toggle that lives in the control bar. Tints pink while playing.
export function SoundButton() {
  const { toggle } = useAudioPlayer();
  const isPlaying = useWeatherStore((s) => s.audio.isPlaying);

  return (
    <button
      type="button"
      className={`soundButton${isPlaying ? " soundButtonOn" : ""}`}
      onClick={toggle}
      aria-pressed={isPlaying}
      aria-label={isPlaying ? "Mute music" : "Play music"}
      title={isPlaying ? "Mute music" : "Play music"}
    >
      {isPlaying ? "♪ on" : "♪ off"}
    </button>
  );
}
