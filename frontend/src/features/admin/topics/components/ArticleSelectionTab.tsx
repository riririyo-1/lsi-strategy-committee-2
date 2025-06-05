"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/features/i18n/hooks/useI18n";
import { Article } from "@/types/article.d";
import { articlesApi } from "@/lib/apiClient";
import ArticleTable from "@/features/articles/components/ArticleTable";
import ViewToggle from "@/features/articles/components/ViewToggle";

interface ArticleSelectionTabProps {
  selectedArticles: Article[];
  onSelectedArticlesChange: (articles: Article[]) => void;
}

export default function ArticleSelectionTab({
  selectedArticles,
  onSelectedArticlesChange,
}: ArticleSelectionTabProps) {
  const { t } = useI18n();
  
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkedArticles, setCheckedArticles] = useState<Set<string>>(new Set());
  
  // フィルター状態
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [labelTags, setLabelTags] = useState<string[]>([]);
  const [labelInput, setLabelInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  
  // 表示モード
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [selectedViewMode, setSelectedViewMode] = useState<"card" | "table">("card");

  // 初期データ読み込み
  useEffect(() => {
    loadArticles();
  }, []);

  // フィルター適用
  useEffect(() => {
    applyFilters();
  }, [allArticles, startDate, endDate, labelTags, searchQuery, sourceFilter]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const response = await articlesApi.getAll();
      setAllArticles(response.data);
    } catch (error) {
      console.error("Failed to load articles:", error);
      alert(t("admin.topics.articleLoadError"));
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allArticles];

    // 日付フィルター
    if (startDate) {
      filtered = filtered.filter(article => 
        new Date(article.publishedAt) >= new Date(startDate)
      );
    }
    if (endDate) {
      filtered = filtered.filter(article => 
        new Date(article.publishedAt) <= new Date(endDate)
      );
    }

    // ラベルフィルター（複数ラベルのAND検索）
    if (labelTags.length > 0) {
      filtered = filtered.filter(article =>
        labelTags.every(tag =>
          article.labels?.some(label => 
            label.toLowerCase().includes(tag.toLowerCase())
          )
        )
      );
    }

    // 検索クエリ
    if (searchQuery) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.summary?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // ソースフィルター
    if (sourceFilter) {
      filtered = filtered.filter(article =>
        article.source.toLowerCase().includes(sourceFilter.toLowerCase())
      );
    }

    // 選択済み記事を除外
    filtered = filtered.filter(article =>
      !selectedArticles.some(selected => selected.id === article.id)
    );

    setFilteredArticles(filtered);
  };

  const handleLabelKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && labelInput.trim()) {
      e.preventDefault();
      if (!labelTags.includes(labelInput.trim())) {
        setLabelTags([...labelTags, labelInput.trim()]);
      }
      setLabelInput("");
    }
  };

  const removeLabel = (labelToRemove: string) => {
    setLabelTags(labelTags.filter(label => label !== labelToRemove));
  };

  const handleAddCheckedArticles = () => {
    const articlesToAdd = allArticles.filter(article => 
      checkedArticles.has(article.id) && 
      !selectedArticles.some(selected => selected.id === article.id)
    );
    onSelectedArticlesChange([...selectedArticles, ...articlesToAdd]);
    setCheckedArticles(new Set());
  };

  const handleRemoveArticle = (articleId: string) => {
    onSelectedArticlesChange(
      selectedArticles.filter(article => article.id !== articleId)
    );
  };

  const handleClearSelection = () => {
    if (confirm(t("admin.topics.clearSelectionConfirm"))) {
      onSelectedArticlesChange([]);
    }
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setLabelTags([]);
    setLabelInput("");
    setSearchQuery("");
    setSourceFilter("");
  };

  const handleCheckArticle = (articleId: string) => {
    const newChecked = new Set(checkedArticles);
    if (newChecked.has(articleId)) {
      newChecked.delete(articleId);
    } else {
      newChecked.add(articleId);
    }
    setCheckedArticles(newChecked);
  };

  const handleCheckAll = () => {
    if (checkedArticles.size === filteredArticles.length) {
      setCheckedArticles(new Set());
    } else {
      setCheckedArticles(new Set(filteredArticles.map(a => a.id)));
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-2 text-gray-600 dark:text-gray-400">{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* 左側: 記事データベース */}
        <div className="xl:col-span-5">
          <div className="bg-white dark:bg-[#2d3646] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">
                {t("admin.topics.articleDatabase")}
              </h3>
              <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
            </div>

            {/* フィルター */}
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("admin.topics.startDate")}
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#3a4553] text-gray-900 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("admin.topics.endDate")}
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#3a4553] text-gray-900 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("admin.topics.labelFilter")}
                </label>
                <input
                  type="text"
                  value={labelInput}
                  onChange={(e) => setLabelInput(e.target.value)}
                  onKeyPress={handleLabelKeyPress}
                  placeholder={t("admin.topics.labelFilterPlaceholder")}
                  className="w-full px-3 py-2 bg-white dark:bg-[#3a4553] text-gray-900 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors"
                />
                {labelTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {labelTags.map((label) => (
                      <span
                        key={label}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                      >
                        {label}
                        <button
                          onClick={() => removeLabel(label)}
                          className="ml-2 hover:text-blue-600 dark:hover:text-blue-100"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("admin.topics.source")}
                  </label>
                  <input
                    type="text"
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value)}
                    placeholder={t("admin.topics.sourcePlaceholder")}
                    className="w-full px-3 py-2 bg-white dark:bg-[#3a4553] text-gray-900 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("admin.topics.search")}
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("admin.topics.searchPlaceholder")}
                    className="w-full px-3 py-2 bg-white dark:bg-[#3a4553] text-gray-900 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("admin.topics.foundArticles", { count: filteredArticles.length })}
                </p>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  {t("admin.topics.clearFilters")}
                </button>
              </div>
            </div>

            {/* 全選択チェックボックス */}
            <div className="flex items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <input
                type="checkbox"
                checked={filteredArticles.length > 0 && checkedArticles.size === filteredArticles.length}
                onChange={handleCheckAll}
                className="w-4 h-4 text-blue-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                {t("admin.topics.selectAll")}
              </label>
            </div>

            {/* 記事一覧 - チェックボックス付き */}
            {filteredArticles.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>{t("admin.topics.noArticlesFound")}</p>
                <p className="text-sm mt-1">{t("admin.topics.adjustFilters")}</p>
              </div>
            ) : viewMode === "card" ? (
              <div className="grid grid-cols-1 gap-4">
                {filteredArticles.map((article) => (
                  <div key={article.id} className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#3a4553] rounded-lg hover:shadow-sm transition-shadow">
                    <input
                      type="checkbox"
                      checked={checkedArticles.has(article.id)}
                      onChange={() => handleCheckArticle(article.id)}
                      className="mt-1 w-4 h-4 text-blue-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-gray-200 line-clamp-2 mb-2">
                        {article.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {article.source} | {new Date(article.publishedAt).toLocaleDateString()}
                      </p>
                      {article.summary && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-2">
                          {article.summary}
                        </p>
                      )}
                      {article.labels && article.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {article.labels.slice(0, 3).map((label, index) => (
                            <span key={index} className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full">
                              {label}
                            </span>
                          ))}
                          {article.labels.length > 3 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">+{article.labels.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <ArticleTable 
                  articles={filteredArticles}
                  showCheckbox={true}
                  checkedArticles={checkedArticles}
                  onCheckArticle={handleCheckArticle}
                />
              </div>
            )}
          </div>
        </div>

        {/* 中央: 移動ボタン */}
        <div className="xl:col-span-2 flex xl:flex-col justify-center items-center gap-4 my-8 xl:my-0">
          <button
            onClick={handleAddCheckedArticles}
            disabled={checkedArticles.size === 0}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-4 rounded-full shadow-lg transition-all transform hover:scale-110 disabled:hover:scale-100"
            title={t("admin.topics.addSelected")}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
            onClick={handleClearSelection}
            disabled={selectedArticles.length === 0}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-4 rounded-full shadow-lg transition-all transform hover:scale-110 disabled:hover:scale-100"
            title={t("admin.topics.clearSelection")}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 右側: 選択済み記事リスト */}
        <div className="xl:col-span-5">
          <div className="bg-white dark:bg-[#2d3646] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">
                {t("admin.topics.selectedArticles", { count: selectedArticles.length })}
              </h3>
              <ViewToggle viewMode={selectedViewMode} onViewModeChange={setSelectedViewMode} />
            </div>

            {selectedArticles.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-2">{t("admin.topics.noArticlesSelected")}</p>
                <p className="text-sm mt-1">{t("admin.topics.selectArticlesHint")}</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {selectedViewMode === "card" ? (
                  selectedArticles.map((article) => (
                    <div key={article.id} className="bg-gray-50 dark:bg-[#3a4553] rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0 mr-4">
                          <h4 className="font-medium text-gray-900 dark:text-gray-200 line-clamp-2">{article.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {article.source} | {new Date(article.publishedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveArticle(article.id)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1"
                          title={t("admin.topics.removeArticle")}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <table className="w-full">
                    <tbody>
                      {selectedArticles.map((article) => (
                        <tr key={article.id} className="border-b border-gray-200 dark:border-gray-700">
                          <td className="py-3">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-200 line-clamp-1">{article.title}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {article.source} | {new Date(article.publishedAt).toLocaleDateString()}
                            </p>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => handleRemoveArticle(article.id)}
                              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1"
                              title={t("admin.topics.removeArticle")}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}