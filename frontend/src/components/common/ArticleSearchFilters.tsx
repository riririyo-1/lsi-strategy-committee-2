"use client";

import { useState } from "react";
import DatePicker from "@/components/ui/DatePicker";
import { Button } from "@/components/ui/Button";
import { ChevronDown } from "lucide-react";

export interface ArticleSearchFilters {
  startDate: string;
  endDate: string;
  labelTags: string[];
  searchQuery: string;
  sourceFilter: string;
  quickFilter?: string;
}

interface ArticleSearchFiltersProps {
  onSearch: (filters: ArticleSearchFilters) => void;
  onClear: () => void;
  appliedFilters?: ArticleSearchFilters;
  className?: string;
}

// よく使うラベル
const QUICK_FILTERS = [
  { id: "all", label: "すべて" },
  { id: "semiconductor", label: "半導体" },
  { id: "sony", label: "ソニー" },
  { id: "smartphone", label: "スマートフォン" },
  { id: "camera", label: "カメラ" },
  { id: "usa", label: "アメリカ" },
  { id: "japan", label: "日本" },
];

export default function ArticleSearchFilters({
  onSearch,
  onClear,
  appliedFilters,
  className = "",
}: ArticleSearchFiltersProps) {
  // フィルター入力状態
  const [searchQuery, setSearchQuery] = useState("");
  const [quickFilter, setQuickFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [labelTags, setLabelTags] = useState<string[]>([]);
  const [labelInput, setLabelInput] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");

  // 詳細フィルターの開閉状態
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const handleLabelKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && labelInput.trim()) {
      e.preventDefault();
      if (!labelTags.includes(labelInput.trim())) {
        setLabelTags([...labelTags, labelInput.trim()]);
      }
      setLabelInput("");
    }
  };

  const removeLabel = (labelToRemove: string) => {
    setLabelTags(labelTags.filter((label) => label !== labelToRemove));
  };

  const handleQuickFilterChange = (filterId: string) => {
    // 現在選択中のフィルターをもう一度クリックした場合は「すべて」に戻す
    const newFilterId = quickFilter === filterId ? "all" : filterId;
    setQuickFilter(newFilterId);
    
    // クイックフィルターが変更されたら即座に検索
    const filterLabels =
      newFilterId === "all"
        ? []
        : [QUICK_FILTERS.find((f) => f.id === newFilterId)?.label || ""];
    onSearch({
      startDate,
      endDate,
      labelTags: filterLabels,
      searchQuery,
      sourceFilter,
      quickFilter: newFilterId,
    });
  };

  const handleSearch = () => {
    const filterLabels =
      quickFilter === "all"
        ? labelTags
        : [
            ...(quickFilter
              ? [QUICK_FILTERS.find((f) => f.id === quickFilter)?.label || ""]
              : []),
            ...labelTags,
          ];

    onSearch({
      startDate,
      endDate,
      labelTags: filterLabels,
      searchQuery,
      sourceFilter,
      quickFilter,
    });
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClear = () => {
    setStartDate("");
    setEndDate("");
    setLabelTags([]);
    setLabelInput("");
    setSearchQuery("");
    setSourceFilter("");
    setQuickFilter("all");
    setIsAdvancedOpen(false);
    onClear();
  };

  const hasAppliedFilters = () => {
    return (
      appliedFilters &&
      (appliedFilters.startDate ||
        appliedFilters.endDate ||
        appliedFilters.labelTags.length > 0 ||
        appliedFilters.searchQuery ||
        appliedFilters.sourceFilter ||
        (appliedFilters.quickFilter && appliedFilters.quickFilter !== "all"))
    );
  };

  return (
    <div
      className={`bg-white/90 dark:bg-gray-800/90 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm ${className}`}
    >
      <div className="p-4 space-y-4">
        {/* シンプルな検索バー */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="記事を検索..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 placeholder-gray-500"
            />
          </div>
          <Button
            onClick={handleSearch}
            variant="primary"
            size="sm"
            className="px-6"
          >
            検索
          </Button>
        </div>

        {/* クイックフィルター */}
        <div className="flex items-center gap-2 flex-wrap">
          {QUICK_FILTERS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => handleQuickFilterChange(filter.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                quickFilter === filter.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* 詳細フィルターボタン */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className={`
              group flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
              transition-all duration-200 
              ${
                isAdvancedOpen
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                  : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
              }
            `}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
            <span>詳細フィルター</span>
            <div
              className={`ml-1 transition-transform duration-200 ${
                isAdvancedOpen ? "rotate-180" : ""
              }`}
            >
              <ChevronDown className="w-4 h-4" />
            </div>
          </button>

          {hasAppliedFilters() && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <span>クリア</span>
            </button>
          )}
        </div>

        {/* 詳細フィルター（展開時） */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            isAdvancedOpen ? "max-h-96" : "max-h-0"
          }`}
        >
          <div className="pt-4 space-y-4 border-t border-gray-200 dark:border-gray-700">
            {/* 日付範囲 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                日付範囲
              </label>
              <div className="grid grid-cols-2 gap-3">
                <DatePicker
                  selected={startDate ? new Date(startDate) : undefined}
                  onSelect={(date) =>
                    setStartDate(date.toISOString().split("T")[0])
                  }
                  placeholder="開始日"
                  className="w-full"
                />
                <DatePicker
                  selected={endDate ? new Date(endDate) : undefined}
                  onSelect={(date) =>
                    setEndDate(date.toISOString().split("T")[0])
                  }
                  placeholder="終了日"
                  className="w-full"
                />
              </div>
            </div>

            {/* ラベル */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ラベル
              </label>
              <input
                type="text"
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                onKeyDown={handleLabelKeyDown}
                placeholder="ラベルを入力してEnterキー"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
              />
              {labelTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {labelTags.map((label) => (
                    <span
                      key={label}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                    >
                      {label}
                      <button
                        type="button"
                        onClick={() => removeLabel(label)}
                        className="ml-2 hover:text-blue-600 dark:hover:text-blue-300"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* ソース */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ソース
              </label>
              <input
                type="text"
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                placeholder="記事ソースを入力"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
              />
            </div>

            {/* 詳細検索ボタン */}
            <div className="pt-2">
              <Button
                onClick={handleSearch}
                variant="primary"
                size="sm"
                className="w-full"
              >
                詳細条件で検索
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
