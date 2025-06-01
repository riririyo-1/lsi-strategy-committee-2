import { notFound } from "next/navigation";
import { TopicDetail } from "@/features/topics/components/TopicDetail";
import { getDummyTopicById } from "@/features/topics/use-cases/GetTopicByIdUseCase";
import { getDummyArticlesByTopicAndCategory } from "@/features/topics/use-cases/GetArticlesByTopicUseCase";

interface TopicsDetailPageProps {
  params: { id: string };
}

export default async function TopicsDetailPage({
  params,
}: TopicsDetailPageProps) {
  // ダミーデータ取得
  const topic = await getDummyTopicById(params.id);
  if (!topic) return notFound();

  // カテゴリごとに記事リストを取得
  const categoriesWithArticles = await Promise.all(
    topic.categories.map(
      async (cat: import("@/types/topic.d").TopicCategory) => ({
        ...cat,
        articles: await getDummyArticlesByTopicAndCategory(topic.id, cat.id),
      })
    )
  );

  return (
    <TopicDetail topic={{ ...topic, categories: categoriesWithArticles }} />
  );
}
