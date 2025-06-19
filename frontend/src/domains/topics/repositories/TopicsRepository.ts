import { TopicsEntity, TopicsCreateData, TopicsUpdateData } from '../entities/TopicsEntity';
import { TopicsArticleEntity, ArticleEntity } from '../entities/ArticleEntity';

export interface TopicsRepository {
  findAll(): Promise<TopicsEntity[]>;
  findById(id: string): Promise<TopicsEntity | null>;
  findByIdWithArticles(id: string): Promise<{
    topics: TopicsEntity;
    articles: TopicsArticleEntity[];
  } | null>;
  
  create(data: TopicsCreateData): Promise<TopicsEntity>;
  update(id: string, data: TopicsUpdateData): Promise<TopicsEntity>;
  delete(id: string): Promise<boolean>;
  
  addArticle(topicsId: string, articleId: string, categoryId?: string): Promise<TopicsArticleEntity>;
  removeArticle(topicsId: string, articleId: string): Promise<boolean>;
  updateArticleCategory(topicsId: string, articleId: string, categoryId: string): Promise<TopicsArticleEntity>;
  
  generateSummary(topicsId: string, articleIds: string[], summaryStyle?: string): Promise<string>;
  categorizeArticles(topicsId: string, articleIds: string[]): Promise<Map<string, string>>;
  exportToHtml(topicsId: string): Promise<string>;
}

export interface ArticleRepository {
  findAll(filters?: {
    search?: string;
    category?: string;
    source?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<ArticleEntity[]>;
  
  findById(id: string): Promise<ArticleEntity | null>;
  findByIds(ids: string[]): Promise<ArticleEntity[]>;
  
  updateCategory(id: string, categoryId: string): Promise<ArticleEntity>;
}

export interface CategoryRepository {
  findAll(): Promise<Array<{ id: string; name: string }>>;
  findById(id: string): Promise<{ id: string; name: string } | null>;
  create(name: string): Promise<{ id: string; name: string }>;
  update(id: string, name: string): Promise<{ id: string; name: string }>;
  delete(id: string): Promise<boolean>;
}