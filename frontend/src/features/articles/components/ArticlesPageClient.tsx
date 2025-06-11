"use client";

import { useState, useEffect, useCallback } from "react";
import { useI18n } from "@/features/i18n/hooks/useI18n";
import { ViewToggle } from "@/components/common";
import ArticleTable from "./ArticleTable";
import ArticleCardGrid from "./ArticleCardGrid";
import Pagination from "@/components/common/Pagination";
import { ArticleSearchFilters } from "@/components/common";
import type { ArticleSearchFiltersType } from "@/components/common";
import { Article } from "@/types/article";
import { GetArticlesWithPaginationUseCase } from "../use-cases/GetArticlesWithPaginationUseCase";

const articlesUseCase = new GetArticlesWithPaginationUseCase();

export default function ArticlesPageClient() {
  const { t } = useI18n();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "card">("card");
  const [appliedFilters, setAppliedFilters] = useState<ArticleSearchFiltersType>({
    startDate: "",
    endDate: "",
    labelTags: [],
    searchQuery: "",
    sourceFilter: ""
  });

  // ページネーション状態
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  const ARTICLES_PER_PAGE = 50;

  // 記事取得関数をuseCallbackでメモ化
  const fetchArticles = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);

      const result = await articlesUseCase.execute({
        page,
        limit: ARTICLES_PER_PAGE,
      });

      // 日付フォーマットの正規化
      const formattedArticles = result.articles.map((article: any) => ({
        ...article,
        publishedAt: article.publishedAt || article.createdAt,
        labels: article.labels || [],
        summary: article.summary || "",
        thumbnailUrl: article.thumbnailUrl || null,
      }));

      setArticles(formattedArticles);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
      setCurrentPage(result.currentPage);
      setHasNextPage(result.hasNextPage);
      setHasPreviousPage(result.hasPreviousPage);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch articles:", err);
      setError("記事の読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  // 初回読み込み（依存配列は空）
  useEffect(() => {
    fetchArticles(1);
  }, [fetchArticles]);

  // 検索とフィルタリング
  const filteredArticles = articles.filter((article) => {
    // 日付フィルター
    const articleDate = new Date(article.publishedAt);
    const matchesDateRange =
      (!appliedFilters.startDate || articleDate >= new Date(appliedFilters.startDate)) &&
      (!appliedFilters.endDate || articleDate <= new Date(appliedFilters.endDate + "T23:59:59"));

    // ラベルフィルター（複数ラベルのAND検索）
    const matchesLabels = appliedFilters.labelTags.length === 0 || 
      appliedFilters.labelTags.every(tag =>
        article.labels?.some(label => 
          label.toLowerCase().includes(tag.toLowerCase())
        )
      );

    // キーワード検索
    const matchesSearch =
      !appliedFilters.searchQuery ||
      article.title.toLowerCase().includes(appliedFilters.searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(appliedFilters.searchQuery.toLowerCase());

    // ソースフィルター
    const matchesSource = !appliedFilters.sourceFilter ||
      article.source.toLowerCase().includes(appliedFilters.sourceFilter.toLowerCase());

    return matchesDateRange && matchesLabels && matchesSearch && matchesSource;
  });


  // 新しい検索フィルターハンドラ
  const handleFiltersSearch = (filters: ArticleSearchFiltersType) => {
    setAppliedFilters(filters);
    // 検索時は1ページ目に戻る
    if (currentPage !== 1) {
      fetchArticles(1);
    }
  };

  // フィルタークリアハンドラ
  const handleFiltersClear = () => {
    setAppliedFilters({
      startDate: "",
      endDate: "",
      labelTags: [],
      searchQuery: "",
      sourceFilter: ""
    });
    // フィルタークリア時は1ページ目に戻る
    if (currentPage !== 1) {
      fetchArticles(1);
    }
  };

  // ページ変更ハンドラ
  const handlePageChange = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      fetchArticles(page);
      // ページトップにスクロール
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

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
          全 {totalCount} 件中{" "}
          {Math.min((currentPage - 1) * ARTICLES_PER_PAGE + 1, totalCount)} -{" "}
          {Math.min(currentPage * ARTICLES_PER_PAGE, totalCount)} 件を表示
        </p>
        {(appliedFilters.startDate || appliedFilters.endDate || appliedFilters.labelTags.length > 0 || appliedFilters.searchQuery || appliedFilters.sourceFilter) && (
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            検索結果: {filteredArticles.length} 件
          </p>
        )}
      </div>

      {/* ページネーション（中央揃え）とビュー切替（右端） */}
      <div className="flex justify-between items-center mb-6">
        <div></div> {/* 左側の空きスペース */}
        <div className="flex justify-center flex-1">
          {/* 上部のページネーション（検索中は非表示） */}
          {!appliedFilters.startDate && !appliedFilters.endDate && appliedFilters.labelTags.length === 0 && !appliedFilters.searchQuery && !appliedFilters.sourceFilter && !loading && !error && totalPages > 1 && (
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
      ) : filteredArticles.length === 0 ? (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400">
          {t("articles.noResults")}
        </div>
      ) : viewMode === "table" ? (
        <ArticleTable articles={filteredArticles} />
      ) : (
        <ArticleCardGrid articles={filteredArticles} />
      )}

      {/* 下部のページネーション（検索中は非表示） */}
      {!appliedFilters.startDate && !appliedFilters.endDate && appliedFilters.labelTags.length === 0 && !appliedFilters.searchQuery && !appliedFilters.sourceFilter && !loading && !error && totalPages > 1 && (
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
