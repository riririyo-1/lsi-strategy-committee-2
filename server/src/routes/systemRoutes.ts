import { Router } from "express";
import { systemController } from "../controllers/systemController";

const router = Router();

// ヘルスチェック
router.get("/health", (req, res) => systemController.healthCheck(req, res));

// 記事収集バッチ
router.post("/crawl", (req, res) => systemController.crawl(req, res));

// 記事要約バッチ
router.post("/summarize", (req, res) => systemController.summarize(req, res));

export default router;