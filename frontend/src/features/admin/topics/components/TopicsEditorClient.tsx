"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/features/i18n/hooks/useI18n";
import { Topic } from "@/types/topic.d";
import { Article } from "@/types/article.d";
import ArticleSelectionTab from "./ArticleSelectionTab";
import TemplateGenerationTab, { ArticleWithCategory } from "./TemplateGenerationTab";
import TopicsPreviewTab from "./TopicsPreviewTab";
import { topicsApi } from "@/lib/apiClient";
import DatePicker from "@/components/common/DatePicker";
import { PageLayout } from "@/components/common/PageLayout";

interface TopicsEditorClientProps {
  mode: "create" | "edit";
  topicId?: string;
}

export default function TopicsEditorClient({
  mode,
  topicId,
}: TopicsEditorClientProps) {
  const { t } = useI18n();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<
    "articles" | "template" | "preview"
  >("articles");
  const [title, setTitle] = useState("");
  const [publishDate, setPublishDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedArticles, setSelectedArticles] = useState<Article[]>([]);
  const [monthlySummary, setMonthlySummary] = useState("");
  const [articlesWithCategories, setArticlesWithCategories] = useState<ArticleWithCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [topic, setTopic] = useState<Topic | null>(null);

  // 編集モードの場合、TOPICSデータを取得
  useEffect(() => {
    if (mode === "edit" && topicId) {
      loadTopic();
    }
  }, [mode, topicId]);

  const loadTopic = async () => {
    if (!topicId) return;

    try {
      setLoading(true);
      const response = await topicsApi.getById(topicId);
      const topicData = response.data;

      setTopic(topicData);
      setTitle(topicData.title || "");
      setPublishDate(
        topicData.publishDate
          ? topicData.publishDate.split("T")[0]
          : new Date().toISOString().split("T")[0]
      );
      setMonthlySummary(topicData.summary || "");

      // 関連記事の取得は別途実装が必要
      // setSelectedArticles(topicData.articles || []);
    } catch (error) {
      console.error("Failed to load topic:", error);
      alert("TOPICSの読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert("タイトルを入力してください");
      return;
    }

    try {
      setSaving(true);
      console.log("Saving topic with data:", {
        title: title.trim(),
        publishDate,
        summary: monthlySummary,
        articleCount: selectedArticles.length,
      });

      const topicData = {
        title: title.trim(),
        publishDate: publishDate,
        summary: monthlySummary,
        articles: selectedArticles.map((article) => article.id),
        // カテゴリ情報も含める（編集モードの場合のみ）
        articlesWithCategories: mode === "edit" && articlesWithCategories.length > 0 
          ? articlesWithCategories.map(article => ({
              id: article.id,
              mainCategory: article.mainCategory,
              subCategory: article.subCategory
            }))
          : undefined,
      };

      console.log("Calling API with topicData:", topicData);

      if (mode === "create") {
        console.log("Creating new topic...");
        const response = await topicsApi.create(topicData);
        console.log("Topic created successfully:", response.data);
        alert("TOPICSを作成しました");
        router.push(`/admin/topics/edit/${response.data.id}`);
      } else if (mode === "edit" && topicId) {
        console.log("Updating topic with ID:", topicId);
        const response = await topicsApi.update(topicId, topicData);
        console.log("Topic updated successfully:", response.data);
        alert("TOPICSを更新しました");
      }
    } catch (error) {
      console.error("Failed to save topic:", error);
      alert("TOPICSの保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (confirm("変更内容が失われます。よろしいですか？")) {
      router.push("/admin/topics");
    }
  };

  const actions = (
    <>
      <div></div>
      <button
        onClick={() => window.location.href = "/admin/topics"}
        className="bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 text-white px-4 py-2 rounded transition text-sm font-semibold"
      >
        {t("common.back")}
      </button>
    </>
  );

  if (loading) {
    return (
      <PageLayout
        title={mode === "create" ? t("admin.topics.createNew") : t("admin.topics.edit")}
        description="TOPICS配信の編集・作成を行います"
        actions={actions}
        showActionBar={true}
      >
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {t("common.loading")}
          </p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={mode === "create" ? t("admin.topics.createNew") : t("admin.topics.edit")}
      description="TOPICS配信の編集・作成を行います"
      actions={actions}
      showActionBar={true}
    >
      <div className="w-full max-w-full 2xl:max-w-[1920px] mx-auto">
        {/* 基本情報入力 */}
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("admin.topics.title")} *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t("admin.topics.titlePlaceholder")}
                  className="w-full px-4 py-2 bg-white dark:bg-[#2d3646] text-gray-900 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors"
                />
              </div>
              <div className="w-full md:w-64">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("admin.topics.publishDate")}
                </label>
                <DatePicker
                  selected={publishDate ? new Date(publishDate) : undefined}
                  onSelect={(date) => setPublishDate(date.toISOString().split("T")[0])}
                  placeholder={t("admin.topics.selectPublishDate")}
                  className="w-full"
                />
              </div>
            </div>

            {/* 保存・キャンセルボタン */}
            <div className="flex gap-4">
              <button
                onClick={handleSave}
                disabled={saving || !title.trim()}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors"
              >
                {saving ? t("common.saving") : mode === "create" ? t("common.create") : t("common.update")}
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                {t("common.cancel")}
              </button>
            </div>
          </div>

          {/* タブナビゲーション */}
          <div className="mb-6 mt-12">
            <div className="border-b border-gray-300 dark:border-gray-600">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab("articles")}
                  className={`py-3 px-2 border-b-2 font-medium text-base transition-colors ${
                    activeTab === "articles"
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 hover:border-gray-400 dark:hover:border-gray-300"
                  }`}
                >
                  {t("admin.topics.articleSelection")}
                </button>
                <button
                  onClick={() => setActiveTab("template")}
                  className={`py-3 px-2 border-b-2 font-medium text-base transition-colors ${
                    activeTab === "template"
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 hover:border-gray-400 dark:hover:border-gray-300"
                  }`}
                >
                  {t("admin.topics.template")}
                </button>
                <button
                  onClick={() => setActiveTab("preview")}
                  className={`py-3 px-2 border-b-2 font-medium text-base transition-colors ${
                    activeTab === "preview"
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 hover:border-gray-400 dark:hover:border-gray-300"
                  }`}
                >
                  {t("admin.topics.preview")}
                </button>
              </nav>
            </div>
          </div>

          {/* タブコンテンツ */}
          <div className="mt-6">
            {activeTab === "articles" && (
              <ArticleSelectionTab
                selectedArticles={selectedArticles}
                onSelectedArticlesChange={setSelectedArticles}
              />
            )}
            {activeTab === "template" && (
              <TemplateGenerationTab
                selectedArticles={selectedArticles}
                monthlySummary={monthlySummary}
                onMonthlySummaryChange={setMonthlySummary}
                onArticlesWithCategoriesChange={setArticlesWithCategories}
                topicId={topicId}
              />
            )}
            {activeTab === "preview" && (
              <TopicsPreviewTab
                title={title}
                publishDate={publishDate}
                monthlySummary={monthlySummary}
                selectedArticles={articlesWithCategories.length > 0 ? articlesWithCategories : selectedArticles}
              />
            )}
          </div>
      </PageLayout>
    );
}
