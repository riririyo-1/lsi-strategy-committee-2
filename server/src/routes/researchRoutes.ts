import { Router, Request, Response } from "express";
import { researchController } from "../controllers/researchController";
import { createResearchValidation } from "../middleware/validation";

const router = Router();

// Research一覧取得
router.get("/", (req: Request, res: Response) => researchController.getAll(req, res));

// 単一Research取得
router.get("/:id", (req: Request, res: Response) => researchController.getById(req, res));

// Research作成
router.post("/", createResearchValidation, (req: Request, res: Response) => researchController.create(req, res));

// Research更新
router.put("/:id", (req: Request, res: Response) => researchController.update(req, res));

// Research削除
router.delete("/:id", (req: Request, res: Response) => researchController.delete(req, res));

export default router;