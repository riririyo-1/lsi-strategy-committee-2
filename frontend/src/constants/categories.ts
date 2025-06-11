/**
 * カテゴリ定義
 * IDはシステム内部で使用し、表示名はi18nで管理
 */

export const MAIN_CATEGORIES = [
  { id: "political" },
  { id: "economical" },
  { id: "social" },
  { id: "technological" },
] as const;

export const SUB_CATEGORIES = [
  { id: "government_initiatives" },
  { id: "ma" },
  { id: "production_tech" },
  { id: "advanced_tech" },
  { id: "social_trends" },
  { id: "market_trends" },
  { id: "research_development" },
  { id: "supply_chain" },
  { id: "environmental" },
  { id: "others" },
] as const;

export type MainCategoryId = typeof MAIN_CATEGORIES[number]['id'];
export type SubCategoryId = typeof SUB_CATEGORIES[number]['id'];

// カテゴリIDの検証関数
export function isMainCategory(categoryId: string): categoryId is MainCategoryId {
  return MAIN_CATEGORIES.some(cat => cat.id === categoryId);
}

export function isSubCategory(categoryId: string): categoryId is SubCategoryId {
  return SUB_CATEGORIES.some(cat => cat.id === categoryId);
}