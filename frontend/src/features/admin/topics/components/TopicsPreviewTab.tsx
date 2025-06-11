"use client";

import { useState } from "react";
import { useI18n } from "@/features/i18n/hooks/useI18n";
import { useCategories } from "@/hooks/useCategories";
import { Article } from "@/types/article.d";
import { ArticleWithCategory } from "./TemplateGenerationTab";

interface TopicsPreviewTabProps {
  title: string;
  publishDate: string;
  monthlySummary: string;
  selectedArticles: Article[] | ArticleWithCategory[];
}

export default function TopicsPreviewTab({
  title,
  publishDate,
  monthlySummary,
  selectedArticles,
}: TopicsPreviewTabProps) {
  const { t } = useI18n();
  const { getCategoryName } = useCategories();

  const [isExporting, setIsExporting] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getArticlesByCategory = () => {
    const categorized: { [key: string]: ArticleWithCategory[] } = {};
    const uncategorized: ArticleWithCategory[] = [];

    // ArticleWithCategory型にキャスト
    const articlesWithCategory = selectedArticles as ArticleWithCategory[];

    articlesWithCategory.forEach((article) => {
      if ("mainCategory" in article && article.mainCategory) {
        const categoryName = getCategoryName(article.mainCategory);
        if (!categorized[categoryName]) {
          categorized[categoryName] = [];
        }
        categorized[categoryName].push(article);
      } else {
        uncategorized.push(article as ArticleWithCategory);
      }
    });

    // 未分類がある場合は追加
    if (uncategorized.length > 0) {
      const uncategorizedLabel = t("categories.uncategorized", { defaultValue: "未分類" });
      categorized[uncategorizedLabel] = uncategorized;
    }

    return categorized;
  };

  const handleExport = async () => {
    if (!title.trim()) {
      alert(t("admin.topics.enterTitleAlert", { defaultValue: "タイトルを入力してください" }));
      return;
    }

    if (selectedArticles.length === 0) {
      alert(t("admin.topics.selectArticlesAlert", { defaultValue: "記事を選択してください" }));
      return;
    }

    try {
      setIsExporting(true);

      // HTMLエクスポート
      const htmlContent = generateHTMLContent();
      const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.replace(/[^a-zA-Z0-9]/g, "_")}_${
        new Date().toISOString().split("T")[0]
      }.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export:", error);
      alert(t("admin.topics.exportFailedAlert", { defaultValue: "エクスポートに失敗しました" }));
    } finally {
      setIsExporting(false);
    }
  };

  const generateHTMLContent = () => {
    const groupedArticles = getArticlesByCategory();

    return `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
            color: #333;
        }
        .header {
            border-bottom: 2px solid #0066cc;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .title {
            font-size: 28px;
            font-weight: bold;
            color: #0066cc;
            margin-bottom: 10px;
        }
        .publish-date {
            font-size: 16px;
            color: #666;
        }
        .summary {
            background-color: #f8f9fa;
            padding: 20px;
            border-left: 4px solid #0066cc;
            margin-bottom: 30px;
        }
        .summary h2 {
            margin-top: 0;
            color: #0066cc;
        }
        .category-section {
            margin-bottom: 40px;
        }
        .category-title {
            font-size: 20px;
            font-weight: bold;
            color: #0066cc;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
            margin-bottom: 20px;
        }
        .article {
            margin-bottom: 25px;
            padding: 15px;
            border: 1px solid #e0e0e0;
            border-radius: 5px;
        }
        .article-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 8px;
        }
        .article-meta {
            font-size: 14px;
            color: #666;
            margin-bottom: 10px;
        }
        .article-subcategory {
            display: inline-block;
            background-color: #e0e0e0;
            color: #333;
            font-size: 12px;
            padding: 2px 8px;
            border-radius: 3px;
            margin-left: 10px;
        }
        .article-summary {
            font-size: 14px;
            line-height: 1.5;
            margin-bottom: 10px;
        }
        .article-labels {
            margin-bottom: 8px;
        }
        .label {
            display: inline-block;
            background-color: #e3f2fd;
            color: #1976d2;
            font-size: 12px;
            padding: 2px 8px;
            border-radius: 3px;
            margin-right: 5px;
            margin-bottom: 5px;
        }
        .article-url {
            font-size: 12px;
            margin-top: 8px;
        }
        .article-url a {
            color: #0066cc;
            text-decoration: none;
        }
        .article-url a:hover {
            text-decoration: underline;
        }
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 14px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">${title}</div>
        <div class="publish-date">発行日: ${formatDate(publishDate)}</div>
    </div>

    ${
      monthlySummary
        ? `
    <div class="summary">
        <h2>今月の概況</h2>
        <p>${monthlySummary.replace(/\n/g, "</p><p>")}</p>
    </div>
    `
        : ""
    }

    ${Object.entries(groupedArticles)
      .map(
        ([category, articles]) => `
    <div class="category-section">
        <div class="category-title">${category} (${articles.length}件)</div>
        ${articles
          .map(
            (article) => `
        <div class="article">
            <div class="article-title">${article.title}</div>
            <div class="article-meta">
                出典: ${article.source} | 
                公開日: ${formatDate(article.publishedAt)}
                ${
                  article.subCategory
                    ? `
                <span class="article-subcategory">${getCategoryName(
                  article.subCategory
                )}</span>
                `
                    : ""
                }
            </div>
            ${
              article.summary
                ? `
            <div class="article-summary">${article.summary}</div>
            `
                : ""
            }
        </div>
        `
          )
          .join("")}
    </div>
    `
      )
      .join("")}

    <div class="footer">
        <p>LSI戦略コミッティ TOPICS配信</p>
        <p>生成日時: ${new Date().toLocaleString("ja-JP")}</p>
    </div>
</body>
</html>
    `.trim();
  };

  const groupedArticles = getArticlesByCategory();

  return (
    <div className="space-y-6">
      {/* ダウンロードボタン */}
      <div className="flex justify-end">
        <button
          onClick={handleExport}
          disabled={
            isExporting || !title.trim() || selectedArticles.length === 0
          }
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md"
        >
          {isExporting ? t("admin.topics.exporting") : t("common.download")}
        </button>
      </div>

      {/* プレビュー表示 */}
      <div className="bg-white rounded-xl shadow-lg p-8 text-gray-900">
        {/* ヘッダー */}
        <div className="border-b-2 border-blue-600 pb-6 mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">
            {title || t("admin.topics.titleNotSet")}
          </h1>
          <p className="text-gray-600">
            {t("admin.topics.publishDate")}: {formatDate(publishDate)}
          </p>
        </div>

        {/* 月次まとめ */}
        {monthlySummary && (
          <div className="bg-gray-50 border-l-4 border-blue-600 p-6 mb-8">
            <h2 className="text-xl font-semibold text-blue-600 mb-4">
              {t("admin.topics.monthlyOverview")}
            </h2>
            <div className="whitespace-pre-wrap text-gray-700">
              {monthlySummary}
            </div>
          </div>
        )}

        {/* 記事一覧 */}
        {selectedArticles.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>{t("admin.topics.noArticlesSelected")}</p>
            <p className="text-sm">{t("admin.topics.selectArticlesHint")}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedArticles).map(([category, articles]) => (
              <div
                key={category}
                className="border-b border-gray-200 pb-6 last:border-0"
              >
                <h2 className="text-xl font-semibold text-blue-600 border-b border-gray-300 pb-2 mb-6">
                  {category} ({articles.length}件)
                </h2>

                <div className="space-y-6">
                  {articles.map((article) => (
                    <div
                      key={article.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {article.title}
                      </h3>

                      <p className="text-sm text-gray-600 mb-3">
                        {t("admin.topics.source")}: {article.source} |
                        {t("admin.topics.publishedDate")}:{" "}
                        {formatDate(article.publishedAt)}
                        {article.subCategory && (
                          <span className="ml-2 inline-block bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">
                            {getCategoryName(article.subCategory)}
                          </span>
                        )}
                      </p>

                      {article.summary && (
                        <p className="text-gray-700 mb-3 leading-relaxed">
                          {article.summary}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* フッター */}
        <div className="mt-12 pt-6 border-t border-gray-200 text-center text-gray-500">
          <p>LSI戦略コミッティ TOPICS配信</p>
          <p className="text-sm">
            {t("admin.topics.generatedAt")}:{" "}
            {new Date().toLocaleString("ja-JP")}
          </p>
        </div>
      </div>
    </div>
  );
}
