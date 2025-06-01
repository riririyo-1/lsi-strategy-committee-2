"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageWithBackground from "@/components/common/PageWithBackground";
import ResearchReportForm from "@/features/admin/components/ResearchReportForm";
import { ResearchReportService } from "@/features/admin/services/ResearchReportService";
import { TrendReport } from "@/types/trendReport";
import { useI18n } from "@/features/i18n/hooks/useI18n";

interface ResearchReportEditPageProps {
  params: {
    id?: string;
  };
}

export default function ResearchReportEditPage({
  params,
}: ResearchReportEditPageProps) {
  const router = useRouter();
  const [report, setReport] = useState<TrendReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!params.id;

  const { t } = useI18n();

  useEffect(() => {
    async function loadReport() {
      if (isEditing) {
        try {
          console.log("編集ページ読み込み - レポートID:", params.id);
          const loadedReport = await ResearchReportService.getReportById(
            params.id!
          );
          console.log("取得したレポートデータ:", loadedReport);
          if (!loadedReport) {
            setError(t("admin.research.notFound"));
            return;
          }
          setReport(loadedReport);
        } catch (err) {
          setError(t("admin.research.loadError"));
          console.error("レポート読み込みエラー:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }

    loadReport();
  }, [isEditing, params.id]);

  const handleSave = async (reportData: TrendReport) => {
    try {
      if (isEditing && params.id) {
        console.log("更新するレポートID:", params.id);
        console.log("更新データ:", reportData);
        // idプロパティを除外して新しいオブジェクトを作成
        const { id, ...updateData } = reportData;
        await ResearchReportService.updateReport(params.id, updateData);
      } else {
        await ResearchReportService.createReport(reportData);
      }
      // 保存成功したら一覧ページへ戻る
      router.push("/admin/research");
    } catch (err) {
      console.error("保存中にエラーが発生しました:", err);
      throw new Error(t("admin.research.saveError"));
    }
  };

  const handleCancel = () => {
    // 一覧ページへ戻る
    router.push("/admin/research");
  };

  return (
    <PageWithBackground>
      <div className="w-full max-w-5xl mx-auto">
        {loading ? (
          <div className="bg-[#232b39] rounded-2xl shadow p-8 text-center text-gray-300">
            <p>{t("common.processing")}</p>
          </div>
        ) : error ? (
          <div className="bg-[#232b39] rounded-2xl shadow p-8">
            <div className="bg-red-500/20 border border-red-500 text-white px-4 py-3 rounded mb-6">
              {error}
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => router.push("/admin/research")}
                className="bg-gray-500 hover:bg-gray-400 text-white px-6 py-2 rounded transition"
              >
                {t("common.back")}
              </button>
            </div>
          </div>
        ) : (
          <ResearchReportForm
            report={report || undefined}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}
      </div>
    </PageWithBackground>
  );
}
