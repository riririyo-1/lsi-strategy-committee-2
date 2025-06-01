import React from "react";
import type { TopicCategory } from "@/types/topic.d";
import { ArticlesList } from "./ArticlesList";

interface CategorySectionProps {
  category: TopicCategory;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  category,
}) => {
  return (
    <section className="mb-8">
      <h3 className="text-xl font-bold text-blue-300 mb-2">{category.name}</h3>
      <ArticlesList articles={category.articles} />
      <hr className="my-4 border-gray-700" />
    </section>
  );
};
