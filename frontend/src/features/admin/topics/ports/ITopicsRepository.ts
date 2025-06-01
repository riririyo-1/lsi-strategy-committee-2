import { Topic } from "@/types/topic";

export interface GetTopicsParams {
  query?: string;
  page?: number;
  pageSize?: number;
}

export interface GetTopicsResult {
  topics: Topic[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ITopicsRepository {
  getTopics(params: GetTopicsParams): Promise<GetTopicsResult>;
  getTopicById(id: string): Promise<Topic>;
  createTopic(
    topic: Omit<Topic, "id" | "createdAt" | "updatedAt">
  ): Promise<Topic>;
  updateTopic(id: string, topic: Partial<Topic>): Promise<Topic>;
  deleteTopic(id: string): Promise<boolean>;
}
