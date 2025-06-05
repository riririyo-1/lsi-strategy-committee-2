import { Router, Request, Response } from "express";
import { categoryController } from "../controllers/categoryController";
import { createCategoryValidation, updateCategoryValidation } from "../middleware/validation";

const router = Router();

// カテゴリ一覧取得
router.get("/", (req: Request, res: Response) => categoryController.getAll(req, res));

// カテゴリ作成
router.post("/", createCategoryValidation, (req: Request, res: Response) => categoryController.create(req, res));

// カテゴリ更新
router.put("/:id", updateCategoryValidation, (req: Request, res: Response) => categoryController.update(req, res));

// カテゴリ削除
router.delete("/:id", (req: Request, res: Response) => categoryController.delete(req, res));

export default router;