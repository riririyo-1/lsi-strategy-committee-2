import React from "react";
import type { Article } from "@/types/article";

interface ArticleCardProps {
  article: Article;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  return (
    <div className="bg-sky-50/60 dark:bg-gray-800/80 rounded-lg p-4 shadow flex flex-col gap-2 text-gray-900 dark:text-gray-100">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h4 className="text-lg font-bold text-blue-700 dark:text-blue-300">
          {article.title}
        </h4>
        <span className="text-xs text-gray-400 ml-2">
          {article.source} | {article.publishedAt}
        </span>
      </div>
      <p className="text-gray-700 dark:text-gray-300 text-sm">
        {article.summary}
      </p>
      <div className="flex flex-wrap gap-2 mt-1">
        {article.labels?.map((label) => (
          <span
            key={label}
            className="bg-blue-700 text-xs text-white px-2 py-0.5 rounded"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};
