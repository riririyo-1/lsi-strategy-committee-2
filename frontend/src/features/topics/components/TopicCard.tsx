import Link from "next/link";
import type { Topic, TopicCategory } from "@/types/topic.d";
import { useI18n } from "@/features/i18n/hooks/useI18n";

interface TopicCardProps {
  topic: Topic;
}

export function TopicCard({ topic }: TopicCardProps) {
  const { t } = useI18n();
  // カテゴリ別記事数の集計（最大3カテゴリ表示）
  const categorySummary = topic.categories
    ? topic.categories
        .slice(0, 3)
        .map(
          (cat: TopicCategory) =>
            `${cat.name}(${cat.articles.length}${t("topics.articleUnit", {
              defaultValue: "件",
            })})`
        )
        .join(t("common.delimiter", { defaultValue: "、" }))
    : "";

  return (
    <div className="report-card w-full p-6 flex flex-col gap-3 bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 text-gray-900 dark:text-gray-100">
      <h2 className="text-2xl font-bold mb-3 text-blue-700 dark:text-blue-300">
        {topic.title}
      </h2>
      <p className="text-gray-700 dark:text-gray-300 mb-4 flex-grow">
        {topic.summary}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
        {t("topics.categoryLabel", { defaultValue: "カテゴリ:" })}{" "}
        {categorySummary}
      </p>
      <p className="text-xs text-gray-500 mb-1">
        {t("topics.publishDate", { date: topic.publishDate })}
      </p>
      <p className="text-xs text-gray-500 mb-4">
        {t("topics.articleCount", { count: String(topic.articleCount) })}
      </p>
      <Link
        href={`/topics/${topic.id}`}
        className="mt-auto self-start bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-300 text-sm"
      >
        {t("common.details")}
      </Link>
    </div>
  );
}
