import { useState, useCallback, useMemo } from "react";
import { Article } from "@/types/article";
import { ArticleSearchFiltersType } from "@/components/common";
import { GetArticlesWithPaginationUseCase } from "@/features/articles/use-cases/GetArticlesWithPaginationUseCase";

interface UseArticleFilteringOptions {
  articlesPerPage?: number;
  initialFilters?: ArticleSearchFiltersType;
  onError?: (error: string) => void;
}

interface UseArticleFilteringReturn {
  // State
  articles: Article[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  appliedFilters: ArticleSearchFiltersType;
  
  // Actions
  fetchArticles: (page?: number, filters?: ArticleSearchFiltersType) => Promise<void>;
  handleFiltersSearch: (filters: ArticleSearchFiltersType) => void;
  handleFiltersClear: () => void;
  handlePageChange: (page: number) => void;
  setError: (error: string | null) => void;
}

const defaultFilters: ArticleSearchFiltersType = {
  startDate: "",
  endDate: "",
  labelTags: [],
  searchQuery: "",
  sourceFilter: ""
};

/**
 * 記事フィルタリング機能を提供する共通カスタムフック
 * クリーンアーキテクチャに従い、ビジネスロジックをViewから分離
 */
export function useArticleFiltering(
  options: UseArticleFilteringOptions = {}
): UseArticleFilteringReturn {
  const {
    articlesPerPage = 50,
    initialFilters = defaultFilters,
    onError
  } = options;

  // 記事のステート
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // ページネーションのステート
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  
  // フィルターのステート
  const [appliedFilters, setAppliedFilters] = useState<ArticleSearchFiltersType>(initialFilters);
  
  // UseCaseのインスタンス（メモ化してインスタンスの再作成を防ぐ）
  const articlesUseCase = useMemo(() => new GetArticlesWithPaginationUseCase(), []);

  /**
   * 記事を取得する核となる関数
   * サーバーサイドフィルタリングを実装
   */
  const fetchArticles = useCallback(async (
    page: number = 1,
    filters?: ArticleSearchFiltersType
  ) => {
    try {
      setLoading(true);
      setError(null);

      // フィルターが指定されていない場合は現在のフィルターを使用
      const currentFilters = filters || appliedFilters;

      // APIリクエスト（サーバーサイドフィルタリング）
      const result = await articlesUseCase.execute({
        page,
        limit: articlesPerPage,
        filters: {
          startDate: currentFilters.startDate || undefined,
          endDate: currentFilters.endDate || undefined,
          labelTags: currentFilters.labelTags.length > 0 ? currentFilters.labelTags : undefined,
          searchQuery: currentFilters.searchQuery || undefined,
          sourceFilter: currentFilters.sourceFilter || undefined,
        },
      });

      // 日付フォーマットの正規化（共通処理）
      const formattedArticles = result.articles.map((article: any) => ({
        ...article,
        publishedAt: article.publishedAt || article.createdAt,
        labels: article.labels || [],
        summary: article.summary || "",
        thumbnailUrl: article.thumbnailUrl || null,
      }));

      // ステート更新
      setArticles(formattedArticles);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
      setCurrentPage(result.currentPage);
      setHasNextPage(result.hasNextPage);
      setHasPreviousPage(result.hasPreviousPage);
    } catch (err) {
      console.error("Failed to fetch articles:", err);
      const errorMessage = "記事の読み込みに失敗しました";
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [articlesUseCase, articlesPerPage, onError]);

  /**
   * フィルター検索ハンドラ
   * フィルターを適用して1ページ目から検索
   */
  const handleFiltersSearch = useCallback((filters: ArticleSearchFiltersType) => {
    setAppliedFilters(filters);
    fetchArticles(1, filters);
  }, [fetchArticles]);

  /**
   * フィルタークリアハンドラ
   * フィルターをリセットして1ページ目から検索
   */
  const handleFiltersClear = useCallback(() => {
    setAppliedFilters(defaultFilters);
    fetchArticles(1, defaultFilters);
  }, [fetchArticles]);

  /**
   * ページ変更ハンドラ
   * 現在のフィルターを維持したままページを変更
   */
  const handlePageChange = useCallback((page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      fetchArticles(page);
      // ページトップにスクロール（オプション）
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage, totalPages, fetchArticles]);

  return {
    // State
    articles,
    loading,
    error,
    totalCount,
    currentPage,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    appliedFilters,
    
    // Actions
    fetchArticles,
    handleFiltersSearch,
    handleFiltersClear,
    handlePageChange,
    setError,
  };
}