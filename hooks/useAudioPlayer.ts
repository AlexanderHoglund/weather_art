"use client";

import { useCallback, useEffect, useRef } from "react";
import { useWeatherStore } from "@/lib/store";

// Audio playlist + player. Replaces run.js's five-levels-deep nested 'ended'
// callbacks (~lines 2666-2746) with one element and a single ended -> next
// handler. Playback state (isPlaying / currentTitle) lives in the store so the
// SoundButton and SongMarquee can react.

interface Track {
  file: string;
  title: string;
}

const PLAYLIST: Track[] = [
  { file: "A01_White_and_Blue_4416_210625_MASTER.mp3", title: "White & Blue - Anton Ingvarsson" },
  { file: "A02_Anton_Project_2_Weather_B-sida_4416_210625_MASTER.mp3", title: "Forecast - Anton Ingvarsson" },
  { file: "B01_New_Weather_4416_210625_MASTER.mp3", title: "Rainbow Mycelium - Anton Ingvarsson" },
  { file: "A02_Anton_Project_2_Weather_B-sida_4416_210625_MASTER.mp3", title: "Rainbow Mycelium - Anton Ingvarsson" },
  { file: "B02_Weather_mood_1_(bells_n_birds)_4416_210625_MASTER.mp3", title: "Summertown - Anton Ingvarsson" },
];

const randomIndex = () => Math.floor(Math.random() * PLAYLIST.length);

export function useAudioPlayer(): { toggle: () => void } {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const setAudio = useWeatherStore((s) => s.setAudio);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const playRandom = () => {
      const track = PLAYLIST[randomIndex()];
      audio.src = `/songs/${encodeURIComponent(track.file)}`;
      void audio.play().catch(() => {});
      setAudio({ isPlaying: true, currentTitle: track.title });
    };
    // The reference app picked a fresh random track when the current one ended.
    audio.addEventListener("ended", playRandom);

    return () => {
      audio.removeEventListener("ended", playRandom);
      audio.pause();
      audioRef.current = null;
    };
  }, [setAudio]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (useWeatherStore.getState().audio.isPlaying) {
      audio.pause();
      setAudio({ isPlaying: false });
      return;
    }

    if (!audio.src) {
      const track = PLAYLIST[randomIndex()];
      audio.src = `/songs/${encodeURIComponent(track.file)}`;
      setAudio({ currentTitle: track.title });
    }
    void audio.play().catch(() => {});
    setAudio({ isPlaying: true });
  }, [setAudio]);

  return { toggle };
}
