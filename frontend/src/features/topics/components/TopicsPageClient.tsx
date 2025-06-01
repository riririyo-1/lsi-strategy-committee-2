"use client";

import { useI18n } from "@/features/i18n/hooks/useI18n";
import { useState } from "react";
import { Topic } from "@/types/topic.d";
import { TopicCard } from "./TopicCard";

const dummyTopics: Topic[] = [
  {
    id: "topic-001",
    title: "2025年5月号 TOPICS",
    publishDate: "2025-05-01",
    summary:
      "今月の半導体業界は、特に量子コンピューティング向けLSIの最新開発状況やEUVリソグラフィ技術の進展が注目されました。また、サステナブルな半導体製造への取り組みも加速しています。",
    articleCount: 3,
    categories: [
      {
        id: "cat-1",
        name: "技術動向",
        displayOrder: 1,
        articles: [{ id: "a1" }, { id: "a2" }],
      },
      {
        id: "cat-2",
        name: "市場トレンド",
        displayOrder: 2,
        articles: [{ id: "a3" }],
      },
    ],
    createdAt: "2025-05-01T00:00:00Z",
    updatedAt: "2025-05-01T00:00:00Z",
  },
];

const TopicsPageClient = () => {
  const { t } = useI18n();
  const [topics] = useState<Topic[]>(dummyTopics);

  return (
    <>
      <h1 className="text-4xl md:text-5xl font-bold mb-10 text-center text-white text-shadow">
        {t("topics.title") || "TOPICS配信"}
      </h1>
      <p className="text-xl mb-8 text-center mx-auto max-w-4xl text-white">
        {t("topics.description") || "半導体業界の月次トピックス配信"}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
        {topics.map((topic) => (
          <TopicCard key={topic.id} topic={topic} />
        ))}
      </div>
      {topics.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>{t("topics.noData") || "トピックスが見つかりません"}</p>
        </div>
      )}
    </>
  );
};

export default TopicsPageClient;
