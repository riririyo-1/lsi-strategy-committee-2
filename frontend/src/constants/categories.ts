/**
 * カテゴリ定義
 * IDはシステム内部で使用し、表示名はi18nで管理
 */

export const CATEGORIES = [
  { id: "political" },
  { id: "economical" },
  { id: "social" },
  { id: "technological" },
] as const;

export type CategoryId = typeof CATEGORIES[number]['id'];

// カテゴリIDの検証関数
export function isCategory(categoryId: string): categoryId is CategoryId {
  return CATEGORIES.some(cat => cat.id === categoryId);
}