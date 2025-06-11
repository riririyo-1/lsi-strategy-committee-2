import { Topic } from "@/types/topic";
import {
  GetTopicsParams,
  GetTopicsResult,
  ITopicsRepository,
} from "../ports/ITopicsRepository";
import { topicsApi } from "@/lib/apiClient";

// APIクライアントの実装
export class ApiTopicsRepository implements ITopicsRepository {
  async getTopics(params: GetTopicsParams): Promise<GetTopicsResult> {
    try {
      const response = await topicsApi.getAll();
      const topics: any[] = response.data;

      // 検索クエリがある場合はフィルタリング
      let filteredTopics = topics;
      if (params.query) {
        const lowerQuery = params.query.toLowerCase();
        filteredTopics = topics.filter(
          (topic) =>
            topic.title.toLowerCase().includes(lowerQuery) ||
            (topic.summary && topic.summary.toLowerCase().includes(lowerQuery))
        );
      }

      // ページネーション
      const page = params.page || 1;
      const pageSize = params.pageSize || 10;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedTopics = filteredTopics.slice(startIndex, endIndex);

      // Topic型に変換
      const convertedTopics: Topic[] = paginatedTopics.map(this.convertToTopic);

      return {
        topics: convertedTopics,
        total: filteredTopics.length,
        page,
        pageSize,
      };
    } catch (error) {
      console.error("Failed to fetch topics:", error);
      throw new Error("TOPICSの取得に失敗しました");
    }
  }

  async getTopicById(id: string): Promise<Topic> {
    try {
      const response = await topicsApi.getById(id);
      return this.convertToTopic(response.data);
    } catch (error) {
      console.error("Failed to fetch topic:", error);
      throw new Error("TOPICSの取得に失敗しました");
    }
  }

  async createTopic(
    topic: Omit<Topic, "id" | "createdAt" | "updatedAt">
  ): Promise<Topic> {
    try {
      const response = await topicsApi.create({
        title: topic.title,
        summary: topic.summary || "",
        publishDate: topic.publishDate,
        articles: [], // 記事は別途関連付ける
      });
      return this.convertToTopic(response.data);
    } catch (error) {
      console.error("Failed to create topic:", error);
      throw new Error("TOPICSの作成に失敗しました");
    }
  }

  async updateTopic(id: string, topic: Partial<Topic>): Promise<Topic> {
    try {
      const response = await topicsApi.update(id, {
        title: topic.title,
        summary: topic.summary,
        publishDate: topic.publishDate,
        articles: [], // 記事は別途関連付ける
      });
      return this.convertToTopic(response.data);
    } catch (error) {
      console.error("Failed to update topic:", error);
      throw new Error("TOPICSの更新に失敗しました");
    }
  }

  async deleteTopic(id: string): Promise<boolean> {
    try {
      await topicsApi.delete(id);
      return true;
    } catch (error) {
      console.error("Failed to delete topic:", error);
      throw new Error("TOPICSの削除に失敗しました");
    }
  }

  // APIレスポンスをTopic型に変換
  private convertToTopic(apiTopic: any): Topic {
    return {
      id: apiTopic.id,
      title: apiTopic.title,
      publishDate: apiTopic.publishDate ? new Date(apiTopic.publishDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      summary: apiTopic.summary || "",
      articleCount: apiTopic.articles ? apiTopic.articles.length : 0,
      categories: [], // 現在はサポートしていない
      createdAt: apiTopic.createdAt,
      updatedAt: apiTopic.updatedAt,
    };
  }
}
