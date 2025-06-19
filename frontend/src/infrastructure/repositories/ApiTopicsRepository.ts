import {
  TopicsRepository,
  ArticleRepository,
  CategoryRepository,
  TopicsEntity,
  TopicsCreateData,
  TopicsUpdateData,
  TopicsArticleEntity,
  ArticleEntity,
} from '@/domains/topics';
import { topicsApi, articlesApi } from '@/lib/apiClient';

export class ApiTopicsRepository implements TopicsRepository {
  async findAll(): Promise<TopicsEntity[]> {
    try {
      const response = await topicsApi.getAll();
      return response.data.map((data: any) => this.mapToTopicsEntity(data));
    } catch (error) {
      console.error('Failed to fetch topics:', error);
      throw new Error('TOPICSの取得に失敗しました');
    }
  }

  async findById(id: string): Promise<TopicsEntity | null> {
    try {
      const response = await topicsApi.getById(id);
      return this.mapToTopicsEntity(response.data);
    } catch (error) {
      console.error('Failed to fetch topic:', error);
      return null;
    }
  }

  async findByIdWithArticles(id: string): Promise<{
    topics: TopicsEntity;
    articles: TopicsArticleEntity[];
  } | null> {
    try {
      const response = await topicsApi.getById(id);
      const topicsData = response.data;

      const topics = this.mapToTopicsEntity(topicsData);
      const articles = topicsData.articles
        ? topicsData.articles.map(this.mapToTopicsArticleEntity)
        : [];

      return { topics, articles };
    } catch (error) {
      console.error('Failed to fetch topic with articles:', error);
      return null;
    }
  }

  async create(data: TopicsCreateData): Promise<TopicsEntity> {
    try {
      const response = await topicsApi.create({
        title: data.title,
        publishDate: data.publishDate.toISOString(),
        summary: data.summary,
        content: data.content,
      });
      return this.mapToTopicsEntity(response.data);
    } catch (error) {
      console.error('Failed to create topic:', error);
      throw new Error('TOPICSの作成に失敗しました');
    }
  }

  async update(id: string, data: TopicsUpdateData): Promise<TopicsEntity> {
    try {
      const updatePayload: any = {};
      
      if (data.title !== undefined) updatePayload.title = data.title;
      if (data.publishDate !== undefined) updatePayload.publishDate = data.publishDate.toISOString();
      if (data.summary !== undefined) updatePayload.summary = data.summary;
      if (data.content !== undefined) updatePayload.content = data.content;

      const response = await topicsApi.update(id, updatePayload);
      return this.mapToTopicsEntity(response.data);
    } catch (error) {
      console.error('Failed to update topic:', error);
      throw new Error('TOPICSの更新に失敗しました');
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await topicsApi.delete(id);
      return true;
    } catch (error) {
      console.error('Failed to delete topic:', error);
      throw new Error('TOPICSの削除に失敗しました');
    }
  }

  async addArticle(topicsId: string, articleId: string, categoryId?: string): Promise<TopicsArticleEntity> {
    try {
      // この機能は create/update 時に一括で処理されるため、ここでは仮実装
      const response = await topicsApi.updateArticleCategory(topicsId, articleId, {
        main: categoryId || '',
      });
      
      return this.mapToTopicsArticleEntity(response.data);
    } catch (error) {
      console.error('Failed to add article to topic:', error);
      throw new Error('記事の追加に失敗しました');
    }
  }

  async removeArticle(topicsId: string, articleId: string): Promise<boolean> {
    try {
      // 記事の削除は update API で articles 配列から除外することで実現
      console.log('Remove article functionality should be handled via update API');
      return true;
    } catch (error) {
      console.error('Failed to remove article from topic:', error);
      throw new Error('記事の削除に失敗しました');
    }
  }

  async updateArticleCategory(topicsId: string, articleId: string, categoryId: string): Promise<TopicsArticleEntity> {
    try {
      const response = await topicsApi.updateArticleCategory(topicsId, articleId, {
        main: categoryId,
      });
      
      return this.mapToTopicsArticleEntity(response.data);
    } catch (error) {
      console.error('Failed to update article category:', error);
      throw new Error('記事カテゴリの更新に失敗しました');
    }
  }

  async generateSummary(topicsId: string, articleIds: string[], summaryStyle?: string): Promise<string> {
    try {
      const response = await topicsApi.generateSummary(topicsId, {
        article_ids: articleIds,
        summary_style: summaryStyle || 'overview',
      });

      return response.data.summary || '';
    } catch (error) {
      console.error('Failed to generate summary:', error);
      throw new Error('サマリーの生成に失敗しました');
    }
  }

  async categorizeArticles(topicsId: string, articleIds: string[]): Promise<Map<string, string>> {
    try {
      const response = await topicsApi.categorize(topicsId, {
        article_ids: articleIds,
      });

      const categoryMap = new Map<string, string>();
      
      // カテゴリ名からIDへのマッピング（4つのカテゴリのみ）
      const categoryNameToId: { [key: string]: string } = {
        'political': 'political',
        'economical': 'economical', 
        'social': 'social',
        'technological': 'technological',
        '政治': 'political',
        '経済': 'economical',
        '社会': 'social',
        '技術': 'technological',
        // その他のカテゴリは無視
      };
      
      if (response.data.results) {
        response.data.results.forEach((result: any) => {
          if (result.article_id && result.main) {
            const categoryId = categoryNameToId[result.main.toLowerCase()];
            if (categoryId) {
              categoryMap.set(result.article_id, categoryId);
            }
          }
        });
      }

      return categoryMap;
    } catch (error) {
      console.error('Failed to categorize articles:', error);
      throw new Error('記事の自動分類に失敗しました');
    }
  }

  async exportToHtml(topicsId: string): Promise<string> {
    try {
      const response = await topicsApi.export(topicsId);
      return response.data.html || '';
    } catch (error) {
      console.error('Failed to export topic:', error);
      throw new Error('TOPICSのエクスポートに失敗しました');
    }
  }

  private mapToTopicsEntity(data: any): TopicsEntity {
    return {
      id: data.id,
      title: data.title,
      publishDate: new Date(data.publishDate),
      summary: data.summary,
      content: data.content,
      viewCount: data.viewCount || 0,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  }

  private mapToTopicsArticleEntity(data: any): TopicsArticleEntity {
    return {
      id: data.id,
      topicId: data.topicId,
      articleId: data.articleId,
      categoryId: data.categoryId,
      displayOrder: data.displayOrder,
      createdAt: new Date(data.createdAt),
      article: this.mapToArticleEntity(data.article),
      category: data.category ? {
        id: data.category.id,
        name: data.category.name,
        createdAt: new Date(data.category.createdAt),
        updatedAt: new Date(data.category.updatedAt),
      } : undefined,
    };
  }

  private mapToArticleEntity(data: any): ArticleEntity {
    return {
      id: data.id,
      title: data.title,
      source: data.source,
      publishedAt: new Date(data.publishedAt),
      summary: data.summary,
      labels: data.labels || [],
      thumbnailUrl: data.thumbnailUrl,
      articleUrl: data.articleUrl,
      fullText: data.fullText,
      category: data.category,
      subCategory: data.subCategory,
      viewCount: data.viewCount,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  }
}

export class ApiArticleRepository implements ArticleRepository {
  async findAll(filters?: {
    search?: string;
    category?: string;
    source?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<ArticleEntity[]> {
    try {
      const params: any = {};
      
      if (filters?.search) params.search = filters.search;
      if (filters?.category) params.category = filters.category;
      if (filters?.source) params.source = filters.source;
      if (filters?.startDate) params.startDate = filters.startDate.toISOString();
      if (filters?.endDate) params.endDate = filters.endDate.toISOString();

      const response = await articlesApi.getAll(params);
      return response.data.map(this.mapToArticleEntity);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
      throw new Error('記事の取得に失敗しました');
    }
  }

  async findById(id: string): Promise<ArticleEntity | null> {
    try {
      const response = await articlesApi.getById(id);
      return this.mapToArticleEntity(response.data);
    } catch (error) {
      console.error('Failed to fetch article:', error);
      return null;
    }
  }

  async findByIds(ids: string[]): Promise<ArticleEntity[]> {
    try {
      const articles = await Promise.all(
        ids.map(id => this.findById(id))
      );
      return articles.filter((article): article is ArticleEntity => article !== null);
    } catch (error) {
      console.error('Failed to fetch articles by IDs:', error);
      throw new Error('記事の取得に失敗しました');
    }
  }

  async updateCategory(id: string, categoryId: string): Promise<ArticleEntity> {
    try {
      const response = await articlesApi.updateCategory(id, { categoryId });
      return this.mapToArticleEntity(response.data);
    } catch (error) {
      console.error('Failed to update article category:', error);
      throw new Error('記事カテゴリの更新に失敗しました');
    }
  }

  private mapToArticleEntity(data: any): ArticleEntity {
    return {
      id: data.id,
      title: data.title,
      source: data.source,
      publishedAt: new Date(data.publishedAt),
      summary: data.summary,
      labels: data.labels || [],
      thumbnailUrl: data.thumbnailUrl,
      articleUrl: data.articleUrl,
      fullText: data.fullText,
      category: data.category,
      subCategory: data.subCategory,
      viewCount: data.viewCount,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  }
}

export class ApiCategoryRepository implements CategoryRepository {
  async findAll(): Promise<Array<{ id: string; name: string }>> {
    try {
      // カテゴリは4つのみに制限
      return [
        { id: 'political', name: '政治' },
        { id: 'economical', name: '経済' },
        { id: 'social', name: '社会' },
        { id: 'technological', name: '技術' },
      ];
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      throw new Error('カテゴリの取得に失敗しました');
    }
  }

  async findById(id: string): Promise<{ id: string; name: string } | null> {
    const categories = await this.findAll();
    return categories.find(cat => cat.id === id) || null;
  }

  async create(name: string): Promise<{ id: string; name: string }> {
    throw new Error('カテゴリの作成は現在サポートされていません');
  }

  async update(id: string, name: string): Promise<{ id: string; name: string }> {
    throw new Error('カテゴリの更新は現在サポートされていません');
  }

  async delete(id: string): Promise<boolean> {
    throw new Error('カテゴリの削除は現在サポートされていません');
  }
}