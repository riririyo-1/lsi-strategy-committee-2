"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/features/i18n/hooks/useI18n";
import { useCategories } from "@/hooks/useCategories";
import { Article } from "@/types/article.d";
import { topicsApi, pipelineClient } from "@/lib/apiClient";
import { Button } from "@/components/ui/Button";

interface TemplateGenerationTabProps {
  selectedArticles: Article[];
  monthlySummary: string;
  onMonthlySummaryChange: (summary: string) => void;
  onArticlesWithCategoriesChange?: (articles: ArticleWithCategory[]) => void;
  topicId?: string;
  effectiveTopicId?: string;
  initialArticlesWithCategories?: ArticleWithCategory[];
  onSaveMonthlySummary?: (summary: string) => Promise<void>;
}

export interface ArticleWithCategory extends Article {
  mainCategory?: string;
}

export default function TemplateGenerationTab({
  selectedArticles,
  monthlySummary,
  onMonthlySummaryChange,
  onArticlesWithCategoriesChange,
  topicId,
  effectiveTopicId,
  initialArticlesWithCategories,
  onSaveMonthlySummary,
}: TemplateGenerationTabProps) {
  const { t, locale } = useI18n();
  const { getCategoryName, getCategories } = useCategories();
  const isJa = locale === "ja";
  
  // 記事とカテゴリの状態を管理
  const [articlesWithCategories, setArticlesWithCategories] = useState<ArticleWithCategory[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCategorizingArticle, setIsCategorizingArticle] = useState<string | null>(null);
  const [isCategorizingAll, setIsCategorizingAll] = useState(false);
  const [isSavingSummary, setIsSavingSummary] = useState(false);

  // 初期化時に initialArticlesWithCategories を設定
  useEffect(() => {
    if (initialArticlesWithCategories && initialArticlesWithCategories.length > 0) {
      setArticlesWithCategories(initialArticlesWithCategories);
    }
  }, []);

  // 選択された記事が変更されたときに記事一覧を更新
  useEffect(() => {
    // 新しく追加された記事を検出
    const currentIds = articlesWithCategories.map(a => a.id);
    const selectedIds = selectedArticles.map(a => a.id);
    
    // 追加された記事
    const addedArticles = selectedArticles.filter(article => 
      !currentIds.includes(article.id)
    );
    
    // 削除された記事のIDを取得
    const removedIds = currentIds.filter(id => 
      !selectedIds.includes(id)
    );
    
    if (addedArticles.length > 0 || removedIds.length > 0) {
      setArticlesWithCategories(prev => {
        // 削除された記事を除外
        let updated = prev.filter(article => 
          !removedIds.includes(article.id)
        );
        
        // 新しい記事を追加（重複チェックを追加）
        addedArticles.forEach(article => {
          // 重複チェック: すでに存在する場合は追加しない
          if (!updated.find(a => a.id === article.id)) {
            const existingData = initialArticlesWithCategories?.find(
              a => a.id === article.id
            );
            updated.push(existingData || {
              ...article,
              mainCategory: undefined,
            });
          }
        });
        
        return updated;
      });
    }
  }, [selectedArticles]);

  // カテゴリ情報が更新されたときに親コンポーネントに通知（デバウンス処理）
  useEffect(() => {
    if (!onArticlesWithCategoriesChange) return;
    
    const timeoutId = setTimeout(() => {
      onArticlesWithCategoriesChange(articlesWithCategories);
    }, 300); // 300ms のデバウンス

    return () => clearTimeout(timeoutId);
  }, [articlesWithCategories]);

  // カテゴリ名からIDへのマッピング
  const mapCategoryNameToId = (categoryName: string): string | undefined => {
    const categories = getCategories();
    const cat = categories.find(cat => 
      cat.name === categoryName
    );
    if (cat) return cat.id;
    
    console.warn(`Unknown category: ${categoryName}`);
    return undefined;
  };

  // 手動でカテゴリを変更
  const handleCategoryChange = async (articleId: string, categoryId: string) => {
    // UIを即座に更新
    setArticlesWithCategories(prev =>
      prev.map(article =>
        article.id === articleId
          ? {
              ...article,
              mainCategory: categoryId || undefined
            }
          : article
      )
    );

    // APIを呼び出してサーバーに保存
    if (effectiveTopicId || topicId) {
      try {
        const updateData = {
          main: categoryId
        };

        await topicsApi.updateArticleCategory(effectiveTopicId || topicId!, articleId, updateData);
        console.log(`Category updated for article ${articleId}:`, updateData);
      } catch (error) {
        console.error("Failed to update article category:", error);
        // エラーが発生した場合はUIを元に戻す
        setArticlesWithCategories(prev =>
          prev.map(article =>
            article.id === articleId
              ? {
                  ...article,
                  mainCategory: undefined
                }
              : article
          )
        );
        alert("カテゴリの更新に失敗しました");
      }
    }
  };

  // 月次サマリ保存
  const saveMonthlySummary = async () => {
    if (!onSaveMonthlySummary) return;
    
    try {
      setIsSavingSummary(true);
      await onSaveMonthlySummary(monthlySummary);
      alert("月次まとめを保存しました");
    } catch (error) {
      console.error("Failed to save monthly summary:", error);
      alert("月次まとめの保存に失敗しました");
    } finally {
      setIsSavingSummary(false);
    }
  };

  // 月次サマリ生成
  const generateMonthlySummary = async () => {
    if (selectedArticles.length === 0) {
      alert(t("admin.topics.selectArticlesFirst"));
      return;
    }

    try {
      setIsGenerating(true);
      
      // 新規作成時は直接LLM APIを呼び出す
      const response = await pipelineClient.post("/api/llm/topics/summary", {
        article_ids: selectedArticles.map(a => a.id),
        summary_style: "overview"
      });

      if (response.data.summary) {
        onMonthlySummaryChange(response.data.summary);
      }
    } catch (error) {
      console.error("Failed to generate monthly summary:", error);
      alert(t("admin.topics.summaryGenerationError"));
    } finally {
      setIsGenerating(false);
    }
  };

  // 単一記事の自動カテゴリ分類
  const categorizeSingleArticle = async (articleId: string) => {
    try {
      setIsCategorizingArticle(articleId);
      
      // 新規作成時でも使える直接のカテゴリ分類API
      const response = await pipelineClient.post("/api/llm/topics/categorize", {
        article_ids: [articleId],
        categorization_type: "thematic"
      });

      if (response.data.results) {
        const result = response.data.results.find((r: any) => r.id === articleId);
        
        if (result && result.primary_categories && result.primary_categories.length > 0) {
          const categoryId = mapCategoryNameToId(result.primary_categories[0]);
          
          setArticlesWithCategories(prev =>
            prev.map(article =>
              article.id === articleId
                ? { ...article, mainCategory: categoryId }
                : article
            )
          );
        }
      }
    } catch (error) {
      console.error("Failed to categorize article:", error);
      alert("カテゴリ分類に失敗しました");
    } finally {
      setIsCategorizingArticle(null);
    }
  };

  // 全記事の一括自動カテゴリ分類
  const categorizeAllArticles = async () => {
    if (selectedArticles.length === 0) {
      alert(t("admin.topics.selectArticlesFirst"));
      return;
    }

    try {
      setIsCategorizingAll(true);
      
      // 新規作成時でも使える直接のカテゴリ分類API
      const response = await pipelineClient.post("/api/llm/topics/categorize", {
        article_ids: selectedArticles.map(a => a.id),
        categorization_type: "thematic"
      });

      if (response.data.results) {
        const updatedArticles = articlesWithCategories.map(article => {
          const result = response.data.results.find((r: any) => r.id === article.id);
          
          if (result && result.primary_categories && result.primary_categories.length > 0) {
            const categoryId = mapCategoryNameToId(result.primary_categories[0]);
            
            return { ...article, mainCategory: categoryId };
          }
          
          return article;
        });
        
        setArticlesWithCategories(updatedArticles);
      }
    } catch (error) {
      console.error("Failed to categorize all articles:", error);
      alert("一括カテゴリ分類に失敗しました");
    } finally {
      setIsCategorizingAll(false);
    }
  };

  // カテゴリ別に記事をグループ化
  const getArticlesByCategory = () => {
    const categorized: { [key: string]: ArticleWithCategory[] } = {};
    const uncategorized: ArticleWithCategory[] = [];

    articlesWithCategories.forEach(article => {
      if (article.mainCategory) {
        if (!categorized[article.mainCategory]) {
          categorized[article.mainCategory] = [];
        }
        categorized[article.mainCategory].push(article);
      } else {
        uncategorized.push(article);
      }
    });

    return { categorized, uncategorized };
  };

  // const { categorized, uncategorized } = getArticlesByCategory();

  return (
    <div className="space-y-6">
      {/* 月次まとめセクション */}
      <div className="bg-white dark:bg-[#2d3646] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">
            {t("admin.topics.monthlySummary")}
          </h3>
          <div className="flex gap-2">
            <Button
              onClick={generateMonthlySummary}
              disabled={isGenerating || selectedArticles.length === 0}
              variant="primary"
              isLoading={isGenerating}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md"
            >
              {t("admin.topics.aiGenerate")}
            </Button>
            {onSaveMonthlySummary && (
              <Button
                onClick={saveMonthlySummary}
                disabled={isSavingSummary || !monthlySummary.trim() || !effectiveTopicId}
                variant="secondary"
                isLoading={isSavingSummary}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-sm hover:shadow-md"
              >
                保存
              </Button>
            )}
          </div>
        </div>
        
        <textarea
          value={monthlySummary}
          onChange={(e) => onMonthlySummaryChange(e.target.value)}
          placeholder={t("admin.topics.monthlySummaryPlaceholder")}
          className="w-full h-40 px-4 py-3 bg-gray-50 dark:bg-[#3a4553] text-gray-900 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none resize-vertical transition-colors"
        />
      </div>

      {/* 記事カテゴリ設定セクション */}
      <div className="bg-white dark:bg-[#2d3646] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">
            {t("admin.topics.articleCategorySetting", { count: selectedArticles.length })}
          </h3>
          <Button
            onClick={categorizeAllArticles}
            disabled={isCategorizingAll || selectedArticles.length === 0 || !topicId}
            variant="primary"
            isLoading={isCategorizingAll}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-sm hover:shadow-md"
          >
            {isCategorizingAll ? t("admin.topics.categorizing") : t("admin.topics.batchAutoCategories")}
          </Button>
        </div>

        {selectedArticles.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p>{t("admin.topics.selectArticlesFirst")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {articlesWithCategories.map(article => (
              <ArticleCategoryCard
                key={article.id}
                article={article}
                categories={getCategories()}
                onCategoryChange={handleCategoryChange}
                onAutoCategorize={() => categorizeSingleArticle(article.id)}
                isCategorizing={isCategorizingArticle === article.id}
                locale={locale}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// 記事カテゴリ設定カードコンポーネント
function ArticleCategoryCard({
  article,
  categories,
  onCategoryChange,
  onAutoCategorize,
  isCategorizing,
  locale
}: {
  article: ArticleWithCategory;
  categories: Array<{ id: string; name: string }>;
  onCategoryChange: (articleId: string, categoryId: string) => void;
  onAutoCategorize: () => void;
  isCategorizing: boolean;
  locale: string;
}) {
  const { t } = useI18n();
  const isJa = locale === "ja";

  return (
    <div className="bg-gray-50 dark:bg-[#3a4553] rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h5 className="font-medium text-gray-900 dark:text-gray-200 flex-1 line-clamp-2 mr-4">
          {article.title}
        </h5>
        <button
          onClick={onAutoCategorize}
          disabled={isCategorizing}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap flex-shrink-0"
        >
          {isCategorizing ? t("admin.topics.categorizing") : t("admin.topics.autoCategorize")}
        </button>
      </div>
      
      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 space-y-1">
        <p>{article.source}</p>
        <p>{new Date(article.publishedAt).toLocaleDateString()}</p>
      </div>
      
      {article.summary && (
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
          {article.summary}
        </p>
      )}
      
      <div className="flex gap-3 items-end">
        <div className="flex-1 max-w-xs">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t("admin.topics.category")}
          </label>
          <select
            value={article.mainCategory || ""}
            onChange={(e) => onCategoryChange(article.id, e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-[#4a5568] text-gray-900 dark:text-gray-200 rounded-md border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-sm transition-colors"
          >
            <option value="">{t("admin.topics.selectCategory")}</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}