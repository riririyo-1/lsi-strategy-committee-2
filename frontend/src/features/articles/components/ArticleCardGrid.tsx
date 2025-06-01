"use client";

import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/features/i18n/hooks/useI18n";
import { Article } from "@/types/article";

interface ArticleCardGridProps {
  articles: Article[];
}

export default function ArticleCardGrid({ articles }: ArticleCardGridProps) {
  const { t } = useI18n();

  // 静的な日付フォーマット（サーバーとクライアント間で一貫性を持たせるため）
  const formatDate = (dateString: string) => {
    // ISOのYYYY-MM-DD部分のみを抽出（ブラウザ非依存）
    return dateString.split("T")[0];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article) => (
        <div
          key={article.id}
          className="bg-white dark:bg-[#2d3646] rounded-xl overflow-hidden shadow-lg hover:translate-y-[-4px] transition-all duration-300 hover:shadow-blue-900/20 hover:shadow-xl group border border-gray-200 dark:border-gray-700/30"
        >
          <div className="relative h-full flex flex-col">
            {article.thumbnailUrl && (
              <div className="relative h-52 w-full">
                <Image
                  src={article.thumbnailUrl}
                  alt={article.title}
                  fill
                  className="object-cover"
                  style={{ viewTransitionName: `article-image-${article.id}` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-3 right-3 bg-blue-600/90 text-xs text-white px-2 py-1 rounded-md backdrop-blur-sm">
                  {formatDate(article.publishedAt)}
                </div>
                <div className="absolute top-3 left-3 bg-gray-800/80 text-xs text-gray-300 px-2 py-1 rounded-md backdrop-blur-sm">
                  {article.source}
                </div>
              </div>
            )}
            <Link
              href={`/articles/${article.id}`}
              className="block flex-grow p-5"
            >
              <h3
                className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                style={{ viewTransitionName: `article-title-${article.id}` }}
              >
                {article.title}
              </h3>
              {!article.thumbnailUrl && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span className="inline-block mr-3">{article.source}</span>
                  <span>{formatDate(article.publishedAt)}</span>
                </p>
              )}
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
                {article.summary}
              </p>

              <div className="flex flex-wrap gap-2 mb-2">
                {article.labels.map((label) => (
                  <span
                    key={label}
                    className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-700/30"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </Link>

            <div className="p-3 pt-0 mt-auto border-t border-gray-200 dark:border-gray-700/50">
              <div className="flex justify-end">
                <a
                  href={article.articleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={t("articles.originalArticle")}
                  className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  aria-label={t("articles.originalArticle")}
                >
                  <span className="mr-1">{t("articles.originalArticle")}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
