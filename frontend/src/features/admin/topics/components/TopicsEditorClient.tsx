"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/features/i18n/hooks/useI18n";
import { Topic } from "@/types/topic.d";
import { Article } from "@/types/article.d";
import ArticleSelectionTab from "./ArticleSelectionTab";
import TemplateGenerationTab from "./TemplateGenerationTab";
import TopicsPreviewTab from "./TopicsPreviewTab";
import { topicsApi } from "@/lib/apiClient";

interface TopicsEditorClientProps {
  mode: "create" | "edit";
  topicId?: string;
}

export default function TopicsEditorClient({ mode, topicId }: TopicsEditorClientProps) {
  const { t } = useI18n();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<"articles" | "template" | "preview">("articles");
  const [title, setTitle] = useState("");
  const [publishDate, setPublishDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedArticles, setSelectedArticles] = useState<Article[]>([]);
  const [monthlySummary, setMonthlySummary] = useState("");
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
      setPublishDate(topicData.publishDate ? topicData.publishDate.split('T')[0] : new Date().toISOString().split('T')[0]);
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
      
      const topicData = {
        title: title.trim(),
        publishDate: publishDate ? new Date(publishDate).toISOString() : new Date().toISOString(),
        summary: monthlySummary,
        // selectedArticles の情報も含める必要がある
        articles: selectedArticles.map(article => article.id),
      };

      if (mode === "create") {
        const response = await topicsApi.create(topicData);
        alert("TOPICSを作成しました");
        router.push(`/admin/topics/edit/${response.data.id}`);
      } else if (mode === "edit" && topicId) {
        await topicsApi.update(topicId, topicData);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#181e29] py-0 px-0">
        <div className="pt-[90px] pb-12 px-4 md:px-8">
          <div className="w-full max-w-full 2xl:max-w-[1920px] mx-auto">
            <div className="bg-white dark:bg-[#232b39] rounded-2xl shadow-lg p-4 md:p-8">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">{t("common.loading")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#181e29] py-0 px-0">
      <div className="pt-[90px] pb-12 px-4 md:px-8">
        <div className="w-full max-w-full 2xl:max-w-[1920px] mx-auto">
          <div className="bg-white dark:bg-[#232b39] rounded-2xl shadow-lg p-4 md:p-8">
            {/* ヘッダー */}
            <div className="mb-6">
              <div className="mb-4">
                <Link
                  href="/admin/topics"
                  className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  {t("admin.topics.backToList")}
                </Link>
              </div>
              
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {mode === "create" ? t("admin.topics.createNew") : t("admin.topics.edit")}
              </h1>

              {/* 基本情報入力 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("admin.topics.publishDate")}
                  </label>
                  <input
                    type="date"
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
                    className="w-full px-4 py-2 bg-white dark:bg-[#2d3646] text-gray-900 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors"
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
                  {saving ? "保存中..." : mode === "create" ? "作成" : "更新"}
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </div>

            {/* タブナビゲーション */}
            <div className="mb-6">
              <div className="border-b border-gray-600">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab("articles")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === "articles"
                        ? "border-blue-500 text-blue-400"
                        : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
                    }`}
                  >
                    記事選択
                  </button>
                  <button
                    onClick={() => setActiveTab("template")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === "template"
                        ? "border-blue-500 text-blue-400"
                        : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
                    }`}
                  >
                    テンプレート
                  </button>
                  <button
                    onClick={() => setActiveTab("preview")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === "preview"
                        ? "border-blue-500 text-blue-400"
                        : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
                    }`}
                  >
                    プレビュー
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
                />
              )}
              {activeTab === "preview" && (
                <TopicsPreviewTab
                  title={title}
                  publishDate={publishDate}
                  monthlySummary={monthlySummary}
                  selectedArticles={selectedArticles}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}