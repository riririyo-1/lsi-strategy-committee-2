import ResearchAdminClient from "@/features/admin/research/components/ResearchAdminClient";
import PageWithBackground from "@/components/layouts/PageWithBackground";

// 調査レポートの管理画面

export default function ResearchAdminPage() {
  return (
    <PageWithBackground>
      <ResearchAdminClient />
    </PageWithBackground>
  );
}