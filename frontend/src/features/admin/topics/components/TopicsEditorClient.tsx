"use client";

import { useI18n } from "@/features/i18n/hooks/useI18n";
import { PageLayout } from "@/components/layouts/PageLayout";
import { useTopicsEditor } from "../hooks/useTopicsEditor";
import {
  TopicsBasicInfo,
  TopicsActionButtons,
  TopicsTabNavigation,
  TopicsTabContent,
  TopicsLoadingState,
} from "./index";

interface TopicsEditorClientProps {
  mode: "create" | "edit";
  topicId?: string;
}

export default function TopicsEditorClient({
  mode,
  topicId,
}: TopicsEditorClientProps) {
  const { t } = useI18n();
  const { state, actions } = useTopicsEditor({ mode, topicId });

  // Header actions for PageLayout
  const headerActions = (
    <>
      <div></div>
      <button
        onClick={() => (window.location.href = "/admin/topics")}
        className="bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 text-white px-4 py-2 rounded transition text-sm font-semibold"
      >
        {t("common.back")}
      </button>
    </>
  );

  // Show loading state
  if (state.loading) {
    return <TopicsLoadingState mode={mode} actions={headerActions} />;
  }

  return (
    <PageLayout
      title={
        mode === "create" ? t("admin.topics.createNew") : t("admin.topics.edit")
      }
      description="TOPICS配信の編集・作成を行います"
      actions={headerActions}
      showActionBar={true}
    >
      <div className="w-full max-w-full 2xl:max-w-[1920px] mx-auto">
        {/* 基本情報入力 */}
        <TopicsBasicInfo
          title={state.title}
          publishDate={state.publishDate}
          onTitleChange={actions.setTitle}
          onPublishDateChange={actions.setPublishDate}
        />

        {/* 保存・キャンセルボタン */}
        <TopicsActionButtons
          mode={mode}
          saving={state.saving}
          title={state.title}
          onSave={actions.handleSave}
          onCancel={actions.handleCancel}
        />

        {/* タブナビゲーション */}
        <TopicsTabNavigation
          activeTab={state.activeTab}
          onTabChange={actions.setActiveTab}
        />

        {/* タブコンテンツ */}
        <TopicsTabContent
          activeTab={state.activeTab}
          selectedArticles={state.selectedArticles}
          onSelectedArticlesChange={actions.setSelectedArticles}
          monthlySummary={state.monthlySummary}
          onMonthlySummaryChange={actions.setMonthlySummary}
          onArticlesWithCategoriesChange={actions.setArticlesWithCategories}
          onSaveMonthlySummary={actions.saveMonthlySummary}
          topicId={topicId}
          effectiveTopicId={actions.effectiveTopicId || undefined}
          mode={mode}
          articlesWithCategories={state.articlesWithCategories}
          title={state.title}
          publishDate={state.publishDate}
        />
      </div>
    </PageLayout>
  );
}
