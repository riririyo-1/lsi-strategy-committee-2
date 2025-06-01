export interface Article {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  summary: string;
  labels: string[];
  thumbnailUrl?: string;
  articleUrl: string;
  fullText?: string;
  category?: string;
  subCategory?: string;
  viewCount?: number;
  createdAt: string;
  updatedAt: string;
}
