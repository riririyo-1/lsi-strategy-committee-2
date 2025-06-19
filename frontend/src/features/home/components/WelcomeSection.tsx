"use client";

import { useI18n } from "@/features/i18n/hooks/useI18n";
import { Button } from "@/components/ui/Button";

const WelcomeSection = () => {
  const { t } = useI18n();

  return (
    <section
      id="welcome-section"
      className="page-section bg-white/80 dark:bg-black/60 p-8 md:p-12 rounded-xl shadow-2xl max-w-3xl mx-auto mb-12 text-center text-gray-900 dark:text-white"
    >
      <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white text-shadow">
        {t("home.welcome.title")}
      </h1>
      <p className="text-lg md:text-xl mb-8 text-gray-700 dark:text-gray-200 text-shadow-sm">
        {t("home.welcome.description")}
      </p>
      <Button
        variant="primary"
        size="lg"
        className="transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
      >
        {t("home.welcome.button")}
      </Button>
    </section>
  );
};

export default WelcomeSection;
