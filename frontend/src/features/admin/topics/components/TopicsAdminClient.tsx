"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/features/i18n/hooks/useI18n";
import { TopicCard } from "./TopicCard";
import { useTopics } from "../hooks/useTopics";
import SearchBar from "@/components/common/SearchBar";
import Pagination from "@/components/common/Pagination";
import { PageLayout } from "@/components/common/PageLayout";
import { Button } from "@/components/common/Button";

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
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // ページネーション用の計算
  const totalPages = Math.ceil(totalTopics / pageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  const actions = (
    <>
      <div className="flex items-center">
        <span className="text-white">
          {t("admin.topics.total", { count: String(totalTopics) }) ||
            `合計: ${totalTopics}件のTOPICS`}
        </span>
      </div>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          onClick={() => window.location.href = "/admin"}
        >
          {t("common.back")}
        </Button>
        <Button
          variant="primary"
          onClick={() => window.location.href = "/admin/topics/create"}
        >
          <span className="mr-1">+</span>
          {t("admin.topics.create") || "新規TOPICS作成"}
        </Button>
      </div>
    </>
  );

  return (
    <PageLayout
      title={t("admin.topics.management") || "TOPICS配信管理"}
      description="半導体業界のトピックス配信を管理します"
      actions={actions}
      showActionBar={true}
    >
      <div className="mb-8">
        <SearchBar onSearch={handleSearch} />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-400">
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
                variant="admin"
              />
            ))}
          </div>

          {topics.length === 0 && (
            <div className="text-center py-12 text-white">
              <p>
                {t("admin.topics.noResults") || "TOPICSが見つかりません"}
              </p>
            </div>
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
            onPageChange={setCurrentPage}
          />
        </>
      )}
      {/* 削除確認モーダル */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {t("admin.topics.confirmDelete") || "TOPICSを削除しますか？"}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {t("admin.topics.confirmDeleteMessage") ||
                "この操作は取り消せません。本当に削除しますか？"}
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={handleCancelDelete}
                disabled={isDeleting}
              >
                {t("common.cancel") || "キャンセル"}
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                isLoading={isDeleting}
              >
                {t("common.delete") || "削除する"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};
