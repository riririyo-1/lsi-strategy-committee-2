import { ResearchReportDetailClient } from "@/features/research/components/ResearchReportDetailClient";
import { getResearchReportById } from "@/features/research/use-cases/getResearchReportById";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import PageWithBackground from "@/components/layouts/PageWithBackground";

interface ResearchDetailPageProps {
  params: { id: string } | Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({
  params,
}: ResearchDetailPageProps): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const report = await getResearchReportById(resolvedParams.id);
    
    if (!report) {
      return {
        title: "研究レポートが見つかりません",
      };
    }

    return {
      title: `${report.title} - LSI戦略コミッティ`,
      description: report.summary || "半導体業界の最新研究レポート",
    };
  } catch (error) {
    return {
      title: "研究レポート - LSI戦略コミッティ",
    };
  }
}

// 研究レポート詳細

export default async function ResearchDetailPage({
  params,
}: ResearchDetailPageProps) {
  try {
    // paramsをawaitして安全に扱う
    const resolvedParams = await params;
    const id = resolvedParams.id;
    if (!id) return notFound();

    const report = await getResearchReportById(id);
    if (!report) return notFound();

    // レポートデータをJSON文字列に変換して渡すことでハイドレーション問題を回避
    return (
      <PageWithBackground>
        <ResearchReportDetailClient initialReport={JSON.stringify(report)} />
      </PageWithBackground>
    );
  } catch (error) {
    console.error("Research report fetching error:", error);
    return notFound();
  }
}
