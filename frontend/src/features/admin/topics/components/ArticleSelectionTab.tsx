"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/features/i18n/hooks/useI18n";
import { Article } from "@/types/article.d";
import { articlesApi } from "@/lib/apiClient";
import ArticleTable from "@/features/articles/components/ArticleTable";
import { ViewToggle } from "@/components/common";
import Pagination from "@/components/common/Pagination";
import ArticleSearchFilters from "@/components/common/ArticleSearchFilters";
import type { ArticleSearchFilters as ArticleSearchFiltersType } from "@/components/common/ArticleSearchFilters";
import { Card } from "@/components/common/Card";

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
  const [appliedFilters, setAppliedFilters] = useState<ArticleSearchFiltersType>({
    startDate: "",
    endDate: "",
    labelTags: [],
    searchQuery: "",
    sourceFilter: ""
  });
  
  // 表示モード
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [selectedViewMode, setSelectedViewMode] = useState<"card" | "table">("card");
  
  // ページネーション
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12); // カード表示の場合は12件、テーブル表示の場合は10件
  const [paginatedArticles, setPaginatedArticles] = useState<Article[]>([]);
  
  // 選択済み記事用の状態
  const [selectedCurrentPage, setSelectedCurrentPage] = useState(1);
  const [selectedSearch, setSelectedSearch] = useState("");
  const [filteredSelectedArticles, setFilteredSelectedArticles] = useState<Article[]>([]);

  // 初期データ読み込み
  useEffect(() => {
    loadArticles();
  }, []);

  // フィルター適用
  useEffect(() => {
    applyFilters();
  }, [allArticles, appliedFilters]);

  // ページネーション適用
  useEffect(() => {
    applyPagination();
  }, [filteredArticles, currentPage, viewMode]);

  // フィルター変更時はページを1にリセット
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedFilters]);
  
  // 選択済み記事のフィルタリング
  useEffect(() => {
    const filtered = selectedArticles.filter(article => {
      if (!selectedSearch) return true;
      const searchLower = selectedSearch.toLowerCase();
      return (
        article.title.toLowerCase().includes(searchLower) ||
        article.summary?.toLowerCase().includes(searchLower) ||
        article.source?.toLowerCase().includes(searchLower) ||
        article.labels?.some(label => label.toLowerCase().includes(searchLower))
      );
    });
    setFilteredSelectedArticles(filtered);
    setSelectedCurrentPage(1);
  }, [selectedArticles, selectedSearch]);

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
    if (appliedFilters.startDate) {
      filtered = filtered.filter(article => 
        new Date(article.publishedAt) >= new Date(appliedFilters.startDate)
      );
    }
    if (appliedFilters.endDate) {
      filtered = filtered.filter(article => 
        new Date(article.publishedAt) <= new Date(appliedFilters.endDate + "T23:59:59")
      );
    }

    // ラベルフィルター（複数ラベルのAND検索）
    if (appliedFilters.labelTags.length > 0) {
      filtered = filtered.filter(article =>
        appliedFilters.labelTags.every(tag =>
          article.labels?.some(label => 
            label.toLowerCase().includes(tag.toLowerCase())
          )
        )
      );
    }

    // 検索クエリ
    if (appliedFilters.searchQuery) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(appliedFilters.searchQuery.toLowerCase()) ||
        article.summary?.toLowerCase().includes(appliedFilters.searchQuery.toLowerCase())
      );
    }

    // ソースフィルター
    if (appliedFilters.sourceFilter) {
      filtered = filtered.filter(article =>
        article.source.toLowerCase().includes(appliedFilters.sourceFilter.toLowerCase())
      );
    }

    // 選択済み記事を除外
    filtered = filtered.filter(article =>
      !selectedArticles.some(selected => selected.id === article.id)
    );

    setFilteredArticles(filtered);
  };

  const applyPagination = () => {
    const itemsCount = viewMode === "table" ? 10 : itemsPerPage;
    const totalPages = Math.ceil(filteredArticles.length / itemsCount);
    
    // 現在のページが総ページ数を超えている場合は最後のページに調整
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
      return;
    }
    
    const startIndex = (currentPage - 1) * itemsCount;
    const endIndex = startIndex + itemsCount;
    setPaginatedArticles(filteredArticles.slice(startIndex, endIndex));
  };

  const getTotalPages = () => {
    const itemsCount = viewMode === "table" ? 10 : itemsPerPage;
    return Math.ceil(filteredArticles.length / itemsCount);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // 選択済み記事用のページネーション
  const getSelectedTotalPages = () => {
    const itemsCount = selectedViewMode === "table" ? 10 : 12;
    return Math.ceil(filteredSelectedArticles.length / itemsCount);
  };
  
  const getSelectedPaginatedArticles = () => {
    const itemsCount = selectedViewMode === "table" ? 10 : 12;
    const startIndex = (selectedCurrentPage - 1) * itemsCount;
    const endIndex = startIndex + itemsCount;
    return filteredSelectedArticles.slice(startIndex, endIndex);
  };

  // 検索フィルターハンドラ
  const handleFiltersSearch = (filters: ArticleSearchFiltersType) => {
    setAppliedFilters(filters);
  };

  // フィルタークリアハンドラ
  const handleFiltersClear = () => {
    setAppliedFilters({
      startDate: "",
      endDate: "",
      labelTags: [],
      searchQuery: "",
      sourceFilter: ""
    });
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
    if (checkedArticles.size === paginatedArticles.length) {
      setCheckedArticles(new Set());
    } else {
      setCheckedArticles(new Set(paginatedArticles.map(a => a.id)));
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
      {/* 矢印ボタンを上部に配置 */}
      <div className="flex justify-center">
        <div className="flex gap-4">
          <button
            onClick={handleAddCheckedArticles}
            disabled={checkedArticles.size === 0}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg shadow-lg transition-all transform hover:scale-105 disabled:hover:scale-100 flex items-center gap-2"
            title={t("admin.topics.addSelected")}
          >
            <span className="text-sm font-medium">{t("admin.topics.addSelected")}</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
            onClick={handleClearSelection}
            disabled={selectedArticles.length === 0}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg shadow-lg transition-all transform hover:scale-105 disabled:hover:scale-100 flex items-center gap-2"
            title={t("admin.topics.clearSelection")}
          >
            <span className="text-sm font-medium">{t("admin.topics.clearSelection")}</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* 左側: 記事データベース */}
        <div className="xl:col-span-6">
          <div className="bg-white dark:bg-[#2d3646] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">
                {t("admin.topics.articleDatabase")}
              </h3>
              <ViewToggle viewMode={viewMode} onChange={setViewMode} />
            </div>

            {/* 記事検索フィルター */}
            <div className="mb-6">
              <ArticleSearchFilters
                onSearch={handleFiltersSearch}
                onClear={handleFiltersClear}
                appliedFilters={appliedFilters}
              />
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("admin.topics.foundArticles", { count: filteredArticles.length })}
              </p>
            </div>

            {/* 上部のページネーション */}
            {filteredArticles.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={getTotalPages()}
                hasNextPage={currentPage < getTotalPages()}
                hasPreviousPage={currentPage > 1}
                onPageChange={handlePageChange}
              />
            )}

            {/* 全選択チェックボックスとページネーション情報 */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700 mt-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={paginatedArticles.length > 0 && checkedArticles.size === paginatedArticles.length}
                  onChange={handleCheckAll}
                  className="w-4 h-4 text-blue-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {t("admin.topics.selectAll")}
                </label>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t("admin.topics.pageNavigation", { 
                  current: currentPage, 
                  total: getTotalPages(), 
                  showing: paginatedArticles.length,
                  totalCount: filteredArticles.length 
                })}
              </div>
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {paginatedArticles.map((article) => (
                  <Card
                    key={article.id}
                    variant="article"
                    colorTheme="article"
                    title={article.title}
                    summary={article.summary}
                    metadata={[
                      { label: "", value: article.source },
                      { label: "", value: new Date(article.publishedAt).toLocaleDateString() }
                    ]}
                    labels={article.labels || []}
                    imageUrl={article.thumbnailUrl || ""}
                    imageAlt={article.title}
                    showCheckbox={true}
                    isSelected={checkedArticles.has(article.id)}
                    onSelect={() => handleCheckArticle(article.id)}
                    actions={[
                      {
                        label: t("articles.originalArticle"),
                        href: article.articleUrl
                      }
                    ]}
                  />
                ))}
              </div>
            ) : (
              <div>
                <ArticleTable 
                  articles={paginatedArticles}
                  showCheckbox={true}
                  checkedArticles={checkedArticles}
                  onCheckArticle={handleCheckArticle}
                />
              </div>
            )}

            {/* 下部のページネーション */}
            {filteredArticles.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={getTotalPages()}
                hasNextPage={currentPage < getTotalPages()}
                hasPreviousPage={currentPage > 1}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>

        {/* 右側: 選択済み記事リスト */}
        <div className="xl:col-span-6">
          <div className="bg-white dark:bg-[#2d3646] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">
                {t("admin.topics.selectedArticles", { count: selectedArticles.length })}
              </h3>
              <ViewToggle viewMode={selectedViewMode} onChange={setSelectedViewMode} />
            </div>
            
            {/* 検索バー */}
            {selectedArticles.length > 0 && (
              <div className="mb-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={selectedSearch}
                    onChange={(e) => setSelectedSearch(e.target.value)}
                    placeholder={t("common.searchPlaceholder")}
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            {selectedArticles.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-2">{t("admin.topics.noArticlesSelected")}</p>
                <p className="text-sm mt-1">{t("admin.topics.selectArticlesHint")}</p>
              </div>
            ) : (
              <>
                {/* ページネーション情報 */}
                {filteredSelectedArticles.length > 0 && (
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {t("admin.topics.searchResultCount", { count: filteredSelectedArticles.length })}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {t("admin.topics.pageNavigation", { 
                        current: selectedCurrentPage, 
                        total: getSelectedTotalPages(), 
                        showing: getSelectedPaginatedArticles().length,
                        totalCount: filteredSelectedArticles.length 
                      })}
                    </div>
                  </div>
                )}
                
                <div className="space-y-3">
                  {selectedViewMode === "card" ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {getSelectedPaginatedArticles().map((article) => (
                        <Card
                          key={article.id}
                          variant="article"
                          colorTheme="article"
                          title={article.title}
                          summary={article.summary}
                          metadata={[
                            { label: "", value: article.source },
                            { label: "", value: new Date(article.publishedAt).toLocaleDateString() }
                          ]}
                          labels={article.labels || []}
                          imageUrl={article.thumbnailUrl || ""}
                          imageAlt={article.title}
                          onDelete={() => handleRemoveArticle(article.id)}
                          actions={[
                            {
                              label: t("articles.originalArticle"),
                              href: article.articleUrl
                            }
                          ]}
                        />
                      ))}
                    </div>
                  ) : (
                    <div>
                      <ArticleTable 
                        articles={getSelectedPaginatedArticles()}
                        showCheckbox={false}
                        onDelete={(articleId) => handleRemoveArticle(articleId)}
                      />
                    </div>
                  )}
                </div>
                
                {/* ページネーション */}
                {filteredSelectedArticles.length > 0 && getSelectedTotalPages() > 1 && (
                  <div className="mt-4">
                    <Pagination
                      currentPage={selectedCurrentPage}
                      totalPages={getSelectedTotalPages()}
                      hasNextPage={selectedCurrentPage < getSelectedTotalPages()}
                      hasPreviousPage={selectedCurrentPage > 1}
                      onPageChange={setSelectedCurrentPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}