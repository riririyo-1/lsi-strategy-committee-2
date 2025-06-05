// Article関連の型定義
export interface Article {
  id: string;
  title: string;
  source: string;
  publishedAt: Date;
  summary: string;
  labels: string[];
  thumbnailUrl: string | null;
  articleUrl: string;
  fullText?: string | null;
  category?: string | null;
  subCategory?: string | null;
  viewCount?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateArticleDto {
  title: string;
  articleUrl: string;
  source: string;
  publishedAt: string;
  summary?: string;
  labels?: string[];
  thumbnailUrl?: string | null;
  fullText?: string | null;
  content?: string | null;  // pipelineからのcontentフィールド（fullTextにマッピングされる）
}

export interface BatchCreateArticlesDto {
  articles: CreateArticleDto[];
}

export interface RSSCollectDto {
  sources: string[];
  startDate: string;
  endDate: string;
}

export interface BatchCreateResult {
  success: boolean;
  insertedCount: number;
  skippedCount: number;
  invalidCount: number;
  invalidItems: Array<{
    index: number;
    article: { title?: string; url?: string };
    errors: string[];
  }>;
}