"use client";

import type { Topic, TopicCategory } from "@/types/topic.d";
import { useI18n } from "@/features/i18n/hooks/useI18n";
import { Card, CardMetadata, CardAction } from "@/components/ui/Card";
import { useViewTransition } from "@/hooks/useViewTransition";

interface TopicCardProps {
  topic: Topic;
  variant?: "default" | "admin";
  onDelete?: (id: string) => void;
  className?: string;
}

export function TopicCard({ 
  topic, 
  variant = "default", 
  onDelete,
  className 
}: TopicCardProps) {
  const { t } = useI18n();
  const { navigate } = useViewTransition();
  
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

  // View Transitionを使用した詳細ページへの遷移
  const handleViewDetails = async () => {
    console.log(`[TopicCard] Detail button clicked for topic: ${topic.id}`);
    try {
      await navigate(`/topics/${topic.id}`, {
        onBeforeTransition: () => {
          console.log(`[TopicCard] Before transition to topic ${topic.id}`);
        },
        onAfterTransition: () => {
          console.log(`[TopicCard] After transition to topic ${topic.id}`);
        },
        onError: (error) => {
          console.error("[TopicCard] View transition failed:", error);
        }
      });
    } catch (error) {
      console.error("[TopicCard] Navigation failed:", error);
    }
  };

  const actions: CardAction[] = variant === "admin" 
    ? [
        {
          label: t("admin.topics.edit", { defaultValue: "編集" }),
          href: `/admin/topics/edit/${topic.id}`,
          variant: "primary"
        },
        ...(onDelete ? [{
          label: t("admin.topics.delete", { defaultValue: "削除" }),
          onClick: () => onDelete(topic.id),
          variant: "danger" as const
        }] : [])
      ]
    : [
        {
          label: t("common.details"),
          onClick: handleViewDetails,
          variant: "primary"
        }
      ];

  return (
    <Card
      title={topic.title}
      summary={topic.summary}
      metadata={metadata}
      actions={actions}
      variant={variant}
      colorTheme="topics"
      className={`topic-card ${className}`}
    />
  );
}