"use client";

import { useState, useEffect, lazy, Suspense } from "react";
import { useI18n } from "@/features/i18n/hooks/useI18n";
import { Article } from "@/types/article.d";
import { ViewToggle } from "@/components/ui";
// ArticleTableを動的インポートして初期バンドルサイズを削減
const ArticleTable = lazy(() => import("@/features/articles/components/ArticleTable"));
import ArticleCardGrid from "@/features/articles/components/ArticleCardGrid";
import Pagination from "@/components/ui/Pagination";
import { ArticleSearchFilters as ArticleSearchFiltersComponent } from "@/components/common";
import { useArticleFiltering } from "@/hooks/useArticleFiltering";

interface ArticleSelectionTabProps {
  selectedArticles: Article[];
  onSelectedArticlesChange: (articles: Article[]) => Promise<void>;
}

export default function ArticleSelectionTab({
  selectedArticles,
  onSelectedArticlesChange,
}: ArticleSelectionTabProps) {
  const { t } = useI18n();
  const [viewMode, setViewMode] = useState<"table" | "card">("card");
  const [isTableLoaded, setIsTableLoaded] = useState(false);
  
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

  // 初回読み込み（fetchArticlesの依存関係を削除して無限ループを防止）
  useEffect(() => {
    fetchArticles(1);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ArticleTableの事前ロード（スムーズな切り替えのため）
  useEffect(() => {
    if (!isTableLoaded) {
      import("@/features/articles/components/ArticleTable").then(() => {
        setIsTableLoaded(true);
      });
    }
  }, [isTableLoaded]);

  // 記事をリストに追加/削除する関数
  const handleToggleArticle = async (article: Article) => {
    const isSelected = selectedArticles.some(selected => selected.id === article.id);
    let updatedArticles: Article[];
    
    if (isSelected) {
      // 削除
      updatedArticles = selectedArticles.filter(selected => selected.id !== article.id);
    } else {
      // 追加
      updatedArticles = [...selectedArticles, article];
    }
    
    // DBに即座に保存
    await onSelectedArticlesChange(updatedArticles);
  };


  // フィルターハンドラーとページネーションは共通フックから提供

  // 表示モード切替ハンドラ
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
    <>
      <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center text-gray-800 dark:text-white">
        {t("articles.title")}
      </h1>
      <p className="text-xl text-center text-gray-600 dark:text-gray-300 mb-4">
        {t("articles.description")}
      </p>
      
      {/* 選択済み記事数 */}
      {selectedArticles.length > 0 && (
        <div className="text-center mb-4">
          <p className="text-blue-600 dark:text-blue-400 font-medium">
            選択済み記事: {selectedArticles.length} 件
          </p>
        </div>
      )}

      {/* 記事検索フィルター */}
      <div className="mb-6">
        <ArticleSearchFiltersComponent
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
          {/* カード表示 */}
          <div 
            className={`transition-all duration-300 ${
              viewMode === "card" ? "opacity-100 block" : "opacity-0 hidden"
            }`}
            style={{ viewTransitionName: "article-card-view" }}
          >
            <ArticleCardGrid 
              articles={articles} 
              selectedArticles={selectedArticles}
              onToggleSelect={handleToggleArticle}
              showSelectButton={true}
            />
          </div>
          
          {/* 表表示 */}
          <div 
            className={`transition-all duration-300 ${
              viewMode === "table" ? "opacity-100 block" : "opacity-0 hidden"
            }`}
            style={{ viewTransitionName: "article-table-view" }}
          >
            <Suspense 
              fallback={
                <div className="text-center py-20">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  <p className="mt-2 text-gray-500 dark:text-gray-400">表形式を読み込み中...</p>
                </div>
              }
            >
              <ArticleTable 
                articles={articles} 
                selectedArticles={selectedArticles}
                onToggleSelect={handleToggleArticle}
                showSelectButton={true}
              />
            </Suspense>
          </div>
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