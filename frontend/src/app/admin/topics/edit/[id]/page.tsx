import TopicsEditorClient from "@/features/admin/topics/components/TopicsEditorClient";
import PageWithBackground from "@/components/layouts/PageWithBackground";

// トピック編集

interface TopicsEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TopicsEditPage({ params }: TopicsEditPageProps) {
  const resolvedParams = await params;
  const topicId = resolvedParams.id;

  return (
    <PageWithBackground>
      <TopicsEditorClient mode="edit" topicId={topicId} />
    </PageWithBackground>
  );
}