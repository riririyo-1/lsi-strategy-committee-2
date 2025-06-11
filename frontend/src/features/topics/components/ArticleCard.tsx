import React from "react";
import type { Article } from "@/types/article";
import { Card } from "@/components/common/Card";

interface ArticleCardProps {
  article: Article;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  return (
    <Card
      variant="report"
      title={article.title}
      summary={article.summary}
      metadata={[
        { label: "", value: `${article.source} | ${article.publishedAt}` }
      ]}
      labels={article.labels || []}
      className="shadow"
    />
  );
};
