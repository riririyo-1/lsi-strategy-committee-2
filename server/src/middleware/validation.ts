import { check } from "express-validator";

// 記事作成バリデーション
export const createArticleValidation = [
  check("title").notEmpty().withMessage("タイトルは必須です"),
  check("articleUrl").isURL().withMessage("有効なURLを入力してください"),
  check("source").notEmpty().withMessage("出典元は必須です"),
  check("publishedAt").isISO8601().withMessage("有効な日付を入力してください"),
];

// カテゴリ作成バリデーション
export const createCategoryValidation = [
  check("name").notEmpty().withMessage("Name is required"),
];

// カテゴリ更新バリデーション
export const updateCategoryValidation = [
  check("name").notEmpty().withMessage("Name is required"),
];

// Topics作成バリデーション
export const createTopicsValidation = [
  check("title").notEmpty().withMessage("Title is required"),
];

// Topics更新バリデーション
export const updateTopicsValidation = [
  check("title").notEmpty().withMessage("Title is required"),
];

// Research作成バリデーション
export const createResearchValidation = [
  check("title").notEmpty().withMessage("Title is required"),
  check("summary").notEmpty().withMessage("Summary is required"),
  check("publishDate").isISO8601().withMessage("Valid publish date is required"),
];