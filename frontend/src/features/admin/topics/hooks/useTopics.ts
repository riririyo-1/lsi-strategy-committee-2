"use client";

import { useState, useEffect, useCallback } from "react";
import { Topic } from "@/types/topic";
import { GetTopicsParams, ITopicsRepository } from "../ports/ITopicsRepository";
import { ApiTopicsRepository } from "../infrastructure/ApiTopicsRepository";
import {
  GetTopicsUseCase,
  GetTopicByIdUseCase,
  CreateTopicUseCase,
  UpdateTopicUseCase,
  DeleteTopicUseCase,
} from "../use-cases/TopicsUseCases";

export interface UseTopicsResult {
  topics: Topic[];
  totalTopics: number;
  currentPage: number;
  pageSize: number;
  isLoading: boolean;
  error: Error | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  refreshTopics: () => Promise<void>;
  getTopic: (id: string) => Promise<Topic>;
  createTopic: (
    topic: Omit<Topic, "id" | "createdAt" | "updatedAt">
  ) => Promise<Topic>;
  updateTopic: (id: string, topic: Partial<Topic>) => Promise<Topic>;
  deleteTopic: (id: string) => Promise<boolean>;
}

export function useTopics(): UseTopicsResult {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [totalTopics, setTotalTopics] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // リポジトリとユースケースの初期化（実際のアプリケーションでは依存性注入を検討）
  const topicsRepository: ITopicsRepository = new ApiTopicsRepository();
  const getTopicsUseCase = new GetTopicsUseCase(topicsRepository);
  const getTopicByIdUseCase = new GetTopicByIdUseCase(topicsRepository);
  const createTopicUseCase = new CreateTopicUseCase(topicsRepository);
  const updateTopicUseCase = new UpdateTopicUseCase(topicsRepository);
  const deleteTopicUseCase = new DeleteTopicUseCase(topicsRepository);

  // TOPICSを取得する関数
  const fetchTopics = useCallback(
    async (params: GetTopicsParams) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getTopicsUseCase.execute(params);
        setTopics(result.topics);
        setTotalTopics(result.total);
        setCurrentPage(result.page);
        setPageSize(result.pageSize);
      } catch (e) {
        setError(e instanceof Error ? e : new Error("Unknown error occurred"));
        setTopics([]);
        setTotalTopics(0);
      } finally {
        setIsLoading(false);
      }
    },
    [getTopicsUseCase]
  );

  // 検索クエリが変更されたらTOPICSを再取得
  const handleSearchQueryChange = useCallback(
    (query: string) => {
      setSearchQuery(query);
      setCurrentPage(1); // 検索時は1ページ目に戻る
      fetchTopics({
        query,
        page: 1,
        pageSize,
      });
    },
    [fetchTopics, pageSize]
  );

  // ページが変更されたらTOPICSを再取得
  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      fetchTopics({
        query: searchQuery,
        page,
        pageSize,
      });
    },
    [fetchTopics, searchQuery, pageSize]
  );

  // ページサイズが変更されたらTOPICSを再取得
  const handlePageSizeChange = useCallback(
    (size: number) => {
      setPageSize(size);
      setCurrentPage(1); // ページサイズ変更時は1ページ目に戻る
      fetchTopics({
        query: searchQuery,
        page: 1,
        pageSize: size,
      });
    },
    [fetchTopics, searchQuery]
  );

  // TOPICSを再取得する関数
  const refreshTopics = useCallback(async () => {
    await fetchTopics({
      query: searchQuery,
      page: currentPage,
      pageSize,
    });
  }, [fetchTopics, searchQuery, currentPage, pageSize]);

  // 特定のTOPICを取得する関数
  const getTopic = useCallback(
    async (id: string) => {
      try {
        return await getTopicByIdUseCase.execute(id);
      } catch (e) {
        throw e instanceof Error ? e : new Error("Unknown error occurred");
      }
    },
    [getTopicByIdUseCase]
  );

  // TOPICを作成する関数
  const createTopic = useCallback(
    async (topic: Omit<Topic, "id" | "createdAt" | "updatedAt">) => {
      try {
        const newTopic = await createTopicUseCase.execute(topic);
        await refreshTopics();
        return newTopic;
      } catch (e) {
        throw e instanceof Error ? e : new Error("Unknown error occurred");
      }
    },
    [createTopicUseCase, refreshTopics]
  );

  // TOPICを更新する関数
  const updateTopic = useCallback(
    async (id: string, topic: Partial<Topic>) => {
      try {
        const updatedTopic = await updateTopicUseCase.execute(id, topic);
        await refreshTopics();
        return updatedTopic;
      } catch (e) {
        throw e instanceof Error ? e : new Error("Unknown error occurred");
      }
    },
    [updateTopicUseCase, refreshTopics]
  );

  // TOPICを削除する関数
  const deleteTopic = useCallback(
    async (id: string) => {
      try {
        const success = await deleteTopicUseCase.execute(id);
        if (success) {
          await refreshTopics();
        }
        return success;
      } catch (e) {
        throw e instanceof Error ? e : new Error("Unknown error occurred");
      }
    },
    [deleteTopicUseCase, refreshTopics]
  );

  // 初回レンダリング時にTOPICSを取得（useEffectで実行）
  useEffect(() => {
    fetchTopics({ page: currentPage, pageSize });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    topics,
    totalTopics,
    currentPage,
    pageSize,
    isLoading,
    error,
    searchQuery,
    setSearchQuery: handleSearchQueryChange,
    setCurrentPage: handlePageChange,
    setPageSize: handlePageSizeChange,
    refreshTopics,
    getTopic,
    createTopic,
    updateTopic,
    deleteTopic,
  };
}
