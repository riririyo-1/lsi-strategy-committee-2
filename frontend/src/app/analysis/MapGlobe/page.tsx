import MapGlobeClient from "@/features/analysis/components/MapGlobeClient";
import PageWithBackground from "@/components/layouts/PageWithBackground";

// 拠点マップ

export default function MapGlobe() {
  return (
    <PageWithBackground>
      <MapGlobeClient />
    </PageWithBackground>
  );
}