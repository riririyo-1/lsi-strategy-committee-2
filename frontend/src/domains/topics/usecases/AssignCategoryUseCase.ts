import { ArticleBusinessRules, TopicsArticleEntity } from '../entities/ArticleEntity';
import { TopicsRepository, CategoryRepository } from '../repositories/TopicsRepository';

export interface AssignCategoryRequest {
  topicsId: string;
  articleId: string;
  categoryId: string;
}

export interface AssignCategoryResponse {
  topicsArticle: TopicsArticleEntity;
  validationErrors: string[];
}

export interface AutoCategorizeRequest {
  topicsId: string;
  articleIds: string[];
}

export interface AutoCategorizeResponse {
  categorizedArticles: Map<string, string>; // articleId -> categoryId
  validationErrors: string[];
}

export class AssignCategoryUseCase {
  constructor(
    private topicsRepository: TopicsRepository,
    private categoryRepository: CategoryRepository
  ) {}

  async assignCategory(request: AssignCategoryRequest): Promise<AssignCategoryResponse> {
    const validationErrors = ArticleBusinessRules.validateCategoryAssignment(
      request.articleId,
      request.categoryId
    );
    
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    // カテゴリの存在確認
    const category = await this.categoryRepository.findById(request.categoryId);
    if (!category) {
      throw new Error('指定されたカテゴリが見つかりません');
    }

    try {
      const topicsArticle = await this.topicsRepository.updateArticleCategory(
        request.topicsId,
        request.articleId,
        request.categoryId
      );

      return {
        topicsArticle,
        validationErrors: []
      };
    } catch (error) {
      console.error('Failed to assign category:', error);
      throw new Error('カテゴリの割り当てに失敗しました');
    }
  }

  async autoCategorize(request: AutoCategorizeRequest): Promise<AutoCategorizeResponse> {
    if (!request.articleIds || request.articleIds.length === 0) {
      throw new Error('記事IDが指定されていません');
    }

    try {
      const categorizedArticles = await this.topicsRepository.categorizeArticles(
        request.topicsId,
        request.articleIds
      );

      return {
        categorizedArticles,
        validationErrors: []
      };
    } catch (error) {
      console.error('Failed to auto-categorize articles:', error);
      throw new Error('自動カテゴリ分類に失敗しました');
    }
  }

  async batchAssignCategories(
    topicsId: string,
    categoryAssignments: { articleId: string; categoryId: string }[]
  ): Promise<TopicsArticleEntity[]> {
    const results: TopicsArticleEntity[] = [];

    for (const assignment of categoryAssignments) {
      try {
        const result = await this.assignCategory({
          topicsId,
          articleId: assignment.articleId,
          categoryId: assignment.categoryId
        });
        results.push(result.topicsArticle);
      } catch (error) {
        console.error(`Failed to assign category for article ${assignment.articleId}:`, error);
      }
    }

    return results;
  }
}