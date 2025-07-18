"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ResearchReportService } from "@/features/admin/services/ResearchReportService";
import { TrendReport } from "@/types/trendReport";
import { useI18n } from "@/features/i18n/hooks/useI18n";
import SearchBar from "@/components/ui/SearchBar";
import { Card, CardMetadata, CardAction } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageLayout } from "@/components/layouts/PageLayout";
import { LoadingSpinner, ErrorMessage } from "@/components/ui";
import { formatDateToString } from "@/lib/dateUtils";

export default function ResearchAdminClient() {
  const router = useRouter();
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [reports, setReports] = useState<TrendReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReports() {
      try {
        const data = await ResearchReportService.getReports();
        setReports(data);
      } catch (err) {
        setError(t("admin.research.error"));
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirmDelete === id) {
      try {
        await ResearchReportService.deleteReport(id);
        setReports(reports.filter((report) => report.id !== id));
        setConfirmDelete(null);
      } catch (err) {
        console.error("削除に失敗しました:", err);
        alert("削除に失敗しました");
      }
    } else {
      setConfirmDelete(id);
    }
  };

  const handleSearch = (query: string) => {
    setSearch(query);
  };

  const filtered = reports.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  // 共通の日付フォーマット関数を使用

  const actions = (
    <>
      <div className="flex items-center">
        <span className="text-white">
          {t("admin.research.totalReports", { 
            count: String(reports.length),
            defaultValue: `合計: ${reports.length}件のレポート`
          })}
        </span>
      </div>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          onClick={() => router.push("/admin")}
        >
          {t("common.back")}
        </Button>
        <Button
          variant="primary"
          onClick={() => router.push("/admin/research/create")}
        >
          {t("admin.research.create")}
        </Button>
      </div>
    </>
  );

  if (loading) {
    return (
      <PageLayout
        title={t("admin.research.management")}
        description="半導体業界の調査レポートを管理します"
      >
        <LoadingSpinner size="lg" />
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout
        title={t("admin.research.management")}
        description="半導体業界の調査レポートを管理します"
      >
        <ErrorMessage message={error} />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={t("admin.research.management")}
      description="半導体業界の調査レポートを管理します"
      actions={actions}
      showActionBar={true}
    >
      <div className="mb-8">
        <SearchBar 
          onSearch={handleSearch}
          placeholder={t("admin.research.searchPlaceholder")}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((report) => {
          const metadata: CardMetadata[] = [
            {
              label: "",
              value: t("admin.research.speaker", { name: report.speaker || "-" })
            },
            {
              label: "",
              value: t("admin.research.publishDate", { date: formatDateToString(report.publishDate) })
            }
          ];

          const actions: CardAction[] = [
            {
              label: t("admin.research.edit"),
              href: `/admin/research/edit/${report.id}`,
              variant: "primary"
            },
            {
              label: confirmDelete === report.id 
                ? t("admin.research.confirmDelete") 
                : t("admin.research.delete"),
              onClick: () => handleDelete(report.id),
              variant: "danger"
            }
          ];

          return (
            <Card
              key={report.id}
              title={report.title}
              summary={report.summary}
              metadata={metadata}
              actions={actions}
              variant="report"
              className="report-card"
            />
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-white">
          <p>{t("admin.research.noResults")}</p>
        </div>
      )}
    </PageLayout>
  );
}