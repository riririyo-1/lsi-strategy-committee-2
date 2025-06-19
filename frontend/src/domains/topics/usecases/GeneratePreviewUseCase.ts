import { TopicsEntity } from '../entities/TopicsEntity';
import { TopicsArticleEntity, ArticleBusinessRules } from '../entities/ArticleEntity';
import { TopicsRepository } from '../repositories/TopicsRepository';

export interface GeneratePreviewRequest {
  topicsId: string;
  summaryStyle?: 'overview' | 'detailed' | 'bullet';
}

export interface PreviewData {
  topics: TopicsEntity;
  articlesByCategory: Map<string, TopicsArticleEntity[]>;
  summary: string;
  totalArticles: number;
  categoryCounts: Map<string, number>;
}

export interface GeneratePreviewResponse {
  previewData: PreviewData;
  validationErrors: string[];
}

export interface ExportRequest {
  topicsId: string;
  format: 'html' | 'pdf' | 'json';
}

export interface ExportResponse {
  content: string;
  filename: string;
  mimeType: string;
}

export class GeneratePreviewUseCase {
  constructor(private topicsRepository: TopicsRepository) {}

  async generatePreview(request: GeneratePreviewRequest): Promise<GeneratePreviewResponse> {
    try {
      const topicsData = await this.topicsRepository.findByIdWithArticles(request.topicsId);
      
      if (!topicsData) {
        throw new Error('TOPICSが見つかりません');
      }

      const { topics, articles } = topicsData;

      // 記事をカテゴリ別にグループ化
      const articlesByCategory = ArticleBusinessRules.groupArticlesByCategory(articles);

      // カテゴリ別の記事数を計算
      const categoryCounts = new Map<string, number>();
      articlesByCategory.forEach((categoryArticles, categoryId) => {
        categoryCounts.set(categoryId, categoryArticles.length);
      });

      // サマリー生成（既存がある場合はそれを使用、なければ生成）
      let summary = topics.summary || '';
      if (!summary && articles.length > 0) {
        const articleIds = articles.map(ta => ta.articleId);
        summary = await this.topicsRepository.generateSummary(
          request.topicsId,
          articleIds,
          request.summaryStyle
        );
      }

      const previewData: PreviewData = {
        topics,
        articlesByCategory,
        summary,
        totalArticles: articles.length,
        categoryCounts
      };

      return {
        previewData,
        validationErrors: []
      };
    } catch (error) {
      console.error('Failed to generate preview:', error);
      throw new Error('プレビューの生成に失敗しました');
    }
  }

  async exportTopics(request: ExportRequest): Promise<ExportResponse> {
    try {
      const htmlContent = await this.topicsRepository.exportToHtml(request.topicsId);

      // フォーマットに応じて変換
      switch (request.format) {
        case 'html':
          return {
            content: htmlContent,
            filename: `topics_${request.topicsId}.html`,
            mimeType: 'text/html'
          };
        
        case 'json':
          const previewData = await this.generatePreview({ topicsId: request.topicsId });
          return {
            content: JSON.stringify(previewData.previewData, null, 2),
            filename: `topics_${request.topicsId}.json`,
            mimeType: 'application/json'
          };
        
        case 'pdf':
          // PDF変換は別のサービスで実装
          throw new Error('PDF形式は現在対応していません');
        
        default:
          throw new Error('サポートされていないフォーマットです');
      }
    } catch (error) {
      console.error('Failed to export topics:', error);
      throw new Error('TOPICSのエクスポートに失敗しました');
    }
  }

  async getViewModes(): Promise<Array<{ id: string; name: string; description: string }>> {
    return [
      {
        id: 'table',
        name: 'テーブル表示',
        description: '記事を表形式で一覧表示'
      },
      {
        id: 'card',
        name: 'カード表示',
        description: '記事をカード形式で視覚的に表示'
      },
      {
        id: 'preview',
        name: 'プレビュー表示',
        description: 'TOPICSの完成形をプレビュー'
      },
      {
        id: '3d',
        name: '立体表示',
        description: '記事間の関連性を立体的に可視化（準備中）'
      }
    ];
  }
}