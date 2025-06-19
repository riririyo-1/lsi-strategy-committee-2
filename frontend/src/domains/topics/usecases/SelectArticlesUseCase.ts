import { ArticleEntity, ArticleBusinessRules } from '../entities/ArticleEntity';
import { ArticleRepository } from '../repositories/TopicsRepository';

export interface SelectArticlesRequest {
  searchQuery?: string;
  category?: string;
  source?: string;
  startDate?: Date;
  endDate?: Date;
  selectedIds?: string[];
}

export interface SelectArticlesResponse {
  availableArticles: ArticleEntity[];
  selectedArticles: ArticleEntity[];
  validationErrors: string[];
}

export class SelectArticlesUseCase {
  constructor(private articleRepository: ArticleRepository) {}

  async execute(request: SelectArticlesRequest): Promise<SelectArticlesResponse> {
    try {
      // 利用可能な記事を検索
      const availableArticles = await this.articleRepository.findAll({
        search: request.searchQuery,
        category: request.category,
        source: request.source,
        startDate: request.startDate,
        endDate: request.endDate,
      });

      // 選択済み記事を取得
      let selectedArticles: ArticleEntity[] = [];
      if (request.selectedIds && request.selectedIds.length > 0) {
        selectedArticles = await this.articleRepository.findByIds(request.selectedIds);
      }

      // バリデーション
      const validationErrors = ArticleBusinessRules.validateArticleSelection(selectedArticles);

      return {
        availableArticles,
        selectedArticles,
        validationErrors
      };
    } catch (error) {
      console.error('Failed to select articles:', error);
      throw new Error('記事の選択に失敗しました');
    }
  }

  async addArticle(currentSelectedIds: string[], newArticleId: string): Promise<string[]> {
    const updatedIds = [...currentSelectedIds];
    
    if (!updatedIds.includes(newArticleId)) {
      updatedIds.push(newArticleId);
    }

    // バリデーション
    const articles = await this.articleRepository.findByIds(updatedIds);
    const validationErrors = ArticleBusinessRules.validateArticleSelection(articles);
    
    if (validationErrors.length > 0) {
      throw new Error(validationErrors[0]);
    }

    return updatedIds;
  }

  async removeArticle(currentSelectedIds: string[], removeArticleId: string): Promise<string[]> {
    return currentSelectedIds.filter(id => id !== removeArticleId);
  }
}