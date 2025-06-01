import WelcomeSection from "@/features/home/components/WelcomeSection";
import PageWithBackground from "@/components/common/PageWithBackground";

// ホーム

export default function HomePage() {
  return (
    <PageWithBackground>
      <div className="w-full flex justify-center">
        <WelcomeSection />
      </div>
    </PageWithBackground>
  );
}
