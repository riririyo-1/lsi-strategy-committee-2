"use client";

import { TrendReport } from "@/types/trendReport";
import Link from "next/link";
import { useI18n } from "@/features/i18n/hooks/useI18n";

interface ReportCardProps {
  report: TrendReport;
}

const ReportCard: React.FC<ReportCardProps> = ({ report }) => {
  const { t } = useI18n();
  return (
    <div className="report-card w-full p-4 flex flex-col gap-2 bg-sky-50/60 dark:bg-gray-800/80 border border-sky-100 dark:border-gray-700 rounded-lg shadow-lg hover:bg-sky-100/60 dark:hover:bg-gray-700/80 transition-all duration-300 text-gray-900 dark:text-gray-100">
      <h2 className="text-2xl font-bold mb-3 text-blue-700 dark:text-blue-300 text-shadow-sm">
        {report.title}
      </h2>
      <p className="text-gray-700 dark:text-gray-300 mb-4 flex-grow text-sm">
        {report.summary}
      </p>
      <p className="text-xs text-gray-400 mb-4">
        {t("research.publishDate", { date: report.publishDate })}
      </p>
      <Link href={`/research/${report.id}`} legacyBehavior>
        <a className="mt-auto self-start bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 text-sm">
          {t("common.details")}
        </a>
      </Link>
    </div>
  );
};

export default ReportCard;
