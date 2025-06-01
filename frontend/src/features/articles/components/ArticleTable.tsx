"use client";

import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/features/i18n/hooks/useI18n";
import { Article } from "@/types/article";

interface ArticleTableProps {
  articles: Article[];
}

export default function ArticleTable({ articles }: ArticleTableProps) {
  const { t } = useI18n();
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // 同じカラムをクリックした場合は、ソート方向を反転
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // 異なるカラムをクリックした場合は、そのカラムで降順ソート
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  // ソート処理
  const sortedArticles = [...articles].sort((a, b) => {
    if (!sortColumn) return 0;

    let aValue: string | number;
    let bValue: string | number;

    switch (sortColumn) {
      case "title":
        aValue = a.title;
        bValue = b.title;
        break;
      case "source":
        aValue = a.source;
        bValue = b.source;
        break;
      case "date":
        aValue = new Date(a.publishedAt).getTime();
        bValue = new Date(b.publishedAt).getTime();
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // 静的な日付フォーマット（サーバーとクライアント間で一貫性を持たせるため）
  const formatDate = (dateString: string) => {
    // ISOのYYYY-MM-DD部分のみを抽出（ブラウザ非依存）
    return dateString.split("T")[0];
  };

  // ソートアイコン表示
  const renderSortIcon = (column: string) => {
    if (sortColumn !== column) return null;

    return sortDirection === "asc" ? (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 inline-block ml-1"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 15l7-7 7 7"
        />
      </svg>
    ) : (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 inline-block ml-1"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    );
  };

  return (
    <div className="overflow-x-auto rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-100 dark:bg-[#1d2433]">
          <tr>
            <th
              className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase cursor-pointer"
              onClick={() => handleSort("title")}
            >
              <span className="flex items-center">
                {t("articles.tableColumns.title")}
                {renderSortIcon("title")}
              </span>
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase cursor-pointer"
              onClick={() => handleSort("source")}
            >
              <span className="flex items-center">
                {t("articles.tableColumns.source")}
                {renderSortIcon("source")}
              </span>
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase cursor-pointer"
              onClick={() => handleSort("date")}
            >
              <span className="flex items-center">
                {t("articles.tableColumns.date")}
                {renderSortIcon("date")}
              </span>
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
              {t("articles.tableColumns.summary")}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
              {t("articles.tableColumns.labels")}
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase">
              <span className="sr-only">
                {t("articles.tableColumns.actions")}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.828 14.828a4 4 0 10-5.656-5.656l-4 4a4 4 0 105.656 5.656l1.102-1.101"
                />
              </svg>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-[#232b39] divide-y divide-gray-200 dark:divide-gray-700">
          {sortedArticles.map((article) => (
            <tr
              key={article.id}
              className="hover:bg-gray-50 dark:hover:bg-[#2a3547]"
            >
              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">
                <Link
                  href={`/articles/${article.id}`}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  style={{ viewTransitionName: `article-title-${article.id}` }}
                >
                  {article.title}
                </Link>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                {article.source}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                {formatDate(article.publishedAt)}
              </td>
              <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                {article.summary}
              </td>
              <td className="px-4 py-4">
                <div className="flex flex-wrap gap-1">
                  {article.labels.map((label) => (
                    <span
                      key={label}
                      className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                <a
                  href={article.articleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={t("articles.originalArticle")}
                  className="inline-flex items-center justify-center w-8 h-8 bg-gray-700/50 hover:bg-blue-600/60 text-gray-300 hover:text-white rounded-full transition-colors"
                  aria-label={t("articles.originalArticle")}
                >
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
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
