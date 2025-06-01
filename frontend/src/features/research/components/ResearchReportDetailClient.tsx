"use client";

import { TrendReport } from "@/types/trendReport";
import { useI18n } from "@/features/i18n/hooks/useI18n";
import { useMemo } from "react";

interface ResearchReportDetailClientProps {
  initialReport: string; // JSONシリアライズされたレポート
}

const ResearchReportDetailClient: React.FC<ResearchReportDetailClientProps> = ({
  initialReport,
}) => {
  // JSONからレポートをパース
  const report = useMemo<TrendReport>(
    () => JSON.parse(initialReport),
    [initialReport]
  );

  const { t } = useI18n();
  return (
    <div className="max-w-5xl mx-auto py-10 px-4 text-foreground mt-24">
      {/* タイトル・戻るボタン */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <h1 className="text-3xl md:text-4xl font-bold text-link dark:text-linkhover text-shadow">
          {report.title}
        </h1>
        <a
          href="/research"
          className="text-sm bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded-md transition-colors self-start md:self-center"
        >
          {t("common.back")}
        </a>
      </div>

      {/* 2カラムレイアウト */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* 左2カラム: 動画 */}
        <div className="md:col-span-2">
          {report.videoUrl && (
            <div className="video-aspect-ratio-container mb-6">
              <video
                className="w-full rounded-lg shadow"
                src={report.videoUrl}
                poster={report.posterUrl}
                controls
                playsInline
              />
            </div>
          )}
        </div>
        {/* 右1カラム: 講演者・部署・PDF資料 */}
        <div className="md:col-span-1 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-sky-300 mb-1">
              {t("research.speakerLabel")}
            </h2>
            <p className="text-gray-200">{report.speaker}</p>
            {report.department && (
              <p className="text-sm text-gray-400">
                {t("research.departmentLabel")}: {report.department}
              </p>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-sky-300 mb-2">
              {t("research.materials")}
            </h2>
            {/* PDFプレビュー風エリア */}
            <div className="w-full h-48 bg-gray-700 rounded-md flex flex-col items-center justify-center text-gray-400 mb-2 text-center p-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-sm">PDFプレビューエリア</p>
              <p className="text-xs mt-1">(実際のサーバー環境で表示可能)</p>
            </div>
            {report.pdfUrl && (
              <a
                href={report.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="modern-pdf-button bg-link hover:bg-linkhover text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 w-full flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5 mr-2"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                {t("common.download")}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 公開日・要約 */}
      <div className="mt-8">
        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
          {t("research.publishDate", {
            date:
              report.publishDate?.substring(0, 10) ||
              t("common.notSet", "未設定"),
          })}
        </p>
        <p className="mb-6 text-lg">{report.summary}</p>
      </div>

      {/* アジェンダ */}
      {Array.isArray(report.agenda) && report.agenda.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-sky-300 mb-3">
            {t("research.agenda")}
          </h2>
          <ul className="list-disc list-inside space-y-1 prose prose-invert text-gray-300">
            {report.agenda.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 本文（将来拡張用） */}
      {report.content && (
        <div className="mt-8 prose prose-neutral dark:prose-invert max-w-none">
          {report.content}
        </div>
      )}
    </div>
  );
};

export { ResearchReportDetailClient };
