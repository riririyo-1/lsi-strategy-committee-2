"use client";

import { Topic } from "@/types/topic";
import { useI18n } from "@/features/i18n/hooks/useI18n";
import { Card, CardMetadata, CardAction } from "@/components/common/Card";

interface TopicCardProps {
  topic: Topic;
  onDelete?: (id: string) => void;
  variant?: "default" | "admin";
}

export const TopicCard: React.FC<TopicCardProps> = ({ topic, onDelete, variant = "default" }) => {
  const { t } = useI18n();

  const categorySummary = topic.categories
    ? topic.categories
        .slice(0, 3)
        .map(
          (cat) =>
            `${cat.name}(${cat.articles.length}${t("topics.articleUnit", {
              defaultValue: "件",
            })})`
        )
        .join(t("common.delimiter", { defaultValue: "、" }))
    : "";

  const metadata: CardMetadata[] = [
    ...(categorySummary ? [{
      label: t("topics.categoryLabel", { defaultValue: "カテゴリ" }),
      value: categorySummary
    }] : []),
    {
      label: "",
      value: t("topics.publishDate", { date: topic.publishDate })
    },
    {
      label: "",
      value: t("topics.articleCount", { count: String(topic.articleCount) })
    }
  ];

  const actions: CardAction[] = [
    {
      label: t("admin.topics.edit") || "編集",
      href: `/admin/topics/edit/${topic.id}`,
      variant: "primary"
    },
    ...(onDelete ? [{
      label: t("admin.topics.delete") || "削除",
      onClick: () => onDelete(topic.id),
      variant: "danger" as const
    }] : [])
  ];

  return (
    <Card
      title={topic.title}
      summary={topic.summary}
      metadata={metadata}
      actions={actions}
      variant={variant}
      colorTheme="topics"
      className="report-card"
    />
  );
};
