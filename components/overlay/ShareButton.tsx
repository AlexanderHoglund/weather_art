"use client";

import { useEffect, useRef, useState } from "react";
import { useWeatherStore } from "@/lib/store";

// Shares a link to the current location. Uses the native share sheet on devices
// that support it (mobile), otherwise copies the URL to the clipboard and shows
// a brief "Copied!" confirmation. The URL is kept current by useLocationUrl, so
// window.location.href already points at exactly what's on screen.

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
      <line x1="15.4" y1="6.5" x2="8.6" y2="10.5" />
    </svg>
  );
}

export function ShareButton() {
  const displayName = useWeatherStore((s) => s.displayName);
  const currentName = useWeatherStore((s) => s.current?.locationName);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  async function share() {
    const url = window.location.href;
    const place = displayName ?? currentName ?? "the weather";
    const title = `PixelWeather — ${place}`;

    // Native share sheet where available (mostly mobile).
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // User dismissed the sheet, or it failed — fall through to copy.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
    } catch {
      return; // Clipboard blocked (e.g. insecure context); nothing else to do.
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      className={`shareButton${copied ? " shareButtonDone" : ""}`}
      onClick={share}
      aria-label="Share a link to this location"
      title="Share a link to this location"
    >
      <ShareIcon />
      {copied ? "Copied!" : "Share"}
    </button>
  );
}
