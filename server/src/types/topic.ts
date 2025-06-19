// Topic関連の型定義
export interface Topic {
  id: string;
  title: string;
  summary: string | null;
  publishDate: Date | null;
  content: string | null;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTopicDto {
  title: string;
  summary?: string;
  publishDate?: string;
  content?: string;
  articles?: string[];
  categories?: { [articleId: string]: { main: string } };
}

export interface UpdateTopicDto {
  title?: string;
  summary?: string;
  publishDate?: string;
  content?: string;
  articles?: string[];
  categories?: { [articleId: string]: { main: string } };
}

export interface UpdateArticleCategoryDto {
  main: string;
}

export interface CategorizeDto {
  article_ids: string[];
}

export interface ExportResult {
  html: string;
  success: boolean;
}

// インメモリストア用の型（一時的）
export interface TopicStore {
  id: string;
  title: string;
  articles: any[];
  categories: { [article_id: string]: { main: string } };
  template_html?: string;
}