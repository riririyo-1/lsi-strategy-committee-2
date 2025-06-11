"use client";

import { useI18n } from "@/features/i18n/hooks/useI18n";
import { 
  MAIN_CATEGORIES, 
  SUB_CATEGORIES, 
  isMainCategory, 
  isSubCategory,
  type MainCategoryId,
  type SubCategoryId
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

    if (isMainCategory(categoryId)) {
      return t(`categories.main.${categoryId}`, { defaultValue: categoryId });
    }

    if (isSubCategory(categoryId)) {
      return t(`categories.sub.${categoryId}`, { defaultValue: categoryId });
    }

    // 未知のカテゴリIDの場合はそのまま返す
    return categoryId;
  };

  /**
   * 大カテゴリのリストを取得（表示名付き）
   */
  const getMainCategories = () => {
    return MAIN_CATEGORIES.map(cat => ({
      id: cat.id,
      name: t(`categories.main.${cat.id}`, { defaultValue: cat.id })
    }));
  };

  /**
   * 小カテゴリのリストを取得（表示名付き）
   */
  const getSubCategories = () => {
    return SUB_CATEGORIES.map(cat => ({
      id: cat.id,
      name: t(`categories.sub.${cat.id}`, { defaultValue: cat.id })
    }));
  };

  return {
    getCategoryName,
    getMainCategories,
    getSubCategories,
  };
}