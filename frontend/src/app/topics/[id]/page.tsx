import { notFound } from "next/navigation";
import { TopicDetail } from "@/features/topics/components/TopicDetail";
import { topicsApi } from "@/lib/apiClient";

interface TopicsDetailPageProps {
  params: Promise<{ id: string }>;
}

// サーバーサイドでTOPICデータを取得
async function getTopicById(id: string) {
  try {
    const response = await topicsApi.getById(id);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch topic:", error);
    return null;
  }
}

export default async function TopicsDetailPage({
  params,
}: TopicsDetailPageProps) {
  const resolvedParams = await params;
  // 実際のAPIからデータ取得
  const apiTopic = await getTopicById(resolvedParams.id);
  if (!apiTopic) return notFound();

  // API レスポンスを Topic 形式に変換
  const topic = {
    id: apiTopic.id,
    title: apiTopic.title,
    publishDate: apiTopic.publishDate ? new Date(apiTopic.publishDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    summary: apiTopic.summary || "",
    articleCount: apiTopic.articles ? apiTopic.articles.length : 0,
    categories: apiTopic.articles ? [{
      id: "all-articles",
      name: "記事一覧",
      displayOrder: 1,
      articles: apiTopic.articles.map((article: any) => ({
        id: article.id,
        title: article.title,
        source: article.source,
        publishedAt: article.publishedAt,
        summary: article.summary || "",
        labels: article.labels || [],
        thumbnailUrl: article.thumbnailUrl,
        articleUrl: article.articleUrl,
      })),
    }] : [],
    createdAt: apiTopic.createdAt,
    updatedAt: apiTopic.updatedAt,
  };

  return (
    <TopicDetail topic={topic} />
  );
}
