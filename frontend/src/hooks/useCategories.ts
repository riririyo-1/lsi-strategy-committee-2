"use client";

import { useI18n } from "@/features/i18n/hooks/useI18n";
import { 
  CATEGORIES, 
  isCategory,
  type CategoryId
} from "@/constants/categories";

export function useCategories() {
  const { t } = useI18n();

  /**
   * カテゴリIDから表示名を取得
   */
  const getCategoryName = (categoryId: string | undefined): string => {
    if (!categoryId) {
      return t("categories.uncategorized", { defaultValue: "未分類" });
    }

    if (isCategory(categoryId)) {
      return t(`categories.${categoryId}`, { defaultValue: categoryId });
    }

    // 未知のカテゴリIDの場合はそのまま返す
    return categoryId;
  };

  /**
   * カテゴリのリストを取得（表示名付き）
   */
  const getCategories = () => {
    return CATEGORIES.map(cat => ({
      id: cat.id,
      name: t(`categories.${cat.id}`, { defaultValue: cat.id })
    }));
  };

  return {
    getCategoryName,
    getCategories,
  };
}