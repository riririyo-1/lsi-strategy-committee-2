import ResearchEditClient from "@/features/admin/research/components/ResearchEditClient";
import PageWithBackground from "@/components/layouts/PageWithBackground";

// 調査レポート編集

interface ResearchReportEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ResearchReportEditPage({
  params,
}: ResearchReportEditPageProps) {
  const resolvedParams = await params;
  const reportId = resolvedParams.id;

  return (
    <PageWithBackground>
      <ResearchEditClient reportId={reportId} />
    </PageWithBackground>
  );
}
