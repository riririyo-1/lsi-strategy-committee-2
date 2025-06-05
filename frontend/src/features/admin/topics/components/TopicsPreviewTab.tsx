"use client";

import { useState } from "react";
import { useI18n } from "@/features/i18n/hooks/useI18n";
import { Article } from "@/types/article.d";
import { pipelineTopicsApi, topicsApi } from "@/lib/apiClient";

interface TopicsPreviewTabProps {
  title: string;
  publishDate: string;
  monthlySummary: string;
  selectedArticles: Article[];
}

export default function TopicsPreviewTab({
  title,
  publishDate,
  monthlySummary,
  selectedArticles,
}: TopicsPreviewTabProps) {
  const { t } = useI18n();
  
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<"html" | "pdf">("html");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getArticlesByCategory = () => {
    // 実際にはTemplateGenerationTabからカテゴリ情報を受け取る必要がある
    // 今回は簡易実装として、ソース別にグループ化
    const grouped: { [key: string]: Article[] } = {};
    
    selectedArticles.forEach(article => {
      const key = article.source || "その他";
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(article);
    });
    
    return grouped;
  };

  const handleExport = async () => {
    if (!title.trim()) {
      alert("タイトルを入力してください");
      return;
    }

    if (selectedArticles.length === 0) {
      alert("記事を選択してください");
      return;
    }

    try {
      setIsExporting(true);
      
      // Pipeline API を使用してHTMLエクスポート
      const response = await pipelineTopicsApi.export({
        topic_id: "preview", // プレビュー用の仮ID
        format_type: exportFormat
      });

      // HTMLをダウンロード
      if (exportFormat === "html") {
        const htmlContent = generateHTMLContent();
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      
    } catch (error) {
      console.error("Failed to export:", error);
      alert("エクスポートに失敗しました");
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
        .article-summary {
            font-size: 14px;
            line-height: 1.5;
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

    ${monthlySummary ? `
    <div class="summary">
        <h2>今月の概況</h2>
        <p>${monthlySummary.replace(/\n/g, '</p><p>')}</p>
    </div>
    ` : ''}

    ${Object.entries(groupedArticles).map(([category, articles]) => `
    <div class="category-section">
        <div class="category-title">${category} (${articles.length}件)</div>
        ${articles.map(article => `
        <div class="article">
            <div class="article-title">${article.title}</div>
            <div class="article-meta">
                出典: ${article.source} | 
                公開日: ${formatDate(article.publishedAt)}
            </div>
            ${article.summary ? `
            <div class="article-summary">${article.summary}</div>
            ` : ''}
            <div class="article-url">
                <a href="${article.articleUrl}" target="_blank">元記事を見る</a>
            </div>
        </div>
        `).join('')}
    </div>
    `).join('')}

    <div class="footer">
        <p>LSI戦略コミッティ TOPICS配信</p>
        <p>生成日時: ${new Date().toLocaleString('ja-JP')}</p>
    </div>
</body>
</html>
    `.trim();
  };

  const groupedArticles = getArticlesByCategory();

  return (
    <div className="space-y-6">
      {/* エクスポートコントロール */}
      <div className="bg-[#2d3646] rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-200">エクスポート</h3>
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">形式</label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as "html" | "pdf")}
                className="px-3 py-2 bg-[#3a4553] text-gray-200 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              >
                <option value="html">HTML</option>
                <option value="pdf">PDF</option>
              </select>
            </div>
            <button
              onClick={handleExport}
              disabled={isExporting || !title.trim() || selectedArticles.length === 0}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded transition-colors"
            >
              {isExporting ? "エクスポート中..." : "ダウンロード"}
            </button>
          </div>
        </div>
        
        <p className="text-sm text-gray-400">
          TOPICSをHTML形式またはPDF形式でダウンロードできます。
        </p>
      </div>

      {/* プレビュー表示 */}
      <div className="bg-white rounded-lg shadow-lg p-8 text-gray-900">
        {/* ヘッダー */}
        <div className="border-b-2 border-blue-600 pb-6 mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">
            {title || "タイトル未設定"}
          </h1>
          <p className="text-gray-600">
            発行日: {formatDate(publishDate)}
          </p>
        </div>

        {/* 月次まとめ */}
        {monthlySummary && (
          <div className="bg-gray-50 border-l-4 border-blue-600 p-6 mb-8">
            <h2 className="text-xl font-semibold text-blue-600 mb-4">今月の概況</h2>
            <div className="whitespace-pre-wrap text-gray-700">
              {monthlySummary}
            </div>
          </div>
        )}

        {/* 記事一覧 */}
        {selectedArticles.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>記事が選択されていません</p>
            <p className="text-sm">記事選択タブで記事を選択してください</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedArticles).map(([category, articles]) => (
              <div key={category} className="border-b border-gray-200 pb-6">
                <h2 className="text-xl font-semibold text-blue-600 border-b border-gray-300 pb-2 mb-6">
                  {category} ({articles.length}件)
                </h2>
                
                <div className="space-y-6">
                  {articles.map((article) => (
                    <div key={article.id} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {article.title}
                      </h3>
                      
                      <p className="text-sm text-gray-600 mb-3">
                        出典: {article.source} | 公開日: {formatDate(article.publishedAt)}
                      </p>
                      
                      {article.summary && (
                        <p className="text-gray-700 mb-3 leading-relaxed">
                          {article.summary}
                        </p>
                      )}
                      
                      {article.labels && article.labels.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {article.labels.map((label, index) => (
                            <span
                              key={index}
                              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="text-sm">
                        <a
                          href={article.articleUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          元記事を見る →
                        </a>
                      </div>
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
          <p className="text-sm">生成日時: {new Date().toLocaleString('ja-JP')}</p>
        </div>
      </div>
    </div>
  );
}