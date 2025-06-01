"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/features/i18n/hooks/useI18n";
import SearchBar from "./SearchBar";
import ViewToggle from "./ViewToggle";
import ArticleTable from "./ArticleTable";
import ArticleCardGrid from "./ArticleCardGrid";
import { Article } from "@/types/article";

type ArticlesFeatureProps = {
  initialArticles: Article[];
};

export default function ArticlesFeature({
  initialArticles,
}: ArticlesFeatureProps) {
  const { t } = useI18n();
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "card">("card"); // カードビューをデフォルトに
  const [searchQuery, setSearchQuery] = useState("");

  // 検索とフィルタリング
  const filteredArticles = articles.filter((article) => {
    // 検索クエリのフィルタリング
    const matchesSearch =
      !searchQuery ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.labels.some((label) =>
        label.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      article.source.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // 検索ハンドラ
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // 表示モード切替ハンドラ
  const handleViewModeChange = (mode: "table" | "card") => {
    // View Transitions APIがサポートされている場合は、アニメーションで切り替え
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        setViewMode(mode);
      });
    } else {
      setViewMode(mode);
    }
  };

  // デバッグ用コンソールログは本番環境では無効化

  return (
    <div
      className="min-h-screen bg-gray-100 dark:bg-[#181e29] py-20 md:py-40 px-4"
      suppressHydrationWarning
    >
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center text-gray-800 dark:text-white">
          {t("articles.title")}
        </h1>
        <p className="text-xl text-center text-gray-600 dark:text-gray-300 mb-4">
          {t("articles.description")}
        </p>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-10">
          {filteredArticles.length}{" "}
          {t(
            filteredArticles.length === 1
              ? "articles.article"
              : "articles.articles"
          )}
        </p>

        <div className="bg-white dark:bg-[#232b39] rounded-2xl shadow p-6 mb-10">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-6">
            <SearchBar onSearch={handleSearch} />
            <ViewToggle viewMode={viewMode} onChange={handleViewModeChange} />
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                読み込み中...
              </p>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 dark:bg-red-500/20 border border-red-500 text-red-800 dark:text-white px-4 py-3 rounded">
              {error}
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-20 text-gray-500 dark:text-gray-400">
              {t("articles.noResults")}
            </div>
          ) : viewMode === "table" ? (
            <ArticleTable articles={filteredArticles} />
          ) : (
            <ArticleCardGrid articles={filteredArticles} />
          )}
        </div>
      </div>
    </div>
  );
}
