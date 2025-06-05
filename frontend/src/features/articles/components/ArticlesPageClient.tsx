"use client";

import { useState, useEffect, useCallback } from "react";
import { useI18n } from "@/features/i18n/hooks/useI18n";
import SearchBar from "./SearchBar";
import ViewToggle from "./ViewToggle";
import ArticleTable from "./ArticleTable";
import ArticleCardGrid from "./ArticleCardGrid";
import Pagination from "./Pagination";
import { Article } from "@/types/article";
import { GetArticlesWithPaginationUseCase } from "../use-cases/GetArticlesWithPaginationUseCase";

const articlesUseCase = new GetArticlesWithPaginationUseCase();

export default function ArticlesPageClient() {
  const { t } = useI18n();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "card">("card");
  const [searchQuery, setSearchQuery] = useState("");
  
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
        summary: article.summary || '',
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
    // 検索時は1ページ目に戻る
    if (currentPage !== 1) {
      fetchArticles(1);
    }
  };

  // ページ変更ハンドラ
  const handlePageChange = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      fetchArticles(page);
      // ページトップにスクロール
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
        <p className="text-center text-gray-500 dark:text-gray-400 mb-4">
          全 {totalCount} 件中 {Math.min((currentPage - 1) * ARTICLES_PER_PAGE + 1, totalCount)} - {Math.min(currentPage * ARTICLES_PER_PAGE, totalCount)} 件を表示
        </p>
        {searchQuery && (
          <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
            検索結果: {filteredArticles.length} 件
          </p>
        )}

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
          
          {/* ページネーション（検索中は非表示） */}
          {!searchQuery && !loading && !error && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              hasNextPage={hasNextPage}
              hasPreviousPage={hasPreviousPage}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}
