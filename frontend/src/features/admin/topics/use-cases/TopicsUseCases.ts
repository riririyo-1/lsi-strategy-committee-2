import { Topic } from "@/types/topic";
import {
  GetTopicsParams,
  GetTopicsResult,
  ITopicsRepository,
} from "../ports/ITopicsRepository";

export class GetTopicsUseCase {
  constructor(private readonly topicsRepository: ITopicsRepository) {}

  async execute(params: GetTopicsParams): Promise<GetTopicsResult> {
    return await this.topicsRepository.getTopics(params);
  }
}

export class GetTopicByIdUseCase {
  constructor(private readonly topicsRepository: ITopicsRepository) {}

  async execute(id: string): Promise<Topic> {
    return await this.topicsRepository.getTopicById(id);
  }
}

export class CreateTopicUseCase {
  constructor(private readonly topicsRepository: ITopicsRepository) {}

  async execute(
    topic: Omit<Topic, "id" | "createdAt" | "updatedAt">
  ): Promise<Topic> {
    return await this.topicsRepository.createTopic(topic);
  }
}

export class UpdateTopicUseCase {
  constructor(private readonly topicsRepository: ITopicsRepository) {}

  async execute(id: string, topic: Partial<Topic>): Promise<Topic> {
    return await this.topicsRepository.updateTopic(id, topic);
  }
}

export class DeleteTopicUseCase {
  constructor(private readonly topicsRepository: ITopicsRepository) {}

  async execute(id: string): Promise<boolean> {
    return await this.topicsRepository.deleteTopic(id);
  }
}
