import { Router, Request, Response } from "express";
import { topicController } from "../controllers/topicController";
import { createTopicsValidation, updateTopicsValidation } from "../middleware/validation";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Topic:
 *       type: object
 *       required:
 *         - title
 *         - year
 *         - month
 *       properties:
 *         id:
 *           type: string
 *           description: トピックID
 *         title:
 *           type: string
 *           description: トピックタイトル
 *         description:
 *           type: string
 *           description: トピック説明
 *         year:
 *           type: integer
 *           description: 対象年
 *         month:
 *           type: integer
 *           description: 対象月
 *         status:
 *           type: string
 *           enum: [draft, published, archived]
 *           description: ステータス
 *         articles:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Article'
 *           description: 関連記事
 *         summary:
 *           type: string
 *           description: トピック要約
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
 * /api/topics:
 *   get:
 *     summary: トピック一覧取得
 *     tags: [Topics]
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: 対象年
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *         description: 対象月
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: ステータス
 *     responses:
 *       200:
 *         description: トピック一覧
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Topic'
 *   post:
 *     summary: トピック作成
 *     tags: [Topics]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Topic'
 *     responses:
 *       201:
 *         description: 作成されたトピック
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Topic'
 */
router.get("/", (req: Request, res: Response) => topicController.getAll(req, res));
router.post("/", createTopicsValidation, (req: Request, res: Response) => topicController.create(req, res));

/**
 * @swagger
 * /api/topics/{id}:
 *   get:
 *     summary: 単一トピック取得
 *     tags: [Topics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: トピックID
 *     responses:
 *       200:
 *         description: トピック詳細
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Topic'
 *       404:
 *         description: トピックが見つかりません
 *   put:
 *     summary: トピック更新
 *     tags: [Topics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: トピックID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Topic'
 *     responses:
 *       200:
 *         description: 更新されたトピック
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Topic'
 *   delete:
 *     summary: トピック削除
 *     tags: [Topics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: トピックID
 *     responses:
 *       200:
 *         description: 削除完了
 *       404:
 *         description: トピックが見つかりません
 */
router.get("/:id", (req: Request, res: Response) => topicController.getById(req, res));
router.put("/:id", updateTopicsValidation, (req: Request, res: Response) => topicController.update(req, res));
router.delete("/:id", (req: Request, res: Response) => topicController.delete(req, res));

/**
 * @swagger
 * /api/topics/{id}/article/{article_id}/category:
 *   patch:
 *     summary: 記事カテゴリ更新
 *     tags: [Topics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: トピックID
 *       - in: path
 *         name: article_id
 *         required: true
 *         schema:
 *           type: string
 *         description: 記事ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *                 description: 新しいカテゴリ
 *     responses:
 *       200:
 *         description: カテゴリ更新完了
 */
router.patch("/:id/article/:article_id/category", (req: Request, res: Response) => 
  topicController.updateArticleCategory(req, res)
);

/**
 * @swagger
 * /api/topics/{id}/categorize:
 *   post:
 *     summary: LLM自動分類
 *     tags: [Topics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: トピックID
 *     responses:
 *       200:
 *         description: 自動分類完了
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categorized:
 *                   type: integer
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.post("/:id/categorize", (req: Request, res: Response) => topicController.categorize(req, res));

/**
 * @swagger
 * /api/topics/{id}/generate-summary:
 *   post:
 *     summary: 月次サマリ生成
 *     tags: [Topics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: トピックID
 *     responses:
 *       200:
 *         description: サマリ生成完了
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 summary:
 *                   type: string
 *                 generatedAt:
 *                   type: string
 *                   format: date-time
 */
router.post("/:id/generate-summary", (req: Request, res: Response) => topicController.generateSummary(req, res));

/**
 * @swagger
 * /api/topics/{id}/export:
 *   post:
 *     summary: HTMLテンプレート出力
 *     tags: [Topics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: トピックID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               format:
 *                 type: string
 *                 enum: [html, pdf]
 *                 default: html
 *     responses:
 *       200:
 *         description: エクスポート完了
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exportUrl:
 *                   type: string
 *                 format:
 *                   type: string
 */
router.post("/:id/export", (req: Request, res: Response) => topicController.export(req, res));

export default router;