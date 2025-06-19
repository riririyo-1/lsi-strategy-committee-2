"use client";

import { ReactNode } from "react";
import { BackgroundConfig } from "@/types/BackgroundConfig";

interface PageBackgroundProps {
  config?: BackgroundConfig;
  children: ReactNode;
}

const PageBackground = ({ config, children }: PageBackgroundProps) => {
  if (!config || config.type === "color") {
    // デフォルト背景色は layout.tsx 側で管理
    return <>{children}</>;
  }

  if (config.type === "image") {
    return (
      <>
        <div
          className="fixed inset-0 z-[-1] w-full h-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${config.src})` }}
          role="img"
          aria-label={config.alt}
        />
        {children}
      </>
    );
  }

  if (config.type === "video") {
    return (
      <>
        <div className="fixed inset-0 z-[-1] w-full h-full">
          <video
            className="w-full h-full object-cover"
            src={config.src}
            autoPlay={config.options?.autoPlay ?? true}
            loop={config.options?.loop ?? true}
            muted={config.options?.muted ?? true}
            controls={config.options?.controls ?? false}
            playsInline
          />
        </div>
        {children}
      </>
    );
  }

  // threejsや他のタイプは未実装
  return <>{children}</>;
};

export default PageBackground;
