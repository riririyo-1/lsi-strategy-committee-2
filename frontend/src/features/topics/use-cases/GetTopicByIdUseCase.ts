import type { Topic } from "@/types/topic";

// 仮のダミーデータ（useTopics.tsと同じ構造）
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

export async function getDummyTopicById(
  id: string
): Promise<Topic | undefined> {
  return dummyTopics.find((t) => t.id === id);
}
