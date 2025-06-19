import { Router, Request, Response } from "express";
import { researchController } from "../controllers/researchController";
import { createResearchValidation } from "../middleware/validation";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Research:
 *       type: object
 *       required:
 *         - title
 *         - content
 *       properties:
 *         id:
 *           type: string
 *           description: 研究レポートID
 *         title:
 *           type: string
 *           description: レポートタイトル
 *         content:
 *           type: string
 *           description: レポート内容
 *         summary:
 *           type: string
 *           description: レポート要約
 *         status:
 *           type: string
 *           enum: [draft, published, archived]
 *           description: ステータス
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: タグ
 *         author:
 *           type: string
 *           description: 著者
 *         publishedAt:
 *           type: string
 *           format: date-time
 *           description: 公開日時
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
 * /api/research:
 *   get:
 *     summary: 研究レポート一覧取得
 *     tags: [Research]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: ステータス
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: 著者
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
 *     responses:
 *       200:
 *         description: 研究レポート一覧
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reports:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Research'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *   post:
 *     summary: 研究レポート作成
 *     tags: [Research]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Research'
 *     responses:
 *       201:
 *         description: 作成された研究レポート
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Research'
 */
router.get("/", (req: Request, res: Response) => researchController.getAll(req, res));
router.post("/", createResearchValidation, (req: Request, res: Response) => researchController.create(req, res));

/**
 * @swagger
 * /api/research/{id}:
 *   get:
 *     summary: 単一研究レポート取得
 *     tags: [Research]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 研究レポートID
 *     responses:
 *       200:
 *         description: 研究レポート詳細
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Research'
 *       404:
 *         description: 研究レポートが見つかりません
 *   put:
 *     summary: 研究レポート更新
 *     tags: [Research]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 研究レポートID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Research'
 *     responses:
 *       200:
 *         description: 更新された研究レポート
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Research'
 *       404:
 *         description: 研究レポートが見つかりません
 *   delete:
 *     summary: 研究レポート削除
 *     tags: [Research]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 研究レポートID
 *     responses:
 *       200:
 *         description: 削除完了
 *       404:
 *         description: 研究レポートが見つかりません
 */
router.get("/:id", (req: Request, res: Response) => researchController.getById(req, res));
router.put("/:id", (req: Request, res: Response) => researchController.update(req, res));
router.delete("/:id", (req: Request, res: Response) => researchController.delete(req, res));

export default router;