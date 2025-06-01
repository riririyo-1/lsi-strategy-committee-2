export interface TrendReport {
  id: string;
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
