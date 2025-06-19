"use client";

import { useI18n } from "@/features/i18n/hooks/useI18n";
import { Article } from "@/types/article.d";
import { Button } from "@/components/ui/Button";

interface CategoryAssignerProps {
  selectedArticles: Article[];
  articlesWithCategories: Array<Article & { mainCategory?: string }>;
  monthlySummary: string;
  categories: Array<{ id: string; name: string }>;
  onSummaryChange: (summary: string) => void;
  onCategoryChange: (articleId: string, categoryId: string) => void;
  onGenerateSummary: () => void;
  onAutoCategorize: (articleId?: string) => void;
  isGeneratingSummary?: boolean;
  isCategorizingAll?: boolean;
  isCategorizingArticle?: string | null;
}

export default function CategoryAssigner({
  selectedArticles,
  articlesWithCategories,
  monthlySummary,
  categories,
  onSummaryChange,
  onCategoryChange,
  onGenerateSummary,
  onAutoCategorize,
  isGeneratingSummary = false,
  isCategorizingAll = false,
  isCategorizingArticle = null,
}: CategoryAssignerProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      {/* 月次まとめセクション */}
      <div className="bg-white dark:bg-[#2d3646] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">
            {t("admin.topics.monthlySummary")}
          </h3>
          <Button
            onClick={onGenerateSummary}
            disabled={isGeneratingSummary || selectedArticles.length === 0}
            variant="primary"
            isLoading={isGeneratingSummary}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md"
          >
            {t("admin.topics.aiGenerate")}
          </Button>
        </div>
        
        <textarea
          value={monthlySummary}
          onChange={(e) => onSummaryChange(e.target.value)}
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
            onClick={() => onAutoCategorize()}
            disabled={isCategorizingAll || selectedArticles.length === 0}
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
                categories={categories}
                onCategoryChange={onCategoryChange}
                onAutoCategorize={() => onAutoCategorize(article.id)}
                isCategorizing={isCategorizingArticle === article.id}
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
}: {
  article: Article & { mainCategory?: string };
  categories: Array<{ id: string; name: string }>;
  onCategoryChange: (articleId: string, categoryId: string) => void;
  onAutoCategorize: () => void;
  isCategorizing: boolean;
}) {
  const { t } = useI18n();

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