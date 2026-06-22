import { WeatherStage } from "@/components/WeatherStage";
import { ControlBar } from "@/components/overlay/ControlBar";
import { CreditsModal } from "@/components/overlay/CreditsModal";
import { SongMarquee } from "@/components/overlay/SongMarquee";
import { TransitionVeil } from "@/components/overlay/TransitionVeil";
import { WeatherInfo } from "@/components/overlay/WeatherInfo";

export default function Home() {
  return (
    <main>
      <WeatherStage />
      <TransitionVeil />
      <ControlBar />
      <SongMarquee />
      <WeatherInfo />
      <CreditsModal />
    </main>
  );
}
