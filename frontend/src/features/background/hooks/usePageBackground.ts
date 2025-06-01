"use client";

import { useEffect, useState } from "react";
import { BackgroundConfig } from "@/types/BackgroundConfig";
import { BackgroundJsonRepository } from "../infrastructure/BackgroundJsonRepository";
import { GetPageBackground } from "../use-cases/GetPageBackground";
import { usePathname } from "next/navigation";
import { IBackgroundRepository } from "../ports/IBackgroundRepository";

// 依存関係を外部から注入できるようにする
export function createUsePageBackground(repository: IBackgroundRepository) {
  return function usePageBackground(): BackgroundConfig | undefined {
    const [config, setConfig] = useState<BackgroundConfig>();
    const pathname = usePathname();

    useEffect(() => {
      const usecase = new GetPageBackground(repository);
      // ユースケースにパス（pathname）を渡すだけで、内部でID変換
      usecase.execute(pathname).then(setConfig);
    }, [pathname]);

    return config;
  };
}

// デフォルトのリポジトリを使用したフックのエクスポート
export const usePageBackground = createUsePageBackground(
  new BackgroundJsonRepository()
);
