"use client";

import { TrendReport } from "@/types/trendReport";
import { useI18n } from "@/features/i18n/hooks/useI18n";
import { Card, CardMetadata, CardAction } from "@/components/common/Card";

interface ReportCardProps {
  report: TrendReport;
}

const ReportCard: React.FC<ReportCardProps> = ({ report }) => {
  const { t } = useI18n();

  const metadata: CardMetadata[] = [
    {
      label: "",
      value: t("research.publishDate", { date: report.publishDate })
    }
  ];

  const actions: CardAction[] = [
    {
      label: t("common.details"),
      href: `/research/${report.id}`,
      variant: "primary"
    }
  ];

  return (
    <Card
      title={report.title}
      summary={report.summary}
      metadata={metadata}
      actions={actions}
      variant="report"
      colorTheme="research"
      className="report-card"
    />
  );
};

export default ReportCard;
