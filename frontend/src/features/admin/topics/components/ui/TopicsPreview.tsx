"use client";

import { useState } from "react";
import { useI18n } from "@/features/i18n/hooks/useI18n";
import { Article } from "@/types/article.d";
import { Button } from "@/components/ui/Button";

type ViewMode = 'table' | 'card' | 'preview' | '3d';

interface TopicsPreviewProps {
  title: string;
  publishDate: string;
  monthlySummary: string;
  selectedArticles: Array<Article & { mainCategory?: string }>;
  onExport: (format: 'html' | 'pdf' | 'json') => void;
  isExporting?: boolean;
}

export default function TopicsPreview({
  title,
  publishDate,
  monthlySummary,
  selectedArticles,
  onExport,
  isExporting = false,
}: TopicsPreviewProps) {
  const { t } = useI18n();
  const [viewMode, setViewMode] = useState<ViewMode>('preview');

  // カテゴリ別に記事をグループ化
  const groupedArticles = selectedArticles.reduce((groups, article) => {
    const category = article.mainCategory || 'uncategorized';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(article);
    return groups;
  }, {} as Record<string, typeof selectedArticles>);

  // カテゴリ名の表示用マッピング
  const getCategoryDisplayName = (categoryId: string) => {
    const categoryNames: Record<string, string> = {
      political: '政治',
      economical: '経済',
      social: '社会',
      technological: '技術',
      uncategorized: 'その他'
    };
    return categoryNames[categoryId] || categoryId;
  };

  const viewModes: Array<{ id: ViewMode; name: string; description: string }> = [
    { id: 'table', name: 'テーブル表示', description: '記事を表形式で一覧表示' },
    { id: 'card', name: 'カード表示', description: '記事をカード形式で視覚的に表示' },
    { id: 'preview', name: 'プレビュー表示', description: 'TOPICSの完成形をプレビュー' },
    { id: '3d', name: '立体表示', description: '記事間の関連性を立体的に可視化（準備中）' }
  ];

  const renderContent = () => {
    switch (viewMode) {
      case 'table':
        return <TableView groupedArticles={groupedArticles} getCategoryDisplayName={getCategoryDisplayName} />;
      case 'card':
        return <CardView groupedArticles={groupedArticles} getCategoryDisplayName={getCategoryDisplayName} />;
      case '3d':
        return <ThreeDView />;
      case 'preview':
      default:
        return (
          <PreviewView
            title={title}
            publishDate={publishDate}
            monthlySummary={monthlySummary}
            groupedArticles={groupedArticles}
            getCategoryDisplayName={getCategoryDisplayName}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー（表示モード切替・エクスポート） */}
      <div className="bg-white dark:bg-[#2d3646] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          {/* 表示モード切替 */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-3">
              表示モード
            </h3>
            <div className="flex flex-wrap gap-2">
              {viewModes.map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id)}
                  disabled={mode.id === '3d'}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === mode.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : mode.id === '3d'
                        ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 dark:bg-[#3a4553] text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-[#404553]'
                  }`}
                  title={mode.description}
                >
                  {mode.name}
                </button>
              ))}
            </div>
          </div>

          {/* エクスポートボタン */}
          <div className="flex gap-2">
            <Button
              onClick={() => onExport('html')}
              disabled={isExporting}
              variant="outline"
              className="text-sm"
            >
              HTML
            </Button>
            <Button
              onClick={() => onExport('json')}
              disabled={isExporting}
              variant="outline"
              className="text-sm"
            >
              JSON
            </Button>
            <Button
              onClick={() => onExport('pdf')}
              disabled={true}
              variant="outline"
              className="text-sm"
              title="PDF形式は準備中です"
            >
              PDF
            </Button>
          </div>
        </div>
      </div>

      {/* コンテンツ表示エリア */}
      <div className="bg-white dark:bg-[#2d3646] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        {renderContent()}
      </div>
    </div>
  );
}

// プレビュー表示コンポーネント
function PreviewView({
  title,
  publishDate,
  monthlySummary,
  groupedArticles,
  getCategoryDisplayName
}: {
  title: string;
  publishDate: string;
  monthlySummary: string;
  groupedArticles: Record<string, Array<Article & { mainCategory?: string }>>;
  getCategoryDisplayName: (categoryId: string) => string;
}) {
  return (
    <div className="p-8">
      {/* TOPICSヘッダー */}
      <div className="text-center mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-200 mb-2">
          {title || "TOPICS タイトル"}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {publishDate ? new Date(publishDate).toLocaleDateString('ja-JP') : "公開日未設定"}
        </p>
      </div>

      {/* 月次サマリー */}
      {monthlySummary && (
        <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">
            月次まとめ
          </h2>
          <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
            {monthlySummary}
          </div>
        </div>
      )}

      {/* カテゴリ別記事一覧 */}
      <div className="space-y-8">
        {Object.entries(groupedArticles).map(([categoryId, articles]) => (
          <div key={categoryId}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-200 mb-4 pb-2 border-b-2 border-blue-500">
              {getCategoryDisplayName(categoryId)} ({articles.length}件)
            </h2>
            <div className="grid gap-4">
              {articles.map(article => (
                <div
                  key={article.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-sm transition-shadow"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-gray-200 mb-2">
                    {article.title}
                  </h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {article.source} • {new Date(article.publishedAt).toLocaleDateString('ja-JP')}
                  </div>
                  {article.summary && (
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      {article.summary}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// テーブル表示コンポーネント
function TableView({
  groupedArticles,
  getCategoryDisplayName
}: {
  groupedArticles: Record<string, Array<Article & { mainCategory?: string }>>;
  getCategoryDisplayName: (categoryId: string) => string;
}) {
  return (
    <div className="p-6">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left p-3 font-semibold text-gray-900 dark:text-gray-200">カテゴリ</th>
              <th className="text-left p-3 font-semibold text-gray-900 dark:text-gray-200">タイトル</th>
              <th className="text-left p-3 font-semibold text-gray-900 dark:text-gray-200">ソース</th>
              <th className="text-left p-3 font-semibold text-gray-900 dark:text-gray-200">公開日</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedArticles).map(([categoryId, articles]) =>
              articles.map(article => (
                <tr key={article.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#3a4553]">
                  <td className="p-3 text-sm font-medium text-blue-600 dark:text-blue-400">
                    {getCategoryDisplayName(categoryId)}
                  </td>
                  <td className="p-3 text-sm text-gray-900 dark:text-gray-200">
                    {article.title}
                  </td>
                  <td className="p-3 text-sm text-gray-600 dark:text-gray-400">
                    {article.source}
                  </td>
                  <td className="p-3 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(article.publishedAt).toLocaleDateString('ja-JP')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// カード表示コンポーネント
function CardView({
  groupedArticles,
  getCategoryDisplayName
}: {
  groupedArticles: Record<string, Array<Article & { mainCategory?: string }>>;
  getCategoryDisplayName: (categoryId: string) => string;
}) {
  return (
    <div className="p-6 space-y-8">
      {Object.entries(groupedArticles).map(([categoryId, articles]) => (
        <div key={categoryId}>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-200 mb-4">
            {getCategoryDisplayName(categoryId)} ({articles.length}件)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map(article => (
              <div
                key={article.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow bg-white dark:bg-[#3a4553]"
              >
                <h4 className="font-semibold text-gray-900 dark:text-gray-200 mb-2 line-clamp-2">
                  {article.title}
                </h4>
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  {article.source} • {new Date(article.publishedAt).toLocaleDateString('ja-JP')}
                </div>
                {article.summary && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                    {article.summary}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// 3D表示コンポーネント（プレースホルダー）
function ThreeDView() {
  return (
    <div className="p-12 text-center">
      <div className="inline-flex items-center justify-center w-24 h-24 mb-4 bg-gray-100 dark:bg-gray-700 rounded-full">
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-2">
        3D表示機能
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        記事間の関連性を立体的に可視化する機能です。
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-500">
        現在開発中です。しばらくお待ちください。
      </p>
    </div>
  );
}