import { WeatherStage } from "@/components/WeatherStage";
import { ControlBar } from "@/components/overlay/ControlBar";
import { CreditsModal } from "@/components/overlay/CreditsModal";
import { SongMarquee } from "@/components/overlay/SongMarquee";
import { TransitionVeil } from "@/components/overlay/TransitionVeil";
import { WeatherInfo } from "@/components/overlay/WeatherInfo";

export default function Home() {
  return (
    <main>
      {/* Centered, aspect-capped stage. On screens wider than the cap it is
          pillarboxed; the solid surround colour (body background) shows in the
          margins. Canvases AND controls live inside so nothing floats over the
          empty sides. */}
      <div id="stage">
        <WeatherStage />
        <TransitionVeil />
        <ControlBar />
        <SongMarquee />
        <WeatherInfo />
        <CreditsModal />
      </div>
    </main>
  );
}
