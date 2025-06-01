"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/features/i18n/hooks/useI18n";
import { Topic } from "@/types/topic.d";

// ダミーデータ（後で実際のAPIから取得するように変更）
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
  {
    id: "topic-002",
    title: "2025年4月号 TOPICS",
    publishDate: "2025-04-01",
    summary:
      "車載半導体の需給バランスが大きく改善し、新世代のLSI設計プロセスにおける自動化・AI活用が加速しています。また、リケーブルな半導体サプライチェーンの構築に向けた国際的な動きも活発化しています。",
    articleCount: 5,
    categories: [
      {
        id: "cat-2",
        name: "市場トレンド",
        displayOrder: 1,
        articles: [{ id: "b1" }, { id: "b2" }, { id: "b3" }],
      },
      {
        id: "cat-3",
        name: "企業動向",
        displayOrder: 2,
        articles: [{ id: "b4" }, { id: "b5" }],
      },
    ],
    createdAt: "2025-04-01T00:00:00Z",
    updatedAt: "2025-04-01T00:00:00Z",
  },
];

export default function TopicsAdminPage() {
  const { t } = useI18n();
  const [topics, setTopics] = useState<Topic[]>(dummyTopics);

  return (
    <div className="min-h-screen bg-[#181e29] py-0 px-0">
      <div className="pt-[90px] pb-12 flex justify-center">
        <div className="w-full max-w-5xl">
          <div className="bg-[#232b39] rounded-2xl shadow p-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-100 mb-6">
              TOPICS配信管理
            </h1>
            <div className="flex justify-between mb-6">
              <div className="flex items-center">
                <span className="text-gray-300">
                  合計: {topics.length}件のTOPICS
                </span>
              </div>
              <button className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded transition text-sm flex items-center">
                <span className="mr-1">+</span>新規TOPICS作成
              </button>
            </div>
            <div className="mb-6">
              <input
                type="text"
                className="w-full bg-[#2d3646] text-gray-200 rounded px-4 py-3 outline-none placeholder-gray-400"
                placeholder="TOPICSタイトルで検索..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topics.map((topic) => (
                <div
                  key={topic.id}
                  className="bg-[#2d3646] rounded-xl shadow p-6 flex flex-col"
                >
                  <div className="text-lg font-semibold text-blue-200 mb-2 truncate">
                    {topic.title}
                  </div>
                  <div className="text-sm text-gray-300 mb-2 line-clamp-2">
                    {topic.summary}
                  </div>
                  <div className="text-xs text-gray-400 mb-1">
                    公開日: {topic.publishDate}
                  </div>
                  <div className="text-xs text-gray-400 mb-2">
                    記事数: {topic.articleCount}件
                  </div>
                  {topic.categories && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {topic.categories.map((category) => (
                        <span
                          key={category.id}
                          className="bg-blue-700 text-xs text-white px-2 py-0.5 rounded"
                        >
                          {category.name}({category.articles.length})
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 mt-auto">
                    <Link
                      href={`/admin/topics/${topic.id}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition text-sm"
                    >
                      編集
                    </Link>
                    <Link
                      href={`/admin/topics/${topic.id}/collect`}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition text-sm"
                    >
                      記事収集
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            {topics.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p>TOPICSが見つかりません</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
