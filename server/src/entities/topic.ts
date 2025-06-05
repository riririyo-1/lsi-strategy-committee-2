// Topicエンティティ（ドメインモデル）
export class Topic {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly summary: string | null,
    public readonly publishDate: Date | null,
    public readonly content: string | null,
    public readonly viewCount: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  // ビジネスロジック：公開済みかどうか判定
  isPublished(): boolean {
    return this.publishDate !== null && this.publishDate <= new Date();
  }

  // ビジネスロジック：人気トピックかどうか判定
  isPopular(threshold: number = 100): boolean {
    return this.viewCount >= threshold;
  }

  // ビジネスロジック：最近作成されたかどうか判定
  isRecent(days: number = 7): boolean {
    const now = new Date();
    const diff = now.getTime() - this.createdAt.getTime();
    const daysDiff = diff / (1000 * 60 * 60 * 24);
    return daysDiff <= days;
  }
}