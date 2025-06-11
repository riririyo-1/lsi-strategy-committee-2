"use client";

import { useState } from "react";
import { useI18n } from "@/features/i18n/hooks/useI18n";
import DatePicker from "./DatePicker";
import { Button } from "./Button";

export interface ArticleSearchFilters {
  startDate: string;
  endDate: string;
  labelTags: string[];
  searchQuery: string;
  sourceFilter: string;
}

interface ArticleSearchFiltersProps {
  onSearch: (filters: ArticleSearchFilters) => void;
  onClear: () => void;
  appliedFilters?: ArticleSearchFilters;
  className?: string;
}

export default function ArticleSearchFilters({
  onSearch,
  onClear,
  appliedFilters,
  className = ""
}: ArticleSearchFiltersProps) {
  const { t } = useI18n();
  
  // フィルター入力状態
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [labelTags, setLabelTags] = useState<string[]>([]);
  const [labelInput, setLabelInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");

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

  const handleSearch = () => {
    onSearch({
      startDate,
      endDate,
      labelTags: [...labelTags],
      searchQuery,
      sourceFilter
    });
  };

  const handleClear = () => {
    setStartDate("");
    setEndDate("");
    setLabelTags([]);
    setLabelInput("");
    setSearchQuery("");
    setSourceFilter("");
    onClear();
  };

  const hasAnyFilter = () => {
    return startDate || endDate || labelTags.length > 0 || searchQuery || sourceFilter;
  };

  const hasAppliedFilters = () => {
    return appliedFilters && (
      appliedFilters.startDate || 
      appliedFilters.endDate || 
      appliedFilters.labelTags.length > 0 || 
      appliedFilters.searchQuery || 
      appliedFilters.sourceFilter
    );
  };

  return (
    <div className={`bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg ${className}`}>
      <div className="p-6 space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center space-x-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">記事検索フィルター</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">条件を設定して記事を絞り込み</p>
          </div>
        </div>

        {/* 日付範囲検索 */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">日付範囲</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 ml-1">
                開始日
              </label>
              <DatePicker
                selected={startDate ? new Date(startDate) : undefined}
                onSelect={(date) => setStartDate(date.toISOString().split("T")[0])}
                placeholder="開始日を選択"
                className="w-full"
              />
            </div>
            <div className="relative">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 ml-1">
                終了日
              </label>
              <DatePicker
                selected={endDate ? new Date(endDate) : undefined}
                onSelect={(date) => setEndDate(date.toISOString().split("T")[0])}
                placeholder="終了日を選択"
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* ラベル検索 */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">ラベル検索</span>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <input
              type="text"
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              onKeyPress={handleLabelKeyPress}
              placeholder="ラベルを入力してEnterキー"
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 placeholder-gray-400"
            />
          </div>
          {labelTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {labelTags.map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700/30"
                >
                  {label}
                  <button
                    type="button"
                    onClick={() => removeLabel(label)}
                    className="ml-2 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
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

        {/* キーワード・ソース検索 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">キーワード</span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="タイトル・要約で検索"
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 placeholder-gray-400"
              />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">ソース</span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <input
                type="text"
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                placeholder="記事ソースで検索"
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        {/* 適用中の検索条件表示 */}
        {hasAppliedFilters() && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <div className="flex items-center justify-center w-6 h-6 bg-blue-500 rounded-full">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">適用中の検索条件</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {(appliedFilters!.startDate || appliedFilters!.endDate) && (
                <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>日付: {appliedFilters!.startDate || "指定なし"} ～ {appliedFilters!.endDate || "指定なし"}</span>
                </div>
              )}
              {appliedFilters!.searchQuery && (
                <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>キーワード: {appliedFilters!.searchQuery}</span>
                </div>
              )}
              {appliedFilters!.sourceFilter && (
                <div className="flex items-center space-x-2 text-orange-700 dark:text-orange-300">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                  <span>ソース: {appliedFilters!.sourceFilter}</span>
                </div>
              )}
              {appliedFilters!.labelTags.length > 0 && (
                <div className="flex items-center space-x-2 text-purple-700 dark:text-purple-300 md:col-span-2">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span>ラベル: {appliedFilters!.labelTags.join(", ")}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 検索ボタン */}
        <div className="flex gap-3 pt-2">
          <Button
            onClick={handleSearch}
            variant="primary"
            size="sm"
            disabled={!hasAnyFilter()}
            className="flex-1"
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>検索実行</span>
            </div>
          </Button>
          <Button
            onClick={handleClear}
            variant="secondary"
            size="sm"
            disabled={!hasAppliedFilters()}
            className=""
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>クリア</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}