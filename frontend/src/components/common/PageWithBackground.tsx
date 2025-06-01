"use client";

import { usePageBackground } from "@/features/background/hooks/usePageBackground";
import PageBackground from "@/components/common/PageBackground";
import { ReactNode } from "react";

interface PageWithBackgroundProps {
  children: ReactNode;
  className?: string;
}

const PageWithBackground = ({
  children,
  className = "",
}: PageWithBackgroundProps) => {
  const config = usePageBackground();
  return (
    <PageBackground config={config}>
      <div
        className={`content-overlay w-full flex flex-col items-center pt-[160px] pb-5 px-5 text-white ${className}`}
      >
        <div className="w-full max-w-7xl">{children}</div>
      </div>
    </PageBackground>
  );
};

export default PageWithBackground;
