"use client";

import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/features/i18n/hooks/useI18n";
import { Article } from "@/types/article";

interface ArticleTableProps {
  articles: Article[];
  showCheckbox?: boolean;
  checkedArticles?: Set<string>;
  onCheckArticle?: (articleId: string) => void;
  onDelete?: (articleId: string) => void;
}

export default function ArticleTable({ 
  articles, 
  showCheckbox = false,
  checkedArticles = new Set(),
  onCheckArticle,
  onDelete
}: ArticleTableProps) {
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
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 table-auto" style={{ tableLayout: 'auto' }}>
        <thead className="bg-gray-100 dark:bg-[#1d2433]">
          <tr>
            {showCheckbox && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                <input
                  type="checkbox"
                  checked={articles.length > 0 && articles.every(a => checkedArticles.has(a.id))}
                  onChange={() => {
                    if (onCheckArticle) {
                      if (articles.every(a => checkedArticles.has(a.id))) {
                        // 全選択解除
                        articles.forEach(a => onCheckArticle(a.id));
                      } else {
                        // 全選択
                        articles.forEach(a => {
                          if (!checkedArticles.has(a.id)) {
                            onCheckArticle(a.id);
                          }
                        });
                      }
                    }
                  }}
                  className="w-4 h-4 text-blue-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
                />
              </th>
            )}
            <th
              className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase cursor-pointer resize-x overflow-hidden min-w-0"
              onClick={() => handleSort("date")}
              style={{ width: '10%', minWidth: '90px' }}
            >
              <span className="flex items-center">
                {t("articles.tableColumns.date")}
                {renderSortIcon("date")}
              </span>
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase cursor-pointer resize-x overflow-hidden min-w-0"
              onClick={() => handleSort("title")}
              style={{ width: '28%', minWidth: '180px' }}
            >
              <span className="flex items-center">
                {t("articles.tableColumns.title")}
                {renderSortIcon("title")}
              </span>
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase cursor-pointer resize-x overflow-hidden min-w-0"
              onClick={() => handleSort("source")}
              style={{ width: '12%', minWidth: '100px' }}
            >
              <span className="flex items-center">
                {t("articles.tableColumns.source")}
                {renderSortIcon("source")}
              </span>
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase resize-x overflow-hidden min-w-0" style={{ width: '25%', minWidth: '150px' }}>
              {t("articles.tableColumns.summary")}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase resize-x overflow-hidden min-w-0" style={{ width: '19%', minWidth: '120px' }}>
              {t("articles.tableColumns.labels")}
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase" style={{ width: '6%', minWidth: '60px' }}>
              リンク
            </th>
            {onDelete && (
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase">
                <span className="sr-only">削除</span>
                <svg className="h-4 w-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-[#232b39] divide-y divide-gray-200 dark:divide-gray-700">
          {sortedArticles.map((article) => (
            <tr
              key={article.id}
              className="hover:bg-gray-50 dark:hover:bg-[#2a3547]"
            >
              {showCheckbox && (
                <td className="px-4 py-4 whitespace-nowrap text-sm">
                  <input
                    type="checkbox"
                    checked={checkedArticles.has(article.id)}
                    onChange={() => onCheckArticle?.(article.id)}
                    className="w-4 h-4 text-blue-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </td>
              )}
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {formatDate(article.publishedAt)}
              </td>
              <td className="px-4 py-4 text-sm font-medium text-gray-800 dark:text-gray-200">
                <Link
                  href={`/articles/${article.id}`}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors block"
                  style={{ viewTransitionName: `article-title-${article.id}` }}
                  title={article.title}
                >
                  {article.title}
                </Link>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                {article.source}
              </td>
              <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
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
              {onDelete && (
                <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                  <button
                    onClick={() => onDelete(article.id)}
                    title="削除"
                    className="inline-flex items-center justify-center w-8 h-8 bg-red-600/50 hover:bg-red-600 text-red-300 hover:text-white rounded-full transition-colors"
                    aria-label="削除"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
