"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/features/i18n/hooks/useI18n";
import { ViewToggle } from "@/components/ui";
import ArticleTable from "@/features/articles/components/ArticleTable";
import ArticleCardGrid from "@/features/articles/components/ArticleCardGrid";
import Pagination from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import ArticleSearchFilters from "@/components/common/ArticleSearchFilters";
import type { ArticleSearchFiltersType } from "@/components/common";
import { useArticleFiltering } from "@/hooks/useArticleFiltering";
import { articlesApi, summarizeApi } from "@/lib/apiClient";

export default function ArticleManagementTab() {
  const { t } = useI18n();
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
    onError: (error) => console.error("記事取得エラー:", error),
  });

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

  // 初回読み込み（fetchArticlesの依存関係を削除して無限ループを防止）
  useEffect(() => {
    fetchArticles(1);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ページ変更や記事取得時に選択状態をリセット
  useEffect(() => {
    setSelectedArticles(new Set());
    setIsAllSelected(false);
  }, [articles]);

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
    setIsAllSelected(newSelected.size === articles.length);
  };

  // 全選択ハンドラ
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedArticles(new Set());
      setIsAllSelected(false);
    } else {
      const allIds = new Set(articles.map((article) => article.id));
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
    const articlesToProcess = articles.filter(
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
    const articlesToProcess = articles.filter(
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
            フィルター適用中
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
        ) : articles.length === 0 ? (
          <div className="text-center py-20 text-gray-500 dark:text-gray-400">
            記事が見つかりません
          </div>
        ) : (
          <>
            {viewMode === "table" ? (
              <ArticleTable
                articles={articles}
                showCheckbox={true}
                checkedArticles={selectedArticles}
                onCheckArticle={handleSelectArticle}
              />
            ) : (
              <ArticleCardGrid
                articles={articles}
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
