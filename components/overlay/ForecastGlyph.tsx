// Custom high-contrast forecast icons (replaces the OpenWeather raster PNGs).
// Refined for a cleaner, lighter look: compact clouds, thin white rain sitting
// directly beneath the cloud, tidy evenly-spaced sun rays, and a bright outlined
// moon — all on the dark icon tile so each element stays high-contrast.

type Kind =
  | "clear-day"
  | "clear-night"
  | "partly-day"
  | "partly-night"
  | "cloudy"
  | "rain"
  | "snow"
  | "thunder"
  | "mist";

function kindFor(weatherId: number, isDay: boolean): Kind {
  if (weatherId >= 200 && weatherId <= 232) return "thunder";
  if ((weatherId >= 300 && weatherId <= 321) || (weatherId >= 500 && weatherId <= 531))
    return "rain";
  if (weatherId >= 600 && weatherId <= 622) return "snow";
  if (weatherId >= 700 && weatherId <= 781) return "mist";
  if (weatherId === 800) return isDay ? "clear-day" : "clear-night";
  if (weatherId === 801 || weatherId === 802)
    return isDay ? "partly-day" : "partly-night";
  return "cloudy"; // 803, 804, and any unmapped id
}

// Compact cloud silhouette (single clean path, no internal seams).
const CLOUD_D =
  "M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z";

function Cloud({ transform }: { transform?: string }) {
  return (
    <path
      d={CLOUD_D}
      transform={transform}
      fill="#eef2f8"
      stroke="#8b9bb6"
      strokeWidth="0.8"
      strokeLinejoin="round"
    />
  );
}

// Eight evenly-spaced rays (inner r5.8 -> outer r7.8) around a solid disc.
function Sun({ transform }: { transform?: string }) {
  return (
    <g transform={transform}>
      <g stroke="#ff8c1a" strokeWidth="1.5" strokeLinecap="round">
        <line x1="12" y1="4.2" x2="12" y2="6.2" />
        <line x1="12" y1="17.8" x2="12" y2="19.8" />
        <line x1="4.2" y1="12" x2="6.2" y2="12" />
        <line x1="17.8" y1="12" x2="19.8" y2="12" />
        <line x1="6.48" y1="6.48" x2="7.9" y2="7.9" />
        <line x1="16.1" y1="16.1" x2="17.52" y2="17.52" />
        <line x1="17.52" y1="6.48" x2="16.1" y2="7.9" />
        <line x1="7.9" y1="16.1" x2="6.48" y2="17.52" />
      </g>
      <circle cx="12" cy="12" r="4.4" fill="#ff8c1a" stroke="#e65c00" strokeWidth="0.7" />
    </g>
  );
}

function Moon({ transform }: { transform?: string }) {
  return (
    <path
      transform={transform}
      d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
      fill="#ffe49a"
      stroke="#c9a64a"
      strokeWidth="0.9"
      strokeLinejoin="round"
    />
  );
}

// Thin white drops directly under the (top-positioned) cloud.
function RainDrops() {
  return (
    <g stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round">
      <line x1="9" y1="13.2" x2="8.2" y2="16" />
      <line x1="11.7" y1="13.4" x2="10.9" y2="16.6" />
      <line x1="14.4" y1="13.2" x2="13.6" y2="16" />
    </g>
  );
}

function SnowFlakes() {
  return (
    <g fill="#ffffff">
      <circle cx="9" cy="14.4" r="1.1" />
      <circle cx="11.7" cy="15.6" r="1.1" />
      <circle cx="14.4" cy="14.4" r="1.1" />
    </g>
  );
}

function Bolt() {
  return (
    <polygon
      points="12.4,12.6 9.6,16.8 11.6,16.8 10.4,20.2 14.2,15.2 12.1,15.2 13.1,12.6"
      fill="#ffd23a"
      stroke="#e0a200"
      strokeWidth="0.5"
      strokeLinejoin="round"
    />
  );
}

function Mist() {
  return (
    <g stroke="#d3dce9" strokeWidth="1.6" strokeLinecap="round">
      <line x1="5" y1="8" x2="19" y2="8" />
      <line x1="4" y1="12" x2="17" y2="12" />
      <line x1="6" y1="16" x2="20" y2="16" />
    </g>
  );
}

function Glyph({ kind }: { kind: Kind }) {
  switch (kind) {
    case "clear-day":
      return <Sun />;
    case "clear-night":
      return <Moon transform="translate(0.5 0.5) scale(0.92)" />;
    case "partly-day":
      return (
        <>
          <Sun transform="translate(7.5 0) scale(0.46)" />
          <Cloud transform="translate(1.5 6.5) scale(0.62)" />
        </>
      );
    case "partly-night":
      return (
        <>
          <Moon transform="translate(8 0.5) scale(0.42)" />
          <Cloud transform="translate(1.5 6.5) scale(0.62)" />
        </>
      );
    case "cloudy":
      return <Cloud transform="translate(3.6 4.2) scale(0.7)" />;
    case "rain":
      return (
        <>
          <Cloud transform="translate(4.6 0) scale(0.62)" />
          <RainDrops />
        </>
      );
    case "snow":
      return (
        <>
          <Cloud transform="translate(4.6 0) scale(0.62)" />
          <SnowFlakes />
        </>
      );
    case "thunder":
      return (
        <>
          <Cloud transform="translate(4.6 0) scale(0.62)" />
          <Bolt />
        </>
      );
    case "mist":
      return <Mist />;
  }
}

export function ForecastGlyph({
  weatherId,
  isDay,
}: {
  weatherId: number;
  isDay: boolean;
}) {
  return (
    <svg className="forecastIcon" viewBox="0 0 24 24" aria-hidden="true">
      <Glyph kind={kindFor(weatherId, isDay)} />
    </svg>
  );
}
