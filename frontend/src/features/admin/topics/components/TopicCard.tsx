"use client";

import Link from "next/link";
import { Topic } from "@/types/topic";
import { useI18n } from "@/features/i18n/hooks/useI18n";

interface TopicCardProps {
  topic: Topic;
  onDelete?: (id: string) => void;
}

export const TopicCard: React.FC<TopicCardProps> = ({ topic, onDelete }) => {
  const { t } = useI18n();

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(topic.id);
    }
  };

  return (
    <div className="bg-card dark:bg-carddark rounded-xl shadow p-6 flex flex-col">
      <div className="text-lg font-semibold text-primary dark:text-primarydark mb-2 truncate">
        {topic.title}
      </div>
      <div className="text-sm text-foreground dark:text-foregrounddark mb-2 line-clamp-2">
        {topic.summary}
      </div>
      <div className="text-xs text-muted dark:text-muteddark mb-1">
        {t("admin.topics.publishDate", { date: topic.publishDate }) ||
          `公開日: ${topic.publishDate}`}
      </div>
      <div className="text-xs text-muted dark:text-muteddark mb-2">
        {t("admin.topics.articleCount", {
          count: String(topic.articleCount),
        }) || `記事数: ${topic.articleCount}件`}
      </div>
      {topic.categories && (
        <div className="flex flex-wrap gap-2 mb-3">
          {topic.categories.map((category) => (
            <span
              key={category.id}
              className="bg-blue-700 dark:bg-blue-600 text-xs text-white px-2 py-0.5 rounded"
            >
              {category.name}({category.articles.length})
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2 mt-auto">
        <Link
          href={`/admin/topics/${topic.id}`}
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded transition text-sm"
        >
          {t("admin.topics.edit") || "編集"}
        </Link>
        <Link
          href={`/admin/topics/${topic.id}/collect`}
          className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white px-4 py-2 rounded transition text-sm"
        >
          {t("admin.topics.collectArticles") || "記事収集"}
        </Link>
        {onDelete && (
          <button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white px-4 py-2 rounded transition text-sm"
          >
            {t("admin.topics.delete") || "削除"}
          </button>
        )}
      </div>
    </div>
  );
};
