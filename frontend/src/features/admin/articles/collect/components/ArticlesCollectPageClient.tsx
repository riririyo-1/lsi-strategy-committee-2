"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/features/i18n/hooks/useI18n";
import { Article } from "@/types/article";
import ArticleTable from "@/features/articles/components/ArticleTable";
import { articlesApi } from "@/lib/apiClient";
import ArticleManagementTab from "./ArticleManagementTab";
import ScheduleSettingsTab from "@/features/admin/schedules/components/ScheduleSettingsTab";
import { PageLayout } from "@/components/layouts/PageLayout";
import { Button } from "@/components/ui/Button";
import { Tabs, TabItem } from "@/components/ui/Tabs";
import DatePicker from "@/components/ui/DatePicker";
import { ThemeText, ThemeLabel, ThemeInput, ThemeAlert } from "@/features/theme";
import { RSS_SOURCES, RSS_SOURCES_BY_CATEGORY, SOURCE_ID_TO_NAME } from "@/constants/rssSources";

// RSS収集用のコンポーネント
function RSSCollectionTab() {
  const { t } = useI18n();
  // デフォルトで過去7日間を設定
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [startDate, setStartDate] = useState(
    weekAgo.toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(today.toISOString().split("T")[0]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [collectedArticles, setCollectedArticles] = useState<Article[]>([]);
  const [isCollecting, setIsCollecting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // RSS Sourcesを定数から読み込み
  const rssSources = RSS_SOURCES;
  const sourcesByCategory = RSS_SOURCES_BY_CATEGORY;

  const handleSourceChange = (sourceId: string) => {
    setSelectedSources((prev) =>
      prev.includes(sourceId)
        ? prev.filter((s) => s !== sourceId)
        : [...prev, sourceId]
    );
  };

  // カテゴリ内の全ソースを選択/解除
  const handleCategoryToggle = (category: string) => {
    const categorySourceIds = sourcesByCategory[category].map(s => s.id);
    const allSelected = categorySourceIds.every(id => selectedSources.includes(id));
    
    if (allSelected) {
      // 全て選択済みの場合は解除
      setSelectedSources(prev => prev.filter(id => !categorySourceIds.includes(id)));
    } else {
      // 一部または未選択の場合は全て選択
      setSelectedSources(prev => [...new Set([...prev, ...categorySourceIds])]);
    }
  };

  // 全て選択/解除
  const handleSelectAll = () => {
    const allSourceIds = rssSources.map(s => s.id);
    if (selectedSources.length === allSourceIds.length) {
      setSelectedSources([]);
    } else {
      setSelectedSources(allSourceIds);
    }
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
      // ソースIDをそのまま送信（pipeline側でIDからURLへのマッピングを行う）
      const response = await articlesApi.collectRSS({
        sources: selectedSources,
        startDate,
        endDate,
      });

      const result = response.data;
      console.log("RSS収集結果:", result);

      // RSS収集が成功した場合、実際の記事データを取得
      if (result.insertedCount > 0 || result.skippedCount > 0) {
        try {
          // 最新の記事を取得
          const articlesResponse = await articlesApi.getAll();
          const allArticles = articlesResponse.data;

          // 選択したソースの記事のみをフィルタリング
          const filteredArticles = allArticles
            .filter((article: Article) => {
              // 記事のsourceがselectedSourcesのIDまたは名前に含まれているかチェック
              return selectedSources.some(selectedId => {
                const sourceName = SOURCE_ID_TO_NAME[selectedId];
                // 大文字小文字を無視して比較し、部分一致も許可
                const articleSourceLower = article.source.toLowerCase();
                const sourceNameLower = sourceName.toLowerCase();
                const selectedIdLower = selectedId.toLowerCase();
                
                return (
                  article.source === sourceName || 
                  article.source === selectedId ||
                  articleSourceLower === sourceNameLower ||
                  articleSourceLower === selectedIdLower ||
                  articleSourceLower.includes(sourceNameLower) ||
                  articleSourceLower.includes(selectedIdLower)
                );
              });
            })
            .sort(
              (a: Article, b: Article) =>
                new Date(b.publishedAt).getTime() -
                new Date(a.publishedAt).getTime()
            )
            .slice(0, result.insertedCount + result.skippedCount); // 収集した件数分だけ表示

          setCollectedArticles(filteredArticles);
          console.log(`実際の記事 ${filteredArticles.length} 件を表示`);
        } catch (error) {
          console.error("記事取得エラー:", error);
          // エラーの場合は空配列をセット
          setCollectedArticles([]);
        }
      } else {
        // 収集件数が0の場合は空配列をセット
        setCollectedArticles([]);
      }

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

        // 無効な記事の詳細表示
        if (result.invalidItems && result.invalidItems.length > 0) {
          message += "\n\n【登録できなかった記事】\n";
          result.invalidItems.forEach((item: any, index: number) => {
            message += `${index + 1}. ${item.article?.title || "不明"} - ${
              item.errors?.join(", ") || "エラー詳細不明"
            }\n`;
          });
        }
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
    <>
      {/* 収集設定 */}
      <ThemeText as="h2" size="h3" className="mb-4">
        {t("articlesCollect.collectionSettings")}
      </ThemeText>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <ThemeLabel>
              {t("articles.collect.startDate")}
            </ThemeLabel>
            <DatePicker
              selected={startDate ? new Date(startDate) : undefined}
              onSelect={(date) => setStartDate(date.toISOString().split("T")[0])}
              placeholder="開始日を選択"
              className="w-full"
            />
          </div>
          <div>
            <ThemeLabel>
              {t("articles.collect.endDate")}
            </ThemeLabel>
            <DatePicker
              selected={endDate ? new Date(endDate) : undefined}
              onSelect={(date) => setEndDate(date.toISOString().split("T")[0])}
              placeholder="終了日を選択"
              className="w-full"
            />
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <ThemeLabel>
              {t("articles.collect.selectSources")} ({selectedSources.length} / {rssSources.length} 選択中)
            </ThemeLabel>
            <div className="flex gap-2">
              <button
                onClick={handleSelectAll}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
              >
                {selectedSources.length === rssSources.length ? '全て解除' : '全て選択'}
              </button>
            </div>
          </div>
          
          {/* カテゴリ別にソースを表示 */}
          <div className="space-y-6">
            {Object.entries(sourcesByCategory).map(([category, sources]) => {
              const categorySourceIds = sources.map(s => s.id);
              const selectedInCategory = categorySourceIds.filter(id => selectedSources.includes(id)).length;
              const allCategorySelected = selectedInCategory === categorySourceIds.length;
              const partiallySelected = selectedInCategory > 0 && selectedInCategory < categorySourceIds.length;
              
              return (
                <div key={category} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {category} ({selectedInCategory}/{categorySourceIds.length})
                    </h4>
                    <button
                      onClick={() => handleCategoryToggle(category)}
                      className={`px-3 py-1 text-xs border rounded-md transition-colors ${
                        allCategorySelected
                          ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          : partiallySelected
                          ? 'border-yellow-500 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      {allCategorySelected ? '全て解除' : '全て選択'}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {sources.map((source) => (
                      <button
                        key={source.id}
                        onClick={() => handleSourceChange(source.id)}
                        className={`
                          relative px-3 py-2 rounded-lg border transition-all duration-200 
                          text-xs font-medium min-h-[40px] flex items-center justify-center
                          ${selectedSources.includes(source.id)
                            ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-300'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:bg-gray-700'
                          }
                          hover:shadow-sm active:scale-[0.98]
                        `}
                      >
                        {selectedSources.includes(source.id) && (
                          <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-500 rounded-full dark:bg-blue-400"></div>
                        )}
                        <span className="text-center leading-tight">{source.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Button
          onClick={handleCollection}
          disabled={
            isCollecting ||
            !startDate ||
            !endDate ||
            selectedSources.length === 0
          }
          variant="primary"
          isLoading={isCollecting}
        >
          {t("articles.collect.collectButton")}
        </Button>

      {/* 収集結果 */}
      {collectedArticles.length > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <ThemeText as="h3" size="h4">
              収集結果 ({collectedArticles.length}件)
            </ThemeText>
            <Button
              onClick={handleLLMProcessing}
              disabled={isProcessing}
              variant="primary"
              isLoading={isProcessing}
            >
              {t("articles.collect.summarizeButton")}
            </Button>
          </div>
          <ArticleTable articles={collectedArticles} />
        </div>
      )}
    </>
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
    <>
      {/* 手動追加フォーム */}
      <ThemeText as="h2" size="h3" className="mb-4">
        {t("articlesCollect.manualAddForm")}
      </ThemeText>

        {/* エラー・成功メッセージ */}
        {errorMessage && (
          <ThemeAlert variant="error" className="mb-4">
            {errorMessage}
          </ThemeAlert>
        )}

        {successMessage && (
          <ThemeAlert variant="success" className="mb-4">
            {successMessage}
          </ThemeAlert>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <ThemeLabel>
              {t("articles.collect.title")}
            </ThemeLabel>
            <ThemeInput
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("articles.collect.enterTitle")}
            />
          </div>
          <div>
            <ThemeLabel>
              {t("articles.collect.url")}
            </ThemeLabel>
            <ThemeInput
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t("articles.collect.enterUrl")}
            />
          </div>
          <div>
            <ThemeLabel>
              {t("articles.collect.publishDate")}
            </ThemeLabel>
            <DatePicker
              selected={publishDate ? new Date(publishDate) : undefined}
              onSelect={(date) => setPublishDate(date.toISOString().split("T")[0])}
              placeholder="公開日を選択"
              className="w-full"
            />
          </div>
          <div>
            <ThemeLabel>
              {t("articles.collect.source")}
            </ThemeLabel>
            <ThemeInput
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder={t("articles.collect.enterSource")}
            />
          </div>
        </div>

        <Button
          onClick={handleAddArticle}
          disabled={isAdding || !title || !url || !publishDate || !source}
          variant="primary"
          isLoading={isAdding}
        >
          {t("articles.collect.addButton")}
        </Button>

      {/* 手動追加記事一覧 */}
      {manualArticles.length > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <ThemeText as="h3" size="h4">
              追加記事一覧 ({manualArticles.length}件)
            </ThemeText>
            <Button
              onClick={handleLLMProcessing}
              disabled={isProcessing}
              variant="primary"
              isLoading={isProcessing}
            >
              {t("articles.collect.summarizeButton")}
            </Button>
          </div>
          <ArticleTable articles={manualArticles} />
        </div>
      )}
    </>
  );
}

export default function ArticlesCollectPageClient() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<
    "management" | "rss" | "manual" | "schedule"
  >("management");

  const actions = (
    <>
      <div></div>
      <Button
        variant="secondary"
        onClick={() => window.location.href = "/admin"}
      >
        {t("common.back")}
      </Button>
    </>
  );

  const tabItems: TabItem[] = [
    {
      id: "management",
      label: "記事管理",
      content: <ArticleManagementTab />
    },
    {
      id: "rss",
      label: "RSS収集",
      content: <RSSCollectionTab />
    },
    {
      id: "manual",
      label: "手動追加",
      content: <ManualAddTab />
    },
    {
      id: "schedule",
      label: "定期設定",
      content: <ScheduleSettingsTab />
    }
  ];

  return (
    <PageLayout
      title={t("articlesCollect.title")}
      description={t("articlesCollect.description")}
      actions={actions}
      showActionBar={true}
    >
      <div className="max-w-7xl mx-auto">
        <Tabs
          items={tabItems}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
    </PageLayout>
  );
}
