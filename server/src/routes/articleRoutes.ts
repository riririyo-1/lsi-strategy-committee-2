import { Router, Request, Response } from "express";
import { articleController } from "../controllers/articleController";
import { createArticleValidation } from "../middleware/validation";

const router = Router();

// ラベル一覧取得（サブルートは先に定義）
router.get("/labels", (req: Request, res: Response) => articleController.getLabels(req, res));

// 記事一覧取得
router.get("/", (req: Request, res: Response) => articleController.getAll(req, res));

// 単一記事取得
router.get("/:id", (req: Request, res: Response) => articleController.getById(req, res));

// 記事作成
router.post("/", createArticleValidation, (req: Request, res: Response) => articleController.create(req, res));

// 単一記事削除
router.delete("/:id", (req: Request, res: Response) => articleController.delete(req, res));

// 複数記事削除
router.delete("/", (req: Request, res: Response) => articleController.deleteMany(req, res));

// バッチ作成
router.post("/batch_create", (req: Request, res: Response) => articleController.batchCreate(req, res));

// RSS収集
router.post("/rss-collect", (req: Request, res: Response) => articleController.collectRSS(req, res));

export default router;