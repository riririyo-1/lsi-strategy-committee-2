import { Topic } from "@/types/topic";
import {
  GetTopicsParams,
  GetTopicsResult,
  ITopicsRepository,
} from "../ports/ITopicsRepository";

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

// APIクライアントの実装
export class ApiTopicsRepository implements ITopicsRepository {
  async getTopics(params: GetTopicsParams): Promise<GetTopicsResult> {
    // 実際にはAPIから取得する処理を実装
    // 今回はモックデータを使用
    const { query, page = 1, pageSize = 10 } = params;

    let filteredTopics = [...dummyTopics];

    // 検索クエリがある場合はフィルタリング
    if (query) {
      const lowerQuery = query.toLowerCase();
      filteredTopics = filteredTopics.filter(
        (topic) =>
          topic.title.toLowerCase().includes(lowerQuery) ||
          topic.summary.toLowerCase().includes(lowerQuery)
      );
    }

    // ページネーション
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedTopics = filteredTopics.slice(startIndex, endIndex);

    return {
      topics: paginatedTopics,
      total: filteredTopics.length,
      page,
      pageSize,
    };
  }

  async getTopicById(id: string): Promise<Topic> {
    // 実際にはAPIから取得する処理を実装
    const topic = dummyTopics.find((t) => t.id === id);
    if (!topic) {
      throw new Error(`Topic with ID ${id} not found`);
    }
    return topic;
  }

  async createTopic(
    topic: Omit<Topic, "id" | "createdAt" | "updatedAt">
  ): Promise<Topic> {
    // 実際にはAPIにPOSTする処理を実装
    const newTopic: Topic = {
      ...topic,
      id: `topic-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return newTopic;
  }

  async updateTopic(id: string, topic: Partial<Topic>): Promise<Topic> {
    // 実際にはAPIにPUTする処理を実装
    const existingTopic = await this.getTopicById(id);
    const updatedTopic: Topic = {
      ...existingTopic,
      ...topic,
      updatedAt: new Date().toISOString(),
    };
    return updatedTopic;
  }

  async deleteTopic(id: string): Promise<boolean> {
    // 実際にはAPIにDELETEする処理を実装
    return true;
  }
}
