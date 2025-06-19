import { TopicsEntity, TopicsUpdateData, TopicsBusinessRules } from '../entities/TopicsEntity';
import { TopicsRepository } from '../repositories/TopicsRepository';

export interface UpdateTopicsRequest {
  id: string;
  title?: string;
  publishDate?: Date;
  summary?: string;
  articleIds?: string[];
  categories?: { [articleId: string]: string };
}

export interface UpdateTopicsResponse {
  topics: TopicsEntity;
  validationErrors: string[];
}

export class UpdateTopicsUseCase {
  constructor(private topicsRepository: TopicsRepository) {}

  async execute(request: UpdateTopicsRequest): Promise<UpdateTopicsResponse> {
    const updateData: TopicsUpdateData = {};

    if (request.title !== undefined) {
      updateData.title = request.title.trim();
    }

    if (request.publishDate !== undefined) {
      updateData.publishDate = request.publishDate;
    }

    if (request.summary !== undefined) {
      updateData.summary = request.summary.trim();
    }

    const validationErrors = TopicsBusinessRules.validateUpdateData(updateData);
    
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    try {
      const topics = await this.topicsRepository.update(request.id, updateData);

      // 記事とカテゴリの更新
      if (request.articleIds && request.categories) {
        for (const articleId of request.articleIds) {
          const categoryId = request.categories[articleId];
          if (categoryId) {
            await this.topicsRepository.updateArticleCategory(request.id, articleId, categoryId);
          }
        }
      }

      return {
        topics,
        validationErrors: []
      };
    } catch (error) {
      console.error('Failed to update topics:', error);
      throw new Error('TOPICSの更新に失敗しました');
    }
  }
}