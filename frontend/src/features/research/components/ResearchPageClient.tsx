"use client";

import { useI18n } from "@/features/i18n/hooks/useI18n";
import { TrendReport } from "@/types/trendReport";
import { ResearchReportService } from "@/features/admin/services/ResearchReportService";
import ReportCard from "./ReportCard";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

const ResearchPageClient = () => {
  // i18n機能を使用
  const { t } = useI18n();

  // 状態管理
  const [reports, setReports] = useState<TrendReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // APIからデータをフェッチ
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const data = await ResearchReportService.getReports();
        setReports(data);
        setError(null);
      } catch (err) {
        console.error("APIからデータ取得中にエラーが発生しました:", err);
        setError(
          "トレンドレポートの読み込みに失敗しました。後ほど再試行してください。"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  return (
    <>
      <h1 className="text-4xl md:text-5xl font-bold mb-10 text-center text-white text-shadow">
        {t("research.title")}
      </h1>
      <p className="text-xl mb-8 text-center max-w-4xl">
        {t("research.description")}
      </p>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-48">
          <Loader2 className="h-12 w-12 animate-spin text-sky-400" />
          <p className="mt-4 text-lg">レポートを読み込み中...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100/70 dark:bg-red-900/50 text-red-800 dark:text-red-200 p-4 rounded-lg">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            再読み込み
          </button>
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-xl">現在公開されているレポートはありません。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </>
  );
};

export default ResearchPageClient;
