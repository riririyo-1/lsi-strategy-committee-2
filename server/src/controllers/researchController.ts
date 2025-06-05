import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { researchService } from "../services/researchService";
import { Prisma } from "@prisma/client";

export class ResearchController {
  // 全Research取得
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const researches = await researchService.findAll();
      res.json(researches);
    } catch (error) {
      console.error("Error fetching research:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // 単一Research取得
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const research = await researchService.findById(id);

      if (!research) {
        res.status(404).json({ error: "Research not found" });
        return;
      }

      res.json(research);
    } catch (error) {
      console.error("Error fetching research:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Research作成
  async create(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const research = await researchService.create(req.body);
      res.status(201).json(research);
    } catch (error) {
      console.error("Error creating research:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Research更新
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const research = await researchService.update(id, req.body);
      res.json(research);
    } catch (error) {
      console.error("Error updating research:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          res.status(404).json({ error: "Research not found (Prisma Error P2025)" });
        } else {
          res.status(500).json({ error: "A Prisma error occurred", code: error.code });
        }
      } else if (error instanceof Error) {
        res.status(500).json({ error: "Internal server error", message: error.message });
      } else {
        res.status(500).json({ error: "An unknown error occurred" });
      }
    }
  }

  // Research削除
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await researchService.delete(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting research:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          res.status(404).json({ error: "Research not found (Prisma Error P2025)" });
        } else {
          res.status(500).json({ error: "A Prisma error occurred", code: error.code });
        }
      } else if (error instanceof Error) {
        res.status(500).json({ error: "Internal server error", message: error.message });
      } else {
        res.status(500).json({ error: "An unknown error occurred" });
      }
    }
  }
}

// シングルトンインスタンスをエクスポート
export const researchController = new ResearchController();