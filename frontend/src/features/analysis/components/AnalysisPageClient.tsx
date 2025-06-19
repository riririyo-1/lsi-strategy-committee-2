"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const earningsLinks = [
  {
    name: "TSMC",
    url: "https://investor.tsmc.com/japanese/quarterly-results",
    color: "indigo",
    description:
      "台湾積体電路製造（TSMC）は、世界最大の半導体ファウンドリです。",
    button: "bg-indigo-500 hover:bg-indigo-600",
  },
  {
    name: "UMC",
    url: "https://www.umc.com/en/Download/quarterly_results/QuarterlyResults",
    color: "green",
    description:
      "聯華電子（UMC）は、台湾を拠点とする大手半導体ファウンドリです。",
    button: "bg-green-500 hover:bg-green-600",
  },
  {
    name: "Samsung Electronics",
    url: "https://www.samsung.com/global/ir/financial-information/earnings-release/",
    color: "blue",
    description:
      "サムスン電子は、メモリ半導体やシステムLSIなどを手がける韓国の総合電機メーカーです。",
    button: "bg-blue-500 hover:bg-blue-600",
  },
  {
    name: "SMIC",
    url: "https://www.smics.com/jp/site/company_financialSummary#page_slide_0",
    color: "teal",
    description:
      "中芯国際集成電路製造（SMIC）は、中国を拠点とする大手半導体ファウンドリです。",
    button: "bg-teal-500 hover:bg-teal-600",
  },
  {
    name: "GlobalFoundries",
    url: "https://investors.gf.com/financials-and-filings/quarterly-results",
    color: "red",
    description:
      "GFとしても知られるGlobalFoundriesは、米国を拠点とする大手半導体ファウンドリです。",
    button: "bg-red-500 hover:bg-red-600",
  },
  {
    name: "SK hynix",
    url: "https://www.skhynix.com/ir/UI-FR-IR01/",
    color: "orange",
    description:
      "SKハイニックスは、韓国を拠点とする大手メモリ半導体メーカーです。",
    button: "bg-orange-500 hover:bg-orange-600",
  },
  {
    name: "Micron Technology",
    url: "https://investors.micron.com/quarterly-results",
    color: "purple",
    description:
      "マイクロン・テクノロジーは、米国を拠点とする大手メモリおよびストレージソリューションメーカーです。",
    button: "bg-purple-500 hover:bg-purple-600",
  },
];

const AnalysisPageClient: React.FC = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-4xl md:text-5xl font-bold mb-10 text-center text-white text-shadow">
        半導体企業 四半期決算資料リンク集
      </h1>
      <p className="text-xl mb-8 text-center max-w-4xl">
        主要な半導体メーカーの最新決算情報へアクセスできます。
      </p>
      <div className="mb-10 flex justify-center">
        <Button
          variant="primary"
          onClick={() => router.push("/analysis/MapGlobe")}
          className="shadow-lg"
        >
          拠点マップで表示
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl">
        {earningsLinks.map((company) => (
          <Card
            key={company.name}
            title={company.name}
            summary={company.description}
            variant="default"
            colorTheme="analysis"
          >
            <div className="flex justify-start mt-4">
              <a
                href={company.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${company.button} text-white font-semibold py-2 px-4 rounded-lg transition duration-300`}
              >
                決算資料ページへ
              </a>
            </div>
          </Card>
        ))}
      </div>

      <footer className="text-center mt-12 py-6 border-t border-gray-700 w-full max-w-7xl">
        <p className="text-gray-300 text-sm">
          各社のIR情報は予告なく変更される場合があります。最新の情報は各社のウェブサイトでご確認ください。
        </p>
        <p className="text-gray-400 text-xs mt-1">
          最終確認日: 2025年5月26日
        </p>
      </footer>
    </div>
  );
};

export default AnalysisPageClient;