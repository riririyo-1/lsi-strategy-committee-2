"use client";

import { useState, useEffect, useCallback } from "react";
import { useI18n } from "@/features/i18n/hooks/useI18n";
import { ViewToggle } from "@/components/ui";
import ArticleTable from "./ArticleTable";
import ArticleCardGrid from "./ArticleCardGrid";
import Pagination from "@/components/ui/Pagination";
import { ArticleSearchFilters } from "@/components/common";
import { useArticleFiltering } from "@/hooks/useArticleFiltering";
import { useViewTransition } from "@/hooks/useViewTransition";

export default function ArticlesPageClient() {
  const { t } = useI18n();
  const { withTransition } = useViewTransition();
  const [viewMode, setViewMode] = useState<"table" | "card">("card");
  
  // 共通フックを使用してフィルタリング機能を実装
  const {
    articles,
    loading,
    error,
    totalCount,
    currentPage,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    appliedFilters,
    fetchArticles,
    handleFiltersSearch,
    handleFiltersClear,
    handlePageChange,
  } = useArticleFiltering({
    articlesPerPage: 50,
  });

  const ARTICLES_PER_PAGE = 50;

  // フィルタリングは共通フックで提供

  // 初回読み込み（fetchArticlesの依存関係を削除して無限ループを防止）
  useEffect(() => {
    fetchArticles(1);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // フィルターとページネーションのハンドラーは共通フックで提供

  // 表示モード切替ハンドラ
  const handleViewModeChange = async (mode: "table" | "card") => {
    try {
      await withTransition(() => {
        setViewMode(mode);
      }, {
        onError: (error) => {
          console.error("View mode transition failed:", error);
        }
      });
    } catch (error) {
      console.error("View mode change failed:", error);
      // フォールバックとして直接設定
      setViewMode(mode);
    }
  };

  return (
    <>
      <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center text-gray-800 dark:text-white">
        {t("articles.title")}
      </h1>
      <p className="text-xl text-center text-gray-600 dark:text-gray-300 mb-4">
        {t("articles.description")}
      </p>

      {/* 記事検索フィルター */}
      <div className="mb-6">
        <ArticleSearchFilters
          onSearch={handleFiltersSearch}
          onClear={handleFiltersClear}
          appliedFilters={appliedFilters}
        />
      </div>

      {/* 件数表示（中央揃え） */}
      <div className="text-center mb-4">
        <p className="text-gray-500 dark:text-gray-400">
          {(appliedFilters.startDate || appliedFilters.endDate || appliedFilters.labelTags.length > 0 || appliedFilters.searchQuery || appliedFilters.sourceFilter) ? (
            <>検索結果: 全 {totalCount} 件中 {totalCount > 0 ? Math.min((currentPage - 1) * ARTICLES_PER_PAGE + 1, totalCount) : 0} - {Math.min(currentPage * ARTICLES_PER_PAGE, totalCount)} 件を表示</>
          ) : (
            <>全 {totalCount} 件中 {totalCount > 0 ? Math.min((currentPage - 1) * ARTICLES_PER_PAGE + 1, totalCount) : 0} - {Math.min(currentPage * ARTICLES_PER_PAGE, totalCount)} 件を表示</>
          )}
        </p>
      </div>

      {/* ページネーション（中央揃え）とビュー切替（右端） */}
      <div className="flex justify-between items-center mb-6">
        <div></div> {/* 左側の空きスペース */}
        <div className="flex justify-center flex-1">
          {/* 上部のページネーション */}
          {!loading && !error && totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              hasNextPage={hasNextPage}
              hasPreviousPage={hasPreviousPage}
              onPageChange={handlePageChange}
            />
          )}
        </div>
        <div className="flex justify-end">
          <ViewToggle viewMode={viewMode} onChange={handleViewModeChange} />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-500 dark:text-gray-400">読み込み中...</p>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 dark:bg-red-500/20 border border-red-500 text-red-800 dark:text-white px-4 py-3 rounded">
          {error}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400">
          {t("articles.noResults")}
        </div>
      ) : (
        <div className="view-transition-container">
          {viewMode === "table" ? (
            <ArticleTable articles={articles} />
          ) : (
            <ArticleCardGrid articles={articles} />
          )}
        </div>
      )}

      {/* 下部のページネーション */}
      {!loading && !error && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
          onPageChange={handlePageChange}
        />
      )}
    </>
  );
}
