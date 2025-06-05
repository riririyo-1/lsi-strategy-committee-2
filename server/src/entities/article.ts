// Articleエンティティ（ドメインモデル）
export class Article {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly articleUrl: string,
    public readonly source: string,
    public readonly publishedAt: Date,
    public readonly summary: string,
    public readonly labels: string[],
    public readonly thumbnailUrl: string | null,
    public readonly fullText: string | null,
    public readonly category: string | null,
    public readonly subCategory: string | null,
    public readonly viewCount: number | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  // ビジネスロジック例：記事が新しいかどうか判定
  isRecent(days: number = 7): boolean {
    const now = new Date();
    const diff = now.getTime() - this.publishedAt.getTime();
    const daysDiff = diff / (1000 * 60 * 60 * 24);
    return daysDiff <= days;
  }

  // ビジネスロジック例：記事にラベルが存在するか確認
  hasLabel(label: string): boolean {
    return this.labels.includes(label);
  }

  // ビジネスロジック例：URLが有効かどうか確認
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}