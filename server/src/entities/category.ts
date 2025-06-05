// Categoryエンティティ（ドメインモデル）
export class Category {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  // ビジネスロジック：カテゴリ名の検証
  static isValidName(name: string): boolean {
    return name.trim().length > 0 && name.length <= 100;
  }

  // ビジネスロジック：最近作成されたかどうか判定
  isRecent(days: number = 7): boolean {
    const now = new Date();
    const diff = now.getTime() - this.createdAt.getTime();
    const daysDiff = diff / (1000 * 60 * 60 * 24);
    return daysDiff <= days;
  }
}