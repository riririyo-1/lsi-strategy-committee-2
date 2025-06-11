import type { Topic, TopicCategory } from "@/types/topic.d";
import { useI18n } from "@/features/i18n/hooks/useI18n";
import { Card, CardMetadata, CardAction } from "@/components/common/Card";

interface TopicCardProps {
  topic: Topic;
}

export function TopicCard({ topic }: TopicCardProps) {
  const { t } = useI18n();
  
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

  const actions: CardAction[] = [
    {
      label: t("common.details"),
      href: `/topics/${topic.id}`,
      variant: "primary"
    }
  ];

  return (
    <Card
      title={topic.title}
      summary={topic.summary}
      metadata={metadata}
      actions={actions}
      variant="default"
      colorTheme="topics"
      className="report-card"
    />
  );
}
