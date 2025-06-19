import { notFound } from "next/navigation";
import { Metadata } from "next";
import { TopicDetail } from "@/features/topics/components/TopicDetail";
import { topicsApi } from "@/lib/apiClient";
import PageWithBackground from "@/components/layouts/PageWithBackground";

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

export async function generateMetadata({
  params,
}: TopicsDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const topic = await getTopicById(resolvedParams.id);
  
  if (!topic) {
    return {
      title: "トピックが見つかりません",
    };
  }

  return {
    title: `${topic.title} - LSI戦略コミッティ`,
    description: topic.summary || "半導体業界の最新トピックスをお届けします",
  };
}

// トピックス詳細

export default async function TopicsDetailPage({
  params,
}: TopicsDetailPageProps) {
  const resolvedParams = await params;
  // 実際のAPIからデータ取得
  const apiTopic = await getTopicById(resolvedParams.id);
  if (!apiTopic) return notFound();

  // API レスポンスを Topic 形式に変換（カテゴリ別グループ化 + フォールバック）
  const topic = {
    id: apiTopic.id,
    title: apiTopic.title,
    publishDate: apiTopic.publishDate ? new Date(apiTopic.publishDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    summary: apiTopic.summary || "",
    articleCount: apiTopic.articles ? apiTopic.articles.length : 0,
    categories: (() => {
      // categoriesが存在する場合はそれを使用
      if (apiTopic.categories && apiTopic.categories.length > 0) {
        return apiTopic.categories.map((category: any, index: number) => ({
          id: category.mainCategory || `category-${index}`,
          name: category.name,
          displayOrder: index + 1,
          articles: category.articles.map((article: any) => ({
            id: article.id,
            title: article.title,
            source: article.source,
            publishedAt: article.publishedAt,
            summary: article.summary || "",
            labels: article.labels || [],
            thumbnailUrl: article.thumbnailUrl,
            articleUrl: article.articleUrl,
          })),
        }));
      }
      
      // フォールバック: articlesが存在する場合は単一カテゴリとして表示
      if (apiTopic.articles && apiTopic.articles.length > 0) {
        return [{
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
        }];
      }
      
      // 何もない場合は空配列
      return [];
    })(),
    createdAt: apiTopic.createdAt,
    updatedAt: apiTopic.updatedAt,
  };

  return (
    <PageWithBackground>
      <TopicDetail topic={topic} />
    </PageWithBackground>
  );
}
