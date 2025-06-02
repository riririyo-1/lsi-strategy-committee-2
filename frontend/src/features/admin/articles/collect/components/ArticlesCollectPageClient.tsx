"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/features/i18n/hooks/useI18n";
import { Article } from "@/types/article";
import ArticleTable from "@/features/articles/components/ArticleTable";
import { articlesApi } from "@/lib/apiClient";

// RSS収集用のコンポーネント
function RSSCollectionTab() {
  const { t } = useI18n();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [collectedArticles, setCollectedArticles] = useState<Article[]>([]);
  const [isCollecting, setIsCollecting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const sources = ["ITmedia", "NHK", "EE Times Japan", "マイナビ"];

  const handleSourceChange = (source: string) => {
    setSelectedSources((prev) =>
      prev.includes(source)
        ? prev.filter((s) => s !== source)
        : [...prev, source]
    );
  };

  const handleCollection = async () => {
    setIsCollecting(true);
    try {
      console.log("RSS収集開始:", {
        sources: selectedSources,
        startDate,
        endDate,
      });

      // 実際のRSS収集APIを呼び出し
      const response = await articlesApi.collectRSS({
        sources: selectedSources,
        startDate,
        endDate,
      });

      const result = response.data;
      console.log("RSS収集結果:", result);

      // 結果に基づいて収集した記事の情報を表示用にモック作成
      // 実際のAPIからは詳細な記事データが返ってこないため、結果数のみ表示
      const mockCollectedArticles: Article[] = [];
      for (let i = 0; i < (result.insertedCount || 0); i++) {
        mockCollectedArticles.push({
          id: `rss-${i}`,
          title: `収集された記事 ${i + 1}`,
          source: selectedSources[i % selectedSources.length],
          publishedAt: new Date().toISOString(),
          summary: "RSS収集により自動取得された記事です",
          labels: [],
          articleUrl: `https://example.com/rss-article-${i}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      setCollectedArticles(mockCollectedArticles);

      // 成功メッセージの表示
      let message = "";
      if (result.insertedCount > 0) {
        message += `新規 ${result.insertedCount} 件登録しました。`;
      }
      if (result.skippedCount > 0) {
        message += ` 重複 ${result.skippedCount} 件スキップしました。`;
      }
      if (result.invalidCount > 0) {
        message += ` ${result.invalidCount} 件の記事は登録できませんでした。`;
      }

      alert(message || "RSS収集が完了しました。");
    } catch (error: any) {
      console.error("RSS収集エラー:", error);

      let errorMessage = "RSS収集に失敗しました。";
      if (error.response?.status === 503) {
        errorMessage =
          "収集サービスが利用できません。しばらく後にお試しください。";
      } else if (error.response?.status === 400) {
        errorMessage =
          "収集条件に問題があります。日付とソースを確認してください。";
      } else if (error.response?.data?.details) {
        errorMessage += ` (${error.response.data.details})`;
      }

      alert(errorMessage);
    } finally {
      setIsCollecting(false);
    }
  };

  const handleLLMProcessing = async () => {
    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const processedArticles = collectedArticles.map((article) => ({
        ...article,
        summary: `[AI要約] ${article.summary}`,
      }));

      setCollectedArticles(processedArticles);
    } catch (error) {
      console.error("LLM処理エラー:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 収集設定 */}
      <div className="bg-white dark:bg-[#1d2433] rounded-lg p-6 shadow">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          {t("articlesCollect.collectionSettings")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("articles.collect.startDate")}
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#232b39] text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("articles.collect.endDate")}
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#232b39] text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("articles.collect.selectSources")}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {sources.map((source) => (
              <label
                key={source}
                className="flex items-center text-sm text-gray-700 dark:text-gray-300"
              >
                <input
                  type="checkbox"
                  checked={selectedSources.includes(source)}
                  onChange={() => handleSourceChange(source)}
                  className="mr-2 rounded"
                />
                {source}
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={handleCollection}
          disabled={
            isCollecting ||
            !startDate ||
            !endDate ||
            selectedSources.length === 0
          }
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-md transition-colors"
        >
          {isCollecting
            ? t("common.processing")
            : t("articles.collect.collectButton")}
        </button>
      </div>

      {/* 収集結果 */}
      {collectedArticles.length > 0 && (
        <div className="bg-white dark:bg-[#1d2433] rounded-lg p-6 shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              収集結果 ({collectedArticles.length}件)
            </h3>
            <button
              onClick={handleLLMProcessing}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors"
            >
              {isProcessing
                ? t("common.processing")
                : t("articles.collect.summarizeButton")}
            </button>
          </div>
          <ArticleTable articles={collectedArticles} />
        </div>
      )}
    </div>
  );
}

// 手動追加用のコンポーネント
function ManualAddTab() {
  const { t } = useI18n();
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [publishDate, setPublishDate] = useState("");
  const [source, setSource] = useState("");
  const [manualArticles, setManualArticles] = useState<Article[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const validateForm = () => {
    if (!title.trim()) {
      return "タイトルを入力してください";
    }
    if (!url.trim()) {
      return "URLを入力してください";
    }
    if (!isValidUrl(url)) {
      return "有効なURLを入力してください";
    }
    if (!publishDate) {
      return "公開日を選択してください";
    }
    if (!source.trim()) {
      return "ソースを入力してください";
    }
    return null;
  };

  const isValidUrl = (urlString: string) => {
    try {
      new URL(urlString);
      return true;
    } catch (_) {
      return false;
    }
  };

  const clearMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleAddArticle = async () => {
    clearMessages();

    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsAdding(true);

    try {
      const response = await articlesApi.create({
        title,
        articleUrl: url,
        source,
        publishedAt: publishDate,
      });

      // 新しい記事を作成（APIから返されたIDを使用）
      const newArticle: Article = {
        id: response.data.id,
        title,
        source,
        publishedAt: publishDate,
        articleUrl: url,
        summary: "",
        labels: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setManualArticles((prev) => [...prev, newArticle]);

      // フォームをリセット
      setTitle("");
      setUrl("");
      setPublishDate("");
      setSource("");
      setSuccessMessage("記事が正常に追加されました");
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "不明なエラー";
      setErrorMessage("記事の追加に失敗しました: " + errorMsg);
    } finally {
      setIsAdding(false);
    }
  };

  const handleLLMProcessing = async () => {
    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const processedArticles = manualArticles.map((article) => ({
        ...article,
        summary: `[AI要約] この記事は${article.source}から収集されました`,
      }));

      setManualArticles(processedArticles);
    } catch (error) {
      console.error("LLM処理エラー:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 手動追加フォーム */}
      <div className="bg-white dark:bg-[#1d2433] rounded-lg p-6 shadow">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          {t("articlesCollect.manualAddForm")}
        </h2>

        {/* エラー・成功メッセージ */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {successMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("articles.collect.title")}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("articles.collect.enterTitle")}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#232b39] text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("articles.collect.url")}
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t("articles.collect.enterUrl")}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#232b39] text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("articles.collect.publishDate")}
            </label>
            <input
              type="date"
              value={publishDate}
              onChange={(e) => setPublishDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#232b39] text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("articles.collect.source")}
            </label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder={t("articles.collect.enterSource")}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#232b39] text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        <button
          onClick={handleAddArticle}
          disabled={isAdding || !title || !url || !publishDate || !source}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-md transition-colors"
        >
          {isAdding ? t("common.processing") : t("articles.collect.addButton")}
        </button>
      </div>

      {/* 手動追加記事一覧 */}
      {manualArticles.length > 0 && (
        <div className="bg-white dark:bg-[#1d2433] rounded-lg p-6 shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              追加記事一覧 ({manualArticles.length}件)
            </h3>
            <button
              onClick={handleLLMProcessing}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors"
            >
              {isProcessing
                ? t("common.processing")
                : t("articles.collect.summarizeButton")}
            </button>
          </div>
          <ArticleTable articles={manualArticles} />
        </div>
      )}
    </div>
  );
}

export default function ArticlesCollectPageClient() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<"rss" | "manual">("rss");

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#181e29] py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="mb-4">
            <Link
              href="/admin"
              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              {t("admin.common.backToAdmin")}
            </Link>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2">
            {t("articlesCollect.title")}
          </h1>

          <p className="text-gray-600 dark:text-gray-300">
            {t("articlesCollect.description")}
          </p>
        </div>

        {/* タブナビゲーション */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("rss")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "rss"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300"
                }`}
              >
                {t("articlesCollect.rssFeedTab")}
              </button>
              <button
                onClick={() => setActiveTab("manual")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "manual"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300"
                }`}
              >
                {t("articlesCollect.manualAddTab")}
              </button>
            </nav>
          </div>
        </div>

        {/* タブコンテンツ */}
        {activeTab === "rss" ? <RSSCollectionTab /> : <ManualAddTab />}
      </div>
    </div>
  );
}
