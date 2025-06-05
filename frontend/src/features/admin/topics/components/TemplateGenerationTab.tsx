"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/features/i18n/hooks/useI18n";
import { Article } from "@/types/article.d";
import { pipelineTopicsApi } from "@/lib/apiClient";

interface TemplateGenerationTabProps {
  selectedArticles: Article[];
  monthlySummary: string;
  onMonthlySummaryChange: (summary: string) => void;
}

interface ArticleWithCategory extends Article {
  mainCategory?: string;
  subCategory?: string;
}

// PEST分析に基づいたカテゴリ定義
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
}: TemplateGenerationTabProps) {
  const { t, locale } = useI18n();
  const isJa = locale === "ja";
  
  const [articlesWithCategories, setArticlesWithCategories] = useState<ArticleWithCategory[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAutoCategorizingAll, setIsAutoCategorizingAll] = useState(false);

  // 選択された記事が変更されたときにカテゴリ情報を更新
  useEffect(() => {
    updateArticlesWithCategories();
  }, [selectedArticles]);

  const updateArticlesWithCategories = () => {
    const updatedArticles = selectedArticles.map(article => {
      const existing = articlesWithCategories.find(a => a.id === article.id);
      return {
        ...article,
        mainCategory: existing?.mainCategory,
        subCategory: existing?.subCategory,
      };
    });
    setArticlesWithCategories(updatedArticles);
  };

  const handleMainCategoryChange = (articleId: string, categoryId: string) => {
    setArticlesWithCategories(prev =>
      prev.map(article =>
        article.id === articleId
          ? { ...article, mainCategory: categoryId || undefined }
          : article
      )
    );
  };

  const handleSubCategoryChange = (articleId: string, subCategoryId: string) => {
    setArticlesWithCategories(prev =>
      prev.map(article =>
        article.id === articleId
          ? { ...article, subCategory: subCategoryId || undefined }
          : article
      )
    );
  };

  const generateMonthlySummary = async () => {
    if (selectedArticles.length === 0) {
      alert(t("admin.topics.selectArticlesFirst"));
      return;
    }

    try {
      setIsGenerating(true);
      
      // Pipeline API を使用してAI生成
      const response = await pipelineTopicsApi.generate({
        article_ids: selectedArticles.map(a => a.id),
        template_type: "monthly_summary"
      });

      const generatedSummary = response.data.summary || response.data.content || "";
      onMonthlySummaryChange(generatedSummary);
      
    } catch (error) {
      console.error("Failed to generate monthly summary:", error);
      alert(t("admin.topics.summaryGenerationError"));
    } finally {
      setIsGenerating(false);
    }
  };

  const autoCategorizeSingleArticle = async (articleId: string) => {
    try {
      const article = articlesWithCategories.find(a => a.id === articleId);
      if (!article) return;

      // AI分析に基づいてカテゴリを推定（実際の実装では記事内容を分析）
      // 今回はダミー実装
      const suggestedMain = MAIN_CATEGORIES[Math.floor(Math.random() * MAIN_CATEGORIES.length)];
      const suggestedSub = SUB_CATEGORIES[Math.floor(Math.random() * SUB_CATEGORIES.length)];
      
      setArticlesWithCategories(prev =>
        prev.map(a =>
          a.id === articleId
            ? { ...a, mainCategory: suggestedMain.id, subCategory: suggestedSub.id }
            : a
        )
      );
      
    } catch (error) {
      console.error("Failed to auto-categorize article:", error);
      alert(t("admin.topics.autoCategorizeError"));
    }
  };

  const autoCategorizeAllArticles = async () => {
    if (selectedArticles.length === 0) {
      alert(t("admin.topics.selectArticlesFirst"));
      return;
    }

    try {
      setIsAutoCategorizingAll(true);
      
      // Pipeline API を使用してすべての記事を一括カテゴリ分類
      // 実際の実装では、記事の内容に基づいて最適なカテゴリを提案する
      const updatedArticles = articlesWithCategories.map(article => {
        const suggestedMain = MAIN_CATEGORIES[Math.floor(Math.random() * MAIN_CATEGORIES.length)];
        const suggestedSub = SUB_CATEGORIES[Math.floor(Math.random() * SUB_CATEGORIES.length)];
        return {
          ...article,
          mainCategory: suggestedMain.id,
          subCategory: suggestedSub.id,
        };
      });
      
      setArticlesWithCategories(updatedArticles);
      
    } catch (error) {
      console.error("Failed to auto-categorize all articles:", error);
      alert(t("admin.topics.batchCategorizeError"));
    } finally {
      setIsAutoCategorizingAll(false);
    }
  };

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

  const { categorized, uncategorized } = getArticlesByCategory();

  return (
    <div className="space-y-6">
      {/* 月次まとめセクション */}
      <div className="bg-white dark:bg-[#2d3646] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">
            {t("admin.topics.monthlySummary")}
          </h3>
          <button
            onClick={generateMonthlySummary}
            disabled={isGenerating || selectedArticles.length === 0}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md"
          >
            {isGenerating ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t("admin.topics.generating")}
              </span>
            ) : (
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                {t("admin.topics.aiGenerate")}
              </span>
            )}
          </button>
        </div>
        
        <textarea
          value={monthlySummary}
          onChange={(e) => onMonthlySummaryChange(e.target.value)}
          placeholder={t("admin.topics.monthlySummaryPlaceholder")}
          className="w-full h-40 px-4 py-3 bg-gray-50 dark:bg-[#3a4553] text-gray-900 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none resize-vertical transition-colors"
        />
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {t("admin.topics.monthlySummaryHint")}
        </p>
      </div>

      {/* 記事カテゴリ設定セクション */}
      <div className="bg-white dark:bg-[#2d3646] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">
            {t("admin.topics.articleCategorySetting", { count: articlesWithCategories.length })}
          </h3>
          <button
            onClick={autoCategorizeAllArticles}
            disabled={isAutoCategorizingAll || selectedArticles.length === 0}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md"
          >
            {isAutoCategorizingAll ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t("admin.topics.categorizing")}
              </span>
            ) : (
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                {t("admin.topics.batchAutoCategories")}
              </span>
            )}
          </button>
        </div>

        {selectedArticles.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <p className="mt-2">{t("admin.topics.selectArticlesFirst")}</p>
            <p className="text-sm mt-1">{t("admin.topics.selectArticlesHint")}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* カテゴリ別表示 */}
            {MAIN_CATEGORIES.map(mainCategory => {
              const categoryArticles = categorized[mainCategory.id] || [];
              if (categoryArticles.length === 0) return null;

              return (
                <div key={mainCategory.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-gray-900 dark:text-gray-200 mb-3">
                    {isJa ? mainCategory.nameJa : mainCategory.name} ({categoryArticles.length})
                  </h4>
                  
                  <div className="space-y-3">
                    {categoryArticles.map(article => (
                      <ArticleCategoryCard
                        key={article.id}
                        article={article}
                        mainCategories={MAIN_CATEGORIES}
                        subCategories={SUB_CATEGORIES}
                        onMainCategoryChange={handleMainCategoryChange}
                        onSubCategoryChange={handleSubCategoryChange}
                        onAutoCategorize={() => autoCategorizeSingleArticle(article.id)}
                        locale={locale}
                      />
                    ))}
                  </div>
                </div>
              );
            })}

            {/* 未分類記事 */}
            {uncategorized.length > 0 && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="text-md font-semibold text-gray-900 dark:text-gray-200 mb-3">
                  {t("admin.topics.uncategorized")} ({uncategorized.length})
                </h4>
                
                <div className="space-y-3">
                  {uncategorized.map(article => (
                    <ArticleCategoryCard
                      key={article.id}
                      article={article}
                      mainCategories={MAIN_CATEGORIES}
                      subCategories={SUB_CATEGORIES}
                      onMainCategoryChange={handleMainCategoryChange}
                      onSubCategoryChange={handleSubCategoryChange}
                      onAutoCategori ze={() => autoCategorizeSingleArticle(article.id)}
                      locale={locale}
                    />
                  ))}
                </div>
              </div>
            )}
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
  onMainCategoryChange,
  onSubCategoryChange,
  onAutoCategorize,
  locale
}: {
  article: ArticleWithCategory;
  mainCategories: typeof MAIN_CATEGORIES;
  subCategories: typeof SUB_CATEGORIES;
  onMainCategoryChange: (articleId: string, categoryId: string) => void;
  onSubCategoryChange: (articleId: string, subCategoryId: string) => void;
  onAutoCategorize: () => void;
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
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap"
        >
          {t("admin.topics.autoCategorize")}
        </button>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        {article.source} | {new Date(article.publishedAt).toLocaleDateString()}
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t("admin.topics.mainCategory")}
          </label>
          <select
            value={article.mainCategory || ""}
            onChange={(e) => onMainCategoryChange(article.id, e.target.value)}
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
        
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t("admin.topics.subCategory")}
          </label>
          <select
            value={article.subCategory || ""}
            onChange={(e) => onSubCategoryChange(article.id, e.target.value)}
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