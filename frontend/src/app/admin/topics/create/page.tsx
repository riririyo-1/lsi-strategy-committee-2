import TopicsEditorClient from "@/features/admin/topics/components/TopicsEditorClient";
import PageWithBackground from "@/components/layouts/PageWithBackground";

// トピック作成

export default function TopicsCreatePage() {
  return (
    <PageWithBackground>
      <TopicsEditorClient mode="create" />
    </PageWithBackground>
  );
}