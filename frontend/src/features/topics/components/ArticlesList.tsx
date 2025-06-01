import React from "react";
import type { Article } from "@/types/article";
import { ArticleCard } from "./ArticleCard";

interface ArticlesListProps {
  articles: Article[];
}

export const ArticlesList: React.FC<ArticlesListProps> = ({ articles }) => {
  if (!articles || articles.length === 0) {
    return <p className="text-gray-500 mb-4">記事がありません。</p>;
  }
  return (
    <div className="flex flex-col gap-4">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
};
