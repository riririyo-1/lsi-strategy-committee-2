import { Router, Request, Response } from "express";
import { articleController } from "../controllers/articleController";
import { createArticleValidation } from "../middleware/validation";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Article:
 *       type: object
 *       required:
 *         - title
 *         - url
 *       properties:
 *         id:
 *           type: string
 *           description: 記事ID
 *         title:
 *           type: string
 *           description: 記事タイトル
 *         url:
 *           type: string
 *           description: 記事URL
 *         description:
 *           type: string
 *           description: 記事の説明
 *         content:
 *           type: string
 *           description: 記事本文
 *         summary:
 *           type: string
 *           description: 記事要約
 *         publishedAt:
 *           type: string
 *           format: date-time
 *           description: 公開日時
 *         sourceName:
 *           type: string
 *           description: 情報源名
 *         sourceUrl:
 *           type: string
 *           description: 情報源URL
 *         labels:
 *           type: array
 *           items:
 *             type: string
 *           description: ラベル
 *         category:
 *           type: string
 *           description: カテゴリ
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 作成日時
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新日時
 */

/**
 * @swagger
 * /api/articles/labels:
 *   get:
 *     summary: 記事ラベル一覧取得
 *     tags: [Articles]
 *     responses:
 *       200:
 *         description: ラベル一覧
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 */
router.get("/labels", (req: Request, res: Response) => articleController.getLabels(req, res));

// デバッグ用ルート
router.get("/debug", (req: Request, res: Response) => articleController.getDebugInfo(req, res));

/**
 * @swagger
 * /api/articles:
 *   get:
 *     summary: 記事一覧取得
 *     tags: [Articles]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: ページ番号
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: 取得件数
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 検索キーワード
 *     responses:
 *       200:
 *         description: 記事一覧
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 articles:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Article'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *   post:
 *     summary: 記事作成
 *     tags: [Articles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Article'
 *     responses:
 *       201:
 *         description: 作成された記事
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Article'
 *   delete:
 *     summary: 複数記事削除
 *     tags: [Articles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: 削除完了
 */
router.get("/", (req: Request, res: Response) => articleController.getAll(req, res));
router.post("/", createArticleValidation, (req: Request, res: Response) => articleController.create(req, res));
router.delete("/", (req: Request, res: Response) => articleController.deleteMany(req, res));

/**
 * @swagger
 * /api/articles/{id}:
 *   get:
 *     summary: 単一記事取得
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 記事ID
 *     responses:
 *       200:
 *         description: 記事詳細
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Article'
 *       404:
 *         description: 記事が見つかりません
 *   delete:
 *     summary: 単一記事削除
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 記事ID
 *     responses:
 *       200:
 *         description: 削除完了
 *       404:
 *         description: 記事が見つかりません
 */
router.get("/:id", (req: Request, res: Response) => articleController.getById(req, res));
router.delete("/:id", (req: Request, res: Response) => articleController.delete(req, res));

/**
 * @swagger
 * /api/articles/batch_create:
 *   post:
 *     summary: 記事バッチ作成
 *     tags: [Articles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               articles:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Article'
 *     responses:
 *       201:
 *         description: バッチ作成完了
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 created:
 *                   type: integer
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.post("/batch_create", (req: Request, res: Response) => articleController.batchCreate(req, res));

/**
 * @swagger
 * /api/articles/rss-collect:
 *   post:
 *     summary: RSS記事収集
 *     tags: [Articles]
 *     requestBody:
 *       required: true
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
 *     responses:
 *       200:
 *         description: RSS収集完了
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 collected:
 *                   type: integer
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.post("/rss-collect", (req: Request, res: Response) => articleController.collectRSS(req, res));

export default router;