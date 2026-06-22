"use client";

import { useWeatherStore } from "@/lib/store";

// A fade/blur veil over the stage while new weather loads. Driven by the store
// `status` already set by useWeatherData. Fading it in during 'loading' and out
// on 'ready' masks the scene's particle rebuild, so switching location reads as
// a soft crossfade instead of a hard snap. Errors surface as a small alert.

export function TransitionVeil() {
  const status = useWeatherStore((s) => s.status);
  const error = useWeatherStore((s) => s.error);
  const loading = status === "loading";

  return (
    <>
      <div
        className={`transitionVeil${loading ? " transitionVeilActive" : ""}`}
        aria-hidden="true"
      />
      {status === "error" && (
        <div className="weatherError" role="alert">
          {error ?? "Could not load weather."}
        </div>
      )}
    </>
  );
}
