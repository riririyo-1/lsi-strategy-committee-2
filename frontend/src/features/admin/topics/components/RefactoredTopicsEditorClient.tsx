"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/features/i18n/hooks/useI18n";
import { PageLayout } from "@/components/layouts/PageLayout";
import {
  TopicsHeader,
  ArticleSelector,
  CategoryAssigner,
  TopicsPreview,
} from "./ui";
import {
  TopicsWorkflowService,
  TopicsWorkflowState,
  TopicsServiceFactory,
} from "@/services/topics";

interface RefactoredTopicsEditorClientProps {
  mode: "create" | "edit";
  topicId?: string;
}

export default function RefactoredTopicsEditorClient({
  mode,
  topicId,
}: RefactoredTopicsEditorClientProps) {
  const { t } = useI18n();
  const router = useRouter();

  // Workflow service state
  const [workflowState, setWorkflowState] = useState<TopicsWorkflowState | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const workflowServiceRef = useRef<TopicsWorkflowService | null>(null);

  // Initialize workflow service
  useEffect(() => {
    const initializeService = async () => {
      const callbacks = {
        onStateChange: (state: TopicsWorkflowState) => {
          setWorkflowState(state);
        },
        onError: (error: string) => {
          setMessage({ type: 'error', text: error });
          setTimeout(() => setMessage(null), 5000);
        },
        onSuccess: (message: string) => {
          setMessage({ type: 'success', text: message });
          setTimeout(() => setMessage(null), 5000);
        },
      };

      // カテゴリを取得
      const domainServices = TopicsServiceFactory.createDomainServices();
      const categories = await domainServices.assignCategoryUseCase.categoryRepository.findAll();

      workflowServiceRef.current = TopicsServiceFactory.createWorkflowService(callbacks, {
        categories,
      });
      
      // Load existing topic for edit mode
      if (mode === "edit" && topicId) {
        workflowServiceRef.current.loadTopics(topicId);
      } else {
        // Initialize search for create mode
        workflowServiceRef.current.searchArticles('');
      }
    };

    initializeService();

    return () => {
      workflowServiceRef.current = null;
    };
  }, [mode, topicId]);

  const workflowService = workflowServiceRef.current;

  // Event handlers
  const handleSave = async () => {
    if (!workflowService) return;

    const newTopicId = await workflowService.saveTopic(mode, topicId);
    if (mode === "create" && newTopicId) {
      router.push(`/admin/topics/edit/${newTopicId}`);
    }
  };

  const handleCancel = () => {
    if (confirm("変更内容が失われます。よろしいですか？")) {
      router.push("/admin/topics");
    }
  };

  const handleExport = (format: 'html' | 'pdf' | 'json') => {
    if (!workflowService || !topicId) return;
    workflowService.exportTopic(topicId, format);
  };

  // Loading state
  if (!workflowState) {
    return (
      <PageLayout
        title={mode === "create" ? t("admin.topics.createNew") : t("admin.topics.edit")}
        description="TOPICS配信の編集・作成を行います"
        showActionBar={false}
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

  const isValid = workflowState.title.trim().length > 0 && !workflowState.validationErrors.length;

  const actions = (
    <>
      <div></div>
      <button
        onClick={() => router.push("/admin/topics")}
        className="bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 text-white px-4 py-2 rounded transition text-sm font-semibold"
      >
        {t("common.back")}
      </button>
    </>
  );

  return (
    <PageLayout
      title={mode === "create" ? t("admin.topics.createNew") : t("admin.topics.edit")}
      description="TOPICS配信の編集・作成を行います"
      actions={actions}
      showActionBar={true}
    >
      <div className="w-full max-w-full 2xl:max-w-[1920px] mx-auto">
        {/* Success/Error Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Validation Errors */}
        {workflowState.validationErrors.length > 0 && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
            <ul className="list-disc list-inside">
              {workflowState.validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Topics Header */}
        <TopicsHeader
          title={workflowState.title}
          publishDate={workflowState.publishDate.toISOString().split('T')[0]}
          onTitleChange={(title) => workflowService?.updateBasicInfo({ title })}
          onPublishDateChange={(date) => workflowService?.updateBasicInfo({ publishDate: new Date(date) })}
          onSave={handleSave}
          onCancel={handleCancel}
          isValid={isValid}
          isSaving={workflowState.isSaving}
          mode={mode}
        />

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-300 dark:border-gray-600">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'articles', label: t("admin.topics.articleSelection") },
                { key: 'template', label: t("admin.topics.template") },
                { key: 'preview', label: t("admin.topics.preview") },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => workflowService?.switchTab(tab.key as any)}
                  className={`py-3 px-2 border-b-2 font-medium text-base transition-colors ${
                    workflowState.activeTab === tab.key
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 hover:border-gray-400 dark:hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {workflowState.activeTab === "articles" && (
            <ArticleSelector
              availableArticles={workflowState.availableArticles}
              selectedArticles={workflowState.selectedArticles}
              onArticleSelect={(article) => workflowService?.selectArticle(article)}
              onArticleRemove={(articleId) => workflowService?.removeArticle(articleId)}
              onSearch={(query) => workflowService?.searchArticles(query, workflowState.filters)}
              onFilter={(filters) => workflowService?.searchArticles(workflowState.searchQuery, filters)}
              isLoading={workflowState.isLoading}
            />
          )}

          {workflowState.activeTab === "template" && (
            <CategoryAssigner
              selectedArticles={workflowState.selectedArticles}
              articlesWithCategories={workflowState.articlesWithCategories}
              monthlySummary={workflowState.summary}
              categories={workflowState.categories.length > 0 ? workflowState.categories : [
                { id: 'political', name: '政治' },
                { id: 'economical', name: '経済' },
                { id: 'social', name: '社会' },
                { id: 'technological', name: '技術' },
              ]}
              onSummaryChange={(summary) => workflowService?.updateBasicInfo({ summary })}
              onCategoryChange={(articleId, categoryId) => 
                workflowService?.assignCategory(articleId, categoryId, topicId)
              }
              onGenerateSummary={() => workflowService?.generateSummary(topicId || '')}
              onAutoCategorize={(articleId) => 
                workflowService?.autoCategorizeArticles(
                  topicId || '', 
                  articleId ? [articleId] : undefined
                )
              }
              isGeneratingSummary={workflowState.isLoading}
              isCategorizingAll={workflowState.isLoading}
              isCategorizingArticle={workflowState.isLoading ? 'loading' : null}
            />
          )}

          {workflowState.activeTab === "preview" && (
            <TopicsPreview
              title={workflowState.title}
              publishDate={workflowState.publishDate.toISOString().split('T')[0]}
              monthlySummary={workflowState.summary}
              selectedArticles={workflowState.articlesWithCategories}
              onExport={handleExport}
              isExporting={workflowState.isLoading}
            />
          )}
        </div>
      </div>
    </PageLayout>
  );
}