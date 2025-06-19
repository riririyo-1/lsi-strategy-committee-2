import { Router, Request, Response } from "express";
import { categoryController } from "../controllers/categoryController";
import { createCategoryValidation, updateCategoryValidation } from "../middleware/validation";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: string
 *           description: カテゴリID
 *         name:
 *           type: string
 *           description: カテゴリ名
 *         description:
 *           type: string
 *           description: カテゴリ説明
 *         color:
 *           type: string
 *           description: カテゴリカラー
 *         isDefault:
 *           type: boolean
 *           description: デフォルトカテゴリかどうか
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
 * /api/categories:
 *   get:
 *     summary: カテゴリ一覧取得
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: カテゴリ一覧
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *   post:
 *     summary: カテゴリ作成
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       201:
 *         description: 作成されたカテゴリ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 */
router.get("/", (req: Request, res: Response) => categoryController.getAll(req, res));
router.post("/", createCategoryValidation, (req: Request, res: Response) => categoryController.create(req, res));

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: カテゴリ更新
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: カテゴリID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       200:
 *         description: 更新されたカテゴリ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: カテゴリが見つかりません
 *   delete:
 *     summary: カテゴリ削除
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: カテゴリID
 *     responses:
 *       200:
 *         description: 削除完了
 *       404:
 *         description: カテゴリが見つかりません
 */
router.put("/:id", updateCategoryValidation, (req: Request, res: Response) => categoryController.update(req, res));
router.delete("/:id", (req: Request, res: Response) => categoryController.delete(req, res));

export default router;