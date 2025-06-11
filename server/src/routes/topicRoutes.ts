import { Router, Request, Response } from "express";
import { topicController } from "../controllers/topicController";
import { createTopicsValidation, updateTopicsValidation } from "../middleware/validation";

const router = Router();

// Topics一覧取得
router.get("/", (req: Request, res: Response) => topicController.getAll(req, res));

// 単一Topic取得
router.get("/:id", (req: Request, res: Response) => topicController.getById(req, res));

// Topic作成
router.post("/", createTopicsValidation, (req: Request, res: Response) => topicController.create(req, res));

// Topic更新
router.put("/:id", updateTopicsValidation, (req: Request, res: Response) => topicController.update(req, res));

// Topic削除
router.delete("/:id", (req: Request, res: Response) => topicController.delete(req, res));

// 記事カテゴリ更新
router.patch("/:id/article/:article_id/category", (req: Request, res: Response) => 
  topicController.updateArticleCategory(req, res)
);

// LLM自動分類
router.post("/:id/categorize", (req: Request, res: Response) => topicController.categorize(req, res));

// 月次サマリ生成
router.post("/:id/generate-summary", (req: Request, res: Response) => topicController.generateSummary(req, res));

// HTMLテンプレート出力
router.post("/:id/export", (req: Request, res: Response) => topicController.export(req, res));

export default router;