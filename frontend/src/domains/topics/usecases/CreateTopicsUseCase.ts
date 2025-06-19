import { TopicsEntity, TopicsCreateData, TopicsBusinessRules } from '../entities/TopicsEntity';
import { TopicsRepository } from '../repositories/TopicsRepository';

export interface CreateTopicsRequest {
  title: string;
  publishDate: Date;
  summary?: string;
  articleIds?: string[];
  categories?: { [articleId: string]: string };
}

export interface CreateTopicsResponse {
  topics: TopicsEntity;
  validationErrors: string[];
}

export class CreateTopicsUseCase {
  constructor(private topicsRepository: TopicsRepository) {}

  async execute(request: CreateTopicsRequest): Promise<CreateTopicsResponse> {
    const createData: TopicsCreateData = {
      title: request.title.trim(),
      publishDate: request.publishDate,
      summary: request.summary?.trim(),
    };

    const validationErrors = TopicsBusinessRules.validateCreateData(createData);
    
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    try {
      const topics = await this.topicsRepository.create(createData);

      // 記事がある場合は関連付け
      if (request.articleIds && request.articleIds.length > 0) {
        for (const articleId of request.articleIds) {
          const categoryId = request.categories?.[articleId];
          await this.topicsRepository.addArticle(topics.id, articleId, categoryId);
        }
      }

      return {
        topics,
        validationErrors: []
      };
    } catch (error) {
      console.error('Failed to create topics:', error);
      throw new Error('TOPICSの作成に失敗しました');
    }
  }
}