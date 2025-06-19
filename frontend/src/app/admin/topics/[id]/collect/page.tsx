import ArticleCollectionForm from "@/features/admin/topics/components/ArticleCollectionForm";
import PageWithBackground from "@/components/layouts/PageWithBackground";

interface TopicArticleCollectPageProps {
  params: Promise<{ id: string }>;
}

// »‘√ØãŒ∆

export default async function TopicArticleCollectPage({ params }: TopicArticleCollectPageProps) {
  const resolvedParams = await params;
  
  return (
    <PageWithBackground>
      <ArticleCollectionForm topicId={resolvedParams.id} />
    </PageWithBackground>
  );
}