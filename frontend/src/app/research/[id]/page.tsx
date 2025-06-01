import { ResearchReportDetailClient } from "@/features/research/components/ResearchReportDetailClient";
import { getResearchReportById } from "@/features/research/usecases/getResearchReportById";
import { notFound } from "next/navigation";
import PageWithBackground from "@/components/common/PageWithBackground";

interface ResearchDetailPageProps {
  params: { id: string } | Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
