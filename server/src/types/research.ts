// Research関連の型定義
export interface Research {
  id: string;
  title: string;
  summary: string;
  content: string | null;
  publishDate: Date;
  videoUrl: string | null;
  posterUrl: string | null;
  pdfUrl: string | null;
  speaker: string | null;
  department: string | null;
  agenda: string[];
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateResearchDto {
  title: string;
  summary: string;
  publishDate: string;
  videoUrl?: string;
  posterUrl?: string;
  pdfUrl?: string;
  speaker?: string;
  department?: string;
  agenda?: string[];
  content?: string;
}

export interface UpdateResearchDto {
  title?: string;
  summary?: string;
  publishDate?: string;
  videoUrl?: string;
  posterUrl?: string;
  pdfUrl?: string;
  speaker?: string;
  department?: string;
  agenda?: string[];
  content?: string;
}