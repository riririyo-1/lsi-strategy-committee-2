"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/features/i18n/hooks/useI18n";
import { Article } from "@/types/article.d";
import { Button } from "@/components/ui/Button";

interface ArticleSelectorProps {
  availableArticles: Article[];
  selectedArticles: Article[];
  onArticleSelect: (article: Article) => void;
  onArticleRemove: (articleId: string) => void;
  onSearch: (query: string) => void;
  onFilter: (filters: {
    category?: string;
    source?: string;
    startDate?: Date;
    endDate?: Date;
  }) => void;
  isLoading?: boolean;
}

export default function ArticleSelector({
  availableArticles,
  selectedArticles,
  onArticleSelect,
  onArticleRemove,
  onSearch,
  onFilter,
  isLoading = false,
}: ArticleSelectorProps) {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    category: "",
    source: "",
  });

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    onSearch(query);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...selectedFilters, [key]: value };
    setSelectedFilters(newFilters);
    onFilter({
      category: newFilters.category || undefined,
      source: newFilters.source || undefined,
    });
  };

  const isArticleSelected = (articleId: string) => {
    return selectedArticles.some(article => article.id === articleId);
  };

  return (
    <div className="space-y-6">
      {/* 検索・フィルター */}
      <div className="bg-white dark:bg-[#2d3646] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-4">
          {t("admin.topics.searchAndFilter")}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("admin.topics.searchKeyword")}
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="タイトル・内容で検索..."
              className="w-full px-3 py-2 bg-white dark:bg-[#3a4553] text-gray-900 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("admin.topics.category")}
            </label>
            <select
              value={selectedFilters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-[#3a4553] text-gray-900 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors"
            >
              <option value="">すべてのカテゴリ</option>
              <option value="political">政治</option>
              <option value="economical">経済</option>
              <option value="social">社会</option>
              <option value="technological">技術</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("admin.topics.source")}
            </label>
            <select
              value={selectedFilters.source}
              onChange={(e) => handleFilterChange("source", e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-[#3a4553] text-gray-900 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors"
            >
              <option value="">すべてのソース</option>
              <option value="nikkei">日経新聞</option>
              <option value="reuters">Reuters</option>
              <option value="techcrunch">TechCrunch</option>
            </select>
          </div>
        </div>
      </div>

      {/* 選択済み記事 */}
      <div className="bg-white dark:bg-[#2d3646] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-4">
          {t("admin.topics.selectedArticles")} ({selectedArticles.length})
        </h3>
        
        {selectedArticles.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>{t("admin.topics.noSelectedArticles")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedArticles.map(article => (
              <div
                key={article.id}
                className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-gray-200 line-clamp-1">
                    {article.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {article.source} • {new Date(article.publishedAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => onArticleRemove(article.id)}
                  className="ml-3 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium text-sm"
                >
                  削除
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 利用可能な記事 */}
      <div className="bg-white dark:bg-[#2d3646] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-4">
          {t("admin.topics.availableArticles")}
        </h3>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{t("common.loading")}</p>
          </div>
        ) : availableArticles.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>条件に合う記事が見つかりません</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {availableArticles.map(article => (
              <div
                key={article.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  isArticleSelected(article.id)
                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                    : "bg-gray-50 dark:bg-[#3a4553] border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-[#404553]"
                }`}
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-gray-200 line-clamp-2">
                    {article.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {article.source} • {new Date(article.publishedAt).toLocaleDateString()}
                  </p>
                  {article.summary && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                      {article.summary}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => onArticleSelect(article)}
                  disabled={isArticleSelected(article.id)}
                  className={`ml-3 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isArticleSelected(article.id)
                      ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {isArticleSelected(article.id) ? "選択済み" : "追加"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}