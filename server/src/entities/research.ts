// Researchエンティティ（ドメインモデル）
export class Research {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly summary: string,
    public readonly content: string | null,
    public readonly publishDate: Date,
    public readonly videoUrl: string | null,
    public readonly posterUrl: string | null,
    public readonly pdfUrl: string | null,
    public readonly speaker: string | null,
    public readonly department: string | null,
    public readonly agenda: string[],
    public readonly viewCount: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  // ビジネスロジック：公開済みかどうか判定
  isPublished(): boolean {
    return this.publishDate <= new Date();
  }

  // ビジネスロジック：動画コンテンツがあるかどうか
  hasVideo(): boolean {
    return this.videoUrl !== null && this.videoUrl.trim() !== "";
  }

  // ビジネスロジック：PDFコンテンツがあるかどうか
  hasPdf(): boolean {
    return this.pdfUrl !== null && this.pdfUrl.trim() !== "";
  }

  // ビジネスロジック：人気の調査レポートかどうか判定
  isPopular(threshold: number = 100): boolean {
    return this.viewCount >= threshold;
  }

  // ビジネスロジック：最近公開されたかどうか判定
  isRecent(days: number = 30): boolean {
    const now = new Date();
    const diff = now.getTime() - this.publishDate.getTime();
    const daysDiff = diff / (1000 * 60 * 60 * 24);
    return daysDiff <= days;
  }
}