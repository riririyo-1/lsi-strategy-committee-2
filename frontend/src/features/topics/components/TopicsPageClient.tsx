"use client";

import { useI18n } from "@/features/i18n/hooks/useI18n";
import { useState, useEffect } from "react";
import { Topic } from "@/types/topic.d";
import { TopicCard } from "./TopicCard";
import { topicsApi } from "@/lib/apiClient";
import { PageLayout } from "@/components/common/PageLayout";

const TopicsPageClient = () => {
  const { t } = useI18n();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoading(true);
        const response = await topicsApi.getAll();
        const apiTopics = response.data;
        
        // APIレスポンスをTopic型に変換
        const convertedTopics: Topic[] = apiTopics.map((apiTopic: any) => ({
          id: apiTopic.id,
          title: apiTopic.title,
          publishDate: apiTopic.publishDate ? new Date(apiTopic.publishDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          summary: apiTopic.summary || "",
          articleCount: apiTopic.articles ? apiTopic.articles.length : 0,
          categories: [], // 現在はサポートしていない
          createdAt: apiTopic.createdAt,
          updatedAt: apiTopic.updatedAt,
        }));
        
        setTopics(convertedTopics);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch topics:", err);
        setError("TOPICSの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  if (loading) {
    return (
      <PageLayout
        title={t("topics.title") || "TOPICS配信"}
        description={t("topics.description") || "半導体業界の月次トピックス配信"}
      >
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
          <p className="mt-2 text-white">{t("common.loading") || "読み込み中..."}</p>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout
        title={t("topics.title") || "TOPICS配信"}
        description={t("topics.description") || "半導体業界の月次トピックス配信"}
      >
        <div className="text-center py-12 text-red-400">
          <p>{error}</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={t("topics.title") || "TOPICS配信"}
      description={t("topics.description") || "半導体業界の月次トピックス配信"}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
        {topics.map((topic) => (
          <TopicCard key={topic.id} topic={topic} />
        ))}
      </div>
      {topics.length === 0 && (
        <div className="text-center py-12 text-white">
          <p>{t("topics.noData") || "トピックスが見つかりません"}</p>
        </div>
      )}
    </PageLayout>
  );
};

export default TopicsPageClient;
