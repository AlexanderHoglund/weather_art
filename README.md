# pixelWeather (Next.js)

A pixel-art "lofi weather" web app. Live OpenWeather data drives a layered
`<canvas>` scene — sky, sun/moon, clouds, rain/snow, thunder, a per-location
cityscape, birds and time-of-day tints — over which an overlay UI lets you pick
a location and a short forecast. This is a full TypeScript + React rebuild of the
original vanilla-JS app (see `../pixelWeather`), decomposed into typed hooks,
render layers and components.

## Getting started

1. Create `.env.local` with your OpenWeather API key:

   ```
   WEATHER_API_KEY=your_key_here
   ```

   The free plan is enough — the app uses `/data/2.5/weather` (current) and
   `/data/2.5/forecast` (5-day / 3-hour). The retired One Call API is **not**
   required.

2. Install and run:

   ```bash
   npm install
   npm run dev
   ```

   Open http://localhost:3000.

Other scripts: `npm run build`, `npm run start`, `npm run lint`.

## Architecture

```
app/
  layout.tsx                 root layout + local ARCADECLASSIC font
  page.tsx                   composes the stage + overlays
  globals.css                ported overlay layout / marquee / selects
  api/weather/route.ts       OpenWeather proxy (key server-side); normalizes
                             current + forecast, remaps 3-hourly -> +3/6/9h icons
components/
  WeatherStage.tsx           owns the 7 canvases, runs the render loop
  overlay/                   LocationSelect, ForecastSelect, WeatherInfo,
                             SoundButton, SongMarquee, CreditsModal
hooks/
  useWeatherData.ts          fetch on coord change -> store
  useGeolocation.ts          "My location"
  useRenderLoop.ts           single requestAnimationFrame loop + resize
  useAudioPlayer.ts          playlist + ended -> next
engine/
  render.ts                  per-frame orchestrator (exact original draw order)
  scene.ts                   builds artwork + particle systems per weather state
  weatherVisuals.ts          weatherId -> VisualConfig (replaces the big switch)
  weatherIcons.ts            forecast icon art selection
  timeOfDay.ts moonPhase.ts  pure time/moon math
  assets.ts sprites.ts       image cache + asset paths
  particles/                 Cloud, RainDrop, SnowFlake, Leaf, Birds
  layers/                    sky, sunMoon, clouds, rain, snow, city, birds,
                             thunder, icons, tints
lib/
  store.ts                   Zustand store + selectActiveView selector
  locations.ts types.ts      typed location table + domain types
  mapTo.ts random.ts         math utils
```

The render loop reads the latest state via `useWeatherStore.getState()` every
frame (no React re-renders in the hot path); overlay components subscribe
normally. Selecting a location or forecast just updates state — there is no
`location.reload()` like the original.

## Notable changes from the original

- **No ipgeolocation time API.** Local time/date is derived from the OpenWeather
  `timezone` offset, removing a second API and key.
- **Forecast.** One Call 2.5/3.0 are retired/paid; the free 5-day/3-hour endpoint
  is remapped — `list[1..3]` for the +3/6/9h chips and the entry nearest local
  noon for Tomorrow / Day-after.
- Visual quirks of the reference app are preserved on purpose (e.g. Kyiv reuses
  its day image as the night mask; the 20:00 time-of-day gap). These are noted in
  comments where they occur.

## Deployment notes

- `public/songs/` is ~52 MB of audio. It works locally but is large to commit /
  deploy — consider hosting the audio on a CDN or object storage and pointing
  `useAudioPlayer` at those URLs before deploying.
- Set `WEATHER_API_KEY` as an environment variable on the host.
