"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/features/i18n/hooks/useI18n";
import { Article } from "@/types/article.d";
import { topicsApi } from "@/lib/apiClient";
import { Button } from "@/components/common/Button";

interface TemplateGenerationTabProps {
  selectedArticles: Article[];
  monthlySummary: string;
  onMonthlySummaryChange: (summary: string) => void;
  onArticlesWithCategoriesChange?: (articles: ArticleWithCategory[]) => void;
  topicId?: string;
}

export interface ArticleWithCategory extends Article {
  mainCategory?: string;
  subCategory?: string;
}

// カテゴリ定義（DB設計書に基づく）
const MAIN_CATEGORIES = [
  { id: "political", name: "Political", nameJa: "政治・政策" },
  { id: "economical", name: "Economical", nameJa: "経済・市場" },
  { id: "social", name: "Social", nameJa: "社会・文化" },
  { id: "technological", name: "Technological", nameJa: "技術・イノベーション" },
];

const SUB_CATEGORIES = [
  { id: "government_initiatives", name: "Government Initiatives", nameJa: "国の取り組み" },
  { id: "ma", name: "M&A", nameJa: "M&A" },
  { id: "production_tech", name: "Production Technology", nameJa: "生産技術" },
  { id: "advanced_tech", name: "Advanced Technology", nameJa: "先端技術" },
  { id: "social_trends", name: "Social Trends", nameJa: "世の中の動き" },
  { id: "market_trends", name: "Market Trends", nameJa: "市場動向" },
  { id: "research_development", name: "R&D", nameJa: "研究開発" },
  { id: "supply_chain", name: "Supply Chain", nameJa: "サプライチェーン" },
  { id: "environmental", name: "Environmental", nameJa: "環境・サステナビリティ" },
  { id: "others", name: "Others", nameJa: "その他" },
];

export default function TemplateGenerationTab({
  selectedArticles,
  monthlySummary,
  onMonthlySummaryChange,
  onArticlesWithCategoriesChange,
  topicId,
}: TemplateGenerationTabProps) {
  const { t, locale } = useI18n();
  const isJa = locale === "ja";
  
  // 記事とカテゴリの状態を管理
  const [articlesWithCategories, setArticlesWithCategories] = useState<ArticleWithCategory[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCategorizingArticle, setIsCategorizingArticle] = useState<string | null>(null);
  const [isCategorizingAll, setIsCategorizingAll] = useState(false);

  // 選択された記事が変更されたときに記事一覧を初期化
  useEffect(() => {
    const initialArticles = selectedArticles.map(article => ({
      ...article,
      mainCategory: undefined,
      subCategory: undefined,
    }));
    setArticlesWithCategories(initialArticles);
  }, [selectedArticles]);

  // カテゴリ情報が更新されたときに親コンポーネントに通知
  useEffect(() => {
    if (onArticlesWithCategoriesChange) {
      onArticlesWithCategoriesChange(articlesWithCategories);
    }
  }, [articlesWithCategories, onArticlesWithCategoriesChange]);

  // カテゴリ名からIDへのマッピング
  const mapCategoryNameToId = (categoryName: string): string | undefined => {
    // メインカテゴリから検索
    const mainCat = MAIN_CATEGORIES.find(cat => 
      cat.name === categoryName || cat.nameJa === categoryName
    );
    if (mainCat) return mainCat.id;
    
    // サブカテゴリから検索
    const subCat = SUB_CATEGORIES.find(cat => 
      cat.name === categoryName || cat.nameJa === categoryName
    );
    if (subCat) return subCat.id;
    
    console.warn(`Unknown category: ${categoryName}`);
    return undefined;
  };

  // 手動でカテゴリを変更
  const handleCategoryChange = async (articleId: string, categoryType: 'main' | 'sub', categoryId: string) => {
    // UIを即座に更新
    setArticlesWithCategories(prev =>
      prev.map(article =>
        article.id === articleId
          ? {
              ...article,
              [categoryType === 'main' ? 'mainCategory' : 'subCategory']: categoryId || undefined
            }
          : article
      )
    );

    // APIを呼び出してサーバーに保存
    if (topicId) {
      try {
        const article = articlesWithCategories.find(a => a.id === articleId);
        if (article) {
          const updateData = {
            main: categoryType === 'main' ? categoryId : article.mainCategory,
            sub: categoryType === 'sub' ? [categoryId] : (article.subCategory ? [article.subCategory] : [])
          };

          await topicsApi.updateArticleCategory(topicId, articleId, updateData);
          console.log(`Category updated for article ${articleId}:`, updateData);
        }
      } catch (error) {
        console.error("Failed to update article category:", error);
        // エラーが発生した場合はUIを元に戻す
        setArticlesWithCategories(prev =>
          prev.map(article =>
            article.id === articleId
              ? {
                  ...article,
                  [categoryType === 'main' ? 'mainCategory' : 'subCategory']: undefined
                }
              : article
          )
        );
        alert("カテゴリの更新に失敗しました");
      }
    }
  };

  // 月次サマリ生成
  const generateMonthlySummary = async () => {
    if (!topicId || selectedArticles.length === 0) {
      alert(t("admin.topics.selectArticlesFirst"));
      return;
    }

    try {
      setIsGenerating(true);
      
      const response = await topicsApi.generateSummary(topicId, {
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
    if (!topicId) {
      alert("Topic IDが必要です");
      return;
    }

    try {
      setIsCategorizingArticle(articleId);
      
      const response = await topicsApi.categorize(topicId, {
        article_ids: [articleId]
      });

      if (response.data.success && response.data.results) {
        const result = response.data.results.find((r: any) => r.article_id === articleId);
        
        if (result) {
          const mainCategoryId = result.main ? mapCategoryNameToId(result.main) : undefined;
          const subCategoryId = result.sub && Array.isArray(result.sub) && result.sub.length > 0
            ? mapCategoryNameToId(result.sub[0])
            : undefined;
          
          setArticlesWithCategories(prev =>
            prev.map(article =>
              article.id === articleId
                ? { ...article, mainCategory: mainCategoryId, subCategory: subCategoryId }
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
    if (!topicId || selectedArticles.length === 0) {
      alert(t("admin.topics.selectArticlesFirst"));
      return;
    }

    try {
      setIsCategorizingAll(true);
      
      const response = await topicsApi.categorize(topicId, {
        article_ids: selectedArticles.map(a => a.id)
      });

      if (response.data.success && response.data.results) {
        const updatedArticles = articlesWithCategories.map(article => {
          const result = response.data.results.find((r: any) => r.article_id === article.id);
          
          if (result) {
            const mainCategoryId = result.main ? mapCategoryNameToId(result.main) : undefined;
            const subCategoryId = result.sub && Array.isArray(result.sub) && result.sub.length > 0
              ? mapCategoryNameToId(result.sub[0])
              : undefined;
            
            return { ...article, mainCategory: mainCategoryId, subCategory: subCategoryId };
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
          <Button
            onClick={generateMonthlySummary}
            disabled={isGenerating || selectedArticles.length === 0 || !topicId}
            variant="primary"
            isLoading={isGenerating}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md"
          >
            {t("admin.topics.aiGenerate")}
          </Button>
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
                mainCategories={MAIN_CATEGORIES}
                subCategories={SUB_CATEGORIES}
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
  mainCategories,
  subCategories,
  onCategoryChange,
  onAutoCategorize,
  isCategorizing,
  locale
}: {
  article: ArticleWithCategory;
  mainCategories: typeof MAIN_CATEGORIES;
  subCategories: typeof SUB_CATEGORIES;
  onCategoryChange: (articleId: string, categoryType: 'main' | 'sub', categoryId: string) => void;
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
            {t("admin.topics.mainCategory")}
          </label>
          <select
            value={article.mainCategory || ""}
            onChange={(e) => onCategoryChange(article.id, 'main', e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-[#4a5568] text-gray-900 dark:text-gray-200 rounded-md border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-sm transition-colors"
          >
            <option value="">{t("admin.topics.selectCategory")}</option>
            {mainCategories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {isJa ? cat.nameJa : cat.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex-1 max-w-xs">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t("admin.topics.subCategory")}
          </label>
          <select
            value={article.subCategory || ""}
            onChange={(e) => onCategoryChange(article.id, 'sub', e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-[#4a5568] text-gray-900 dark:text-gray-200 rounded-md border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-sm transition-colors"
          >
            <option value="">{t("admin.topics.selectSubCategory")}</option>
            {subCategories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {isJa ? cat.nameJa : cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}