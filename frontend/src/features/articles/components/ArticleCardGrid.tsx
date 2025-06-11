"use client";

import { useI18n } from "@/features/i18n/hooks/useI18n";
import { Article } from "@/types/article";
import { Card } from "@/components/common/Card";

interface ArticleCardGridProps {
  articles: Article[];
  showCheckboxes?: boolean;
  selectedArticles?: Set<string>;
  onSelectArticle?: (articleId: string) => void;
}

export default function ArticleCardGrid({ 
  articles, 
  showCheckboxes = false,
  selectedArticles = new Set(),
  onSelectArticle 
}: ArticleCardGridProps) {
  const { t } = useI18n();

  // 静的な日付フォーマット（サーバーとクライアント間で一貫性を持たせるため）
  const formatDate = (dateString: string) => {
    // ISOのYYYY-MM-DD部分のみを抽出（ブラウザ非依存）
    return dateString.split("T")[0];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article) => (
        <Card
          key={article.id}
          variant="article"
          colorTheme="article"
          title={article.title.length > 25 ? `${article.title.substring(0, 25)}...` : article.title}
          summary={article.summary}
          metadata={[
            { label: "", value: `${article.source} | ${formatDate(article.publishedAt)}` }
          ]}
          labels={article.labels}
          imageUrl={article.thumbnailUrl || ""}
          imageAlt={article.title}
          showCheckbox={showCheckboxes}
          isSelected={selectedArticles.has(article.id)}
          onSelect={() => onSelectArticle?.(article.id)}
          linkHref={`/articles/${article.id}`}
          actions={[
            {
              label: t("articles.originalArticle"),
              href: article.articleUrl
            }
          ]}
        />
      ))}
    </div>
  );
}
