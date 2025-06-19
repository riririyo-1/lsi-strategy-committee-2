"use client";

import { useI18n } from "@/features/i18n/hooks/useI18n";
import { Article } from "@/types/article";
import { Card } from "@/components/ui/Card";

interface ArticleCardGridProps {
  articles: Article[];
  showCheckboxes?: boolean;
  selectedArticles?: Set<string> | Article[];
  onSelectArticle?: (articleId: string) => void;
  showSelectButton?: boolean;
  onToggleSelect?: (article: Article) => void;
}

export default function ArticleCardGrid({
  articles,
  showCheckboxes = false,
  selectedArticles = new Set(),
  onSelectArticle,
  showSelectButton = false,
  onToggleSelect,
}: ArticleCardGridProps) {
  const { t } = useI18n();

  // 静的な日付フォーマット（サーバーとクライアント間で一貫性を持たせるため）
  const formatDate = (dateString: string) => {
    // ISOのYYYY-MM-DD部分のみを抽出（ブラウザ非依存）
    return dateString.split("T")[0];
  };

  // 記事が選択済みかどうかを判定
  const isArticleSelected = (articleId: string): boolean => {
    if (Array.isArray(selectedArticles)) {
      return selectedArticles.some((article) => article.id === articleId);
    } else {
      return selectedArticles.has(articleId);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article) => {
        const isSelected = isArticleSelected(article.id);
        return (
          <div key={article.id} className="relative h-full">
            <Card
              variant="article"
              colorTheme={isSelected ? "selected" : "article"}
              title={
                article.title.length > 25
                  ? `${article.title.substring(0, 25)}...`
                  : article.title
              }
              summary={article.summary}
              metadata={[
                {
                  label: "",
                  value: `${article.source} | ${formatDate(
                    article.publishedAt
                  )}`,
                },
              ]}
              labels={article.labels}
              imageUrl={article.thumbnailUrl || ""}
              imageAlt={article.title}
              showCheckbox={showCheckboxes}
              isSelected={isSelected}
              onSelect={() => onSelectArticle?.(article.id)}
              linkHref={
                showSelectButton ? undefined : `/articles/${article.id}`
              }
              className={`h-full ${
                isSelected
                  ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : ""
              }`}
              actions={[
                {
                  label: t("articles.originalArticle"),
                  href: article.articleUrl,
                },
              ]}
            />

            {/* 選択ボタン */}
            {showSelectButton && onToggleSelect && (
              <button
                onClick={() => onToggleSelect(article)}
                className={`absolute top-4 right-4 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 z-10 ${
                  isSelected
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {isSelected ? (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {t("admin.topics.added")}
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    {t("admin.topics.addToList")}
                  </>
                )}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
