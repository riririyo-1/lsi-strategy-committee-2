import React, { useState } from "react";
import type { TopicCategory } from "@/types/topic.d";
import { ArticlesList } from "./ArticlesList";
import { ViewToggle } from "@/components/ui";
import ArticleTable from "@/features/articles/components/ArticleTable";

interface CategorySectionProps {
  category: TopicCategory;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  category,
}) => {
  const [viewMode, setViewMode] = useState<"table" | "card">("card");

  // 記事を日付順にソート（新しい順）
  const sortedArticles = [...category.articles].sort((a, b) => {
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  const handleViewModeChange = (mode: "table" | "card") => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        setViewMode(mode);
      });
    } else {
      setViewMode(mode);
    }
  };

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-blue-300">{category.name}</h3>
        <ViewToggle viewMode={viewMode} onChange={handleViewModeChange} />
      </div>
      
      {viewMode === "table" ? (
        <ArticleTable articles={sortedArticles} />
      ) : (
        <ArticlesList articles={sortedArticles} />
      )}
      
      <hr className="my-4 border-gray-700" />
    </section>
  );
};
