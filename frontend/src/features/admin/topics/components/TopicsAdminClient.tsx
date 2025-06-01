"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/features/i18n/hooks/useI18n";
import { TopicCard } from "./TopicCard";
import { useTopics } from "../hooks/useTopics";

export const TopicsAdminClient: React.FC = () => {
  const { t } = useI18n();
  const {
    topics,
    totalTopics,
    currentPage,
    pageSize,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    setCurrentPage,
    deleteTopic,
  } = useTopics();

  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState<string | null>(null);

  // 削除確認モーダルを表示
  const handleDeleteClick = (id: string) => {
    setTopicToDelete(id);
    setShowConfirmModal(true);
  };

  // 削除実行
  const handleConfirmDelete = async () => {
    if (topicToDelete) {
      setIsDeleting(true);
      try {
        await deleteTopic(topicToDelete);
        setShowConfirmModal(false);
      } catch (error) {
        console.error("削除エラー:", error);
      } finally {
        setIsDeleting(false);
        setTopicToDelete(null);
      }
    }
  };

  // 削除キャンセル
  const handleCancelDelete = () => {
    setShowConfirmModal(false);
    setTopicToDelete(null);
  };

  // 検索処理
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // ページネーション表示用の配列を生成
  const getPageNumbers = () => {
    const totalPages = Math.ceil(totalTopics / pageSize);
    const pages = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 現在のページがめに来るように調整
      let startPage = Math.max(1, currentPage - 3);
      let endPage = Math.min(totalPages, startPage + 6);

      if (endPage - startPage < 6) {
        startPage = Math.max(1, endPage - 6);
      }

      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push(-1); // -1 は省略記号を表す
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push(-1); // -1 は省略記号を表す
        }
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="min-h-screen bg-background dark:bg-backgrounddark py-0 px-0">
      <div className="pt-[90px] pb-12 flex justify-center">
        <div className="w-full max-w-6xl px-4">
          <div className="bg-card dark:bg-carddark rounded-2xl shadow p-8">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground dark:text-foregrounddark mb-6">
              {t("admin.topics.management") || "TOPICS配信管理"}
            </h1>
            <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4">
              <div className="flex items-center">
                <span className="text-muted dark:text-muteddark">
                  {t("admin.topics.total", { count: String(totalTopics) }) ||
                    `合計: ${totalTopics}件のTOPICS`}
                </span>
              </div>
              <Link
                href="/admin/topics/create"
                className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white font-semibold px-4 py-2 rounded transition text-sm flex items-center justify-center sm:justify-start"
              >
                <span className="mr-1">+</span>
                {t("admin.topics.create") || "新規TOPICS作成"}
              </Link>
            </div>
            <div className="mb-6">
              <input
                type="text"
                className="w-full bg-input dark:bg-inputdark text-foreground dark:text-foregrounddark rounded px-4 py-3 outline-none placeholder-muted dark:placeholder-muteddark border border-border dark:border-borderdark focus:border-primary dark:focus:border-primarydark"
                placeholder={
                  t("admin.topics.searchPlaceholder") ||
                  "TOPICSタイトルで検索..."
                }
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary dark:border-primarydark"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">
                <p>
                  {t("admin.topics.error") || "エラーが発生しました"}:{" "}
                  {error.message}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {topics.map((topic) => (
                    <TopicCard
                      key={topic.id}
                      topic={topic}
                      onDelete={handleDeleteClick}
                    />
                  ))}
                </div>

                {topics.length === 0 && (
                  <div className="text-center py-12 text-muted dark:text-muteddark">
                    <p>
                      {t("admin.topics.noResults") || "TOPICSが見つかりません"}
                    </p>
                  </div>
                )}

                {/* ページネーション */}
                {totalTopics > pageSize && (
                  <div className="flex justify-center mt-8">
                    <nav className="flex items-center space-x-1">
                      <button
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                        className={`px-3 py-2 rounded-md ${
                          currentPage === 1
                            ? "text-muted dark:text-muteddark cursor-not-allowed"
                            : "text-foreground dark:text-foregrounddark hover:bg-muted/20 dark:hover:bg-muteddark/20"
                        }`}
                      >
                        &lt;
                      </button>

                      {getPageNumbers().map((page, index) =>
                        page === -1 ? (
                          <span
                            key={`ellipsis-${index}`}
                            className="px-3 py-2 text-muted dark:text-muteddark"
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-2 rounded-md ${
                              currentPage === page
                                ? "bg-primary dark:bg-primarydark text-white"
                                : "text-foreground dark:text-foregrounddark hover:bg-muted/20 dark:hover:bg-muteddark/20"
                            }`}
                          >
                            {page}
                          </button>
                        )
                      )}

                      <button
                        onClick={() =>
                          setCurrentPage(
                            Math.min(
                              Math.ceil(totalTopics / pageSize),
                              currentPage + 1
                            )
                          )
                        }
                        disabled={
                          currentPage >= Math.ceil(totalTopics / pageSize)
                        }
                        className={`px-3 py-2 rounded-md ${
                          currentPage >= Math.ceil(totalTopics / pageSize)
                            ? "text-muted dark:text-muteddark cursor-not-allowed"
                            : "text-foreground dark:text-foregrounddark hover:bg-muted/20 dark:hover:bg-muteddark/20"
                        }`}
                      >
                        &gt;
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* 削除確認モーダル */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-card dark:bg-carddark rounded-lg max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-foreground dark:text-foregrounddark mb-4">
              {t("admin.topics.confirmDelete") || "TOPICSを削除しますか？"}
            </h3>
            <p className="text-muted dark:text-muteddark mb-6">
              {t("admin.topics.confirmDeleteMessage") ||
                "この操作は取り消せません。本当に削除しますか？"}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 border border-border dark:border-borderdark rounded text-foreground dark:text-foregrounddark hover:bg-muted/20 dark:hover:bg-muteddark/20"
                disabled={isDeleting}
              >
                {t("common.cancel") || "キャンセル"}
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {t("common.processing") || "処理中"}
                  </span>
                ) : (
                  t("common.delete") || "削除する"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
