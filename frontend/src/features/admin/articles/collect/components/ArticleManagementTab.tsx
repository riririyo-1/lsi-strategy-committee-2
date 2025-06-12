"use client";

import { useState, useEffect, useCallback } from "react";
import { useI18n } from "@/features/i18n/hooks/useI18n";
import { Article } from "@/types/article";
import { ViewToggle } from "@/components/common";
import ArticleTable from "@/features/articles/components/ArticleTable";
import ArticleCardGrid from "@/features/articles/components/ArticleCardGrid";
import Pagination from "@/components/common/Pagination";
import { Button } from "@/components/common/Button";
import ArticleSearchFilters from "@/components/common/ArticleSearchFilters";
import type { ArticleSearchFilters as ArticleSearchFiltersType } from "@/components/common/ArticleSearchFilters";
import { GetArticlesWithPaginationUseCase } from "@/features/articles/use-cases/GetArticlesWithPaginationUseCase";
import { articlesApi, summarizeApi } from "@/lib/apiClient";

const articlesUseCase = new GetArticlesWithPaginationUseCase();

export default function ArticleManagementTab() {
  const { t } = useI18n();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "card">("card");
  
  // フィルター状態
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

  // 選択機能
  const [selectedArticles, setSelectedArticles] = useState<Set<string>>(
    new Set()
  );
  const [isAllSelected, setIsAllSelected] = useState(false);

  // 操作状態
  const [isDeleting, setIsDeleting] = useState(false);
  const [isProcessingLabels, setIsProcessingLabels] = useState(false);
  const [isProcessingSummary, setIsProcessingSummary] = useState(false);

  const ARTICLES_PER_PAGE = 50;

  // 記事取得関数
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

      // 選択状態をリセット
      setSelectedArticles(new Set());
      setIsAllSelected(false);
    } catch (err) {
      console.error("Failed to fetch articles:", err);
      setError("記事の読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  // 初回読み込み
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
    if (currentPage !== 1) {
      fetchArticles(1);
    }
  };

  // ページ変更ハンドラ
  const handlePageChange = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      fetchArticles(page);
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

  // 個別選択ハンドラ
  const handleSelectArticle = (articleId: string) => {
    const newSelected = new Set(selectedArticles);
    if (newSelected.has(articleId)) {
      newSelected.delete(articleId);
    } else {
      newSelected.add(articleId);
    }
    setSelectedArticles(newSelected);
    setIsAllSelected(newSelected.size === filteredArticles.length);
  };

  // 全選択ハンドラ
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedArticles(new Set());
      setIsAllSelected(false);
    } else {
      const allIds = new Set(filteredArticles.map((article) => article.id));
      setSelectedArticles(allIds);
      setIsAllSelected(true);
    }
  };

  // 一括削除ハンドラ
  const handleBulkDelete = async () => {
    if (selectedArticles.size === 0) return;

    const confirmed = confirm(
      `選択した${selectedArticles.size}件の記事を削除しますか？この操作は取り消せません。`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      console.log("🗑️ 削除開始:", Array.from(selectedArticles));
      const response = await articlesApi.delete(Array.from(selectedArticles));
      console.log("✅ 削除API完了:", response);

      alert(`${selectedArticles.size}件の記事を削除しました`);

      // 記事リストを再読み込み
      console.log("🔄 記事リスト再読み込み開始");
      await fetchArticles(currentPage);
      console.log("✅ 記事リスト再読み込み完了");
    } catch (error) {
      console.error("❌ 削除エラー:", error);
      alert("記事の削除に失敗しました");
    } finally {
      setIsDeleting(false);
    }
  };

  // ラベル付与ハンドラ
  const handleLabelProcessing = async () => {
    if (selectedArticles.size === 0) return;

    // ラベルがない記事のみをフィルタリング
    const articlesToProcess = filteredArticles.filter(
      (article) =>
        selectedArticles.has(article.id) &&
        (!article.labels || article.labels.length === 0)
    );

    if (articlesToProcess.length === 0) {
      alert("選択した記事はすべてラベルが設定されています");
      return;
    }

    const confirmed = confirm(
      `選択した記事のうち${articlesToProcess.length}件にラベル付与を実行しますか？`
    );
    if (!confirmed) return;

    setIsProcessingLabels(true);
    try {
      // Pipeline APIを使ってLLMでラベル付与を実行
      const articleIds = articlesToProcess.map((article) => article.id);

      console.log("ラベル付与開始:", articleIds);

      const response = await summarizeApi.summarize({
        article_ids: articleIds,
        include_labeling: true,
        model_name: "gpt-4o-mini", // OpenAIのモデルに変更
      });

      console.log("ラベル付与レスポンス:", response.data);

      alert(`${articlesToProcess.length}件の記事にラベルを付与しました`);

      // 記事リストを再読み込み
      await fetchArticles(currentPage);
    } catch (error: any) {
      console.error("ラベル付与エラー:", error);

      let errorMessage = "ラベル付与に失敗しました";
      if (error.response?.status === 503) {
        errorMessage =
          "ラベル付与サービスが利用できません。しばらく後にお試しください。";
      } else if (error.response?.status === 400) {
        errorMessage =
          "ラベル付与の条件に問題があります。記事を確認してください。";
      } else if (error.response?.data?.detail) {
        errorMessage += ` (${error.response.data.detail})`;
      }

      alert(errorMessage);
    } finally {
      setIsProcessingLabels(false);
    }
  };

  // 要約作成ハンドラ
  const handleSummaryProcessing = async () => {
    if (selectedArticles.size === 0) return;

    // 要約がない記事のみをフィルタリング
    const articlesToProcess = filteredArticles.filter(
      (article) =>
        selectedArticles.has(article.id) &&
        (!article.summary || article.summary.trim() === "")
    );

    if (articlesToProcess.length === 0) {
      alert("選択した記事はすべて要約が設定されています");
      return;
    }

    const confirmed = confirm(
      `選択した記事のうち${articlesToProcess.length}件に要約作成を実行しますか？`
    );
    if (!confirmed) return;

    setIsProcessingSummary(true);
    try {
      // Pipeline APIを使ってLLMで要約作成を実行
      const articleIds = articlesToProcess.map((article) => article.id);

      console.log("要約作成開始:", articleIds);

      const response = await summarizeApi.summarize({
        article_ids: articleIds,
        include_labeling: false,
        model_name: "gpt-4o-mini", // OpenAIのモデルに変更
      });

      console.log("要約作成レスポンス:", response.data);

      alert(`${articlesToProcess.length}件の記事に要約を作成しました`);

      // 記事リストを再読み込み
      await fetchArticles(currentPage);
    } catch (error: any) {
      console.error("要約作成エラー:", error);

      let errorMessage = "要約作成に失敗しました";
      if (error.response?.status === 503) {
        errorMessage =
          "要約作成サービスが利用できません。しばらく後にお試しください。";
      } else if (error.response?.status === 400) {
        errorMessage =
          "要約作成の条件に問題があります。記事を確認してください。";
      } else if (error.response?.data?.detail) {
        errorMessage += ` (${error.response.data.detail})`;
      }

      alert(errorMessage);
    } finally {
      setIsProcessingSummary(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 操作パネル */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div className="w-full lg:w-auto">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 text-center lg:text-left">
            記事管理
          </h2>
        </div>

        {/* 選択情報と一括操作 */}
        {selectedArticles.size > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {selectedArticles.size}件選択中
            </span>
            <Button
              onClick={handleLabelProcessing}
              disabled={isProcessingLabels}
              variant="primary"
              size="sm"
              isLoading={isProcessingLabels}
              className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700"
            >
              ラベル付与
            </Button>
            <Button
              onClick={handleSummaryProcessing}
              disabled={isProcessingSummary}
              variant="primary"
              size="sm"
              isLoading={isProcessingSummary}
              className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
            >
              要約作成
            </Button>
            <Button
              onClick={handleBulkDelete}
              disabled={isDeleting}
              variant="danger"
              size="sm"
              isLoading={isDeleting}
            >
              一括削除
            </Button>
          </div>
        )}
      </div>

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
            フィルター結果: {filteredArticles.length} 件
          </p>
        )}
      </div>

      {/* ページネーション（中央揃え）とビュー切替・全選択（右端） */}
      <div className="flex justify-between items-center mb-6">
        <div></div> {/* 左側の空きスペース */}
        <div className="flex justify-center flex-1">
          {/* ページネーションは記事表示の上下に配置するため、ここでは表示しない */}
        </div>
        <div className="flex items-center gap-4">
          <ViewToggle viewMode={viewMode} onChange={handleViewModeChange} />

          {/* 全選択チェックボックス */}
          <label className="flex items-center text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={handleSelectAll}
              className="mr-2 rounded"
            />
            全選択
          </label>
        </div>
      </div>

      {/* 記事一覧 */}
      <div>
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 dark:border-blue-400"></div>
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
            記事が見つかりません
          </div>
        ) : (
          <>
            {viewMode === "table" ? (
              <ArticleTable
                articles={filteredArticles}
                showCheckbox={true}
                checkedArticles={selectedArticles}
                onCheckArticle={handleSelectArticle}
              />
            ) : (
              <ArticleCardGrid
                articles={filteredArticles}
                showCheckboxes={true}
                selectedArticles={selectedArticles}
                onSelectArticle={handleSelectArticle}
              />
            )}

            {/* ページネーション */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              hasNextPage={hasNextPage}
              hasPreviousPage={hasPreviousPage}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  );
}
