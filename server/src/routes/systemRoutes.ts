import { Router } from "express";
import { systemController } from "../controllers/systemController";

const router = Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: システムヘルスチェック
 *     tags: [System]
 *     responses:
 *       200:
 *         description: システム正常
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   description: アップタイム（秒）
 *                 version:
 *                   type: string
 *                   description: アプリケーションバージョン
 */
router.get("/health", (req, res) => systemController.healthCheck(req, res));

/**
 * @swagger
 * /api/crawl:
 *   post:
 *     summary: 記事収集バッチ実行
 *     tags: [System]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sources:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                     name:
 *                       type: string
 *               limit:
 *                 type: integer
 *                 description: 収集件数制限
 *     responses:
 *       200:
 *         description: バッチ実行完了
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 collected:
 *                   type: integer
 *                 startedAt:
 *                   type: string
 *                   format: date-time
 *                 completedAt:
 *                   type: string
 *                   format: date-time
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.post("/crawl", (req, res) => systemController.crawl(req, res));

/**
 * @swagger
 * /api/summarize:
 *   post:
 *     summary: 記事要約バッチ実行
 *     tags: [System]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               articleIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 要約対象記事ID（未指定の場合は全記事）
 *               batchSize:
 *                 type: integer
 *                 description: バッチサイズ
 *                 default: 10
 *     responses:
 *       200:
 *         description: バッチ実行完了
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 summarized:
 *                   type: integer
 *                 startedAt:
 *                   type: string
 *                   format: date-time
 *                 completedAt:
 *                   type: string
 *                   format: date-time
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.post("/summarize", (req, res) => systemController.summarize(req, res));

export default router;