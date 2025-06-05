import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { categoryService } from "../services/categoryService";

export class CategoryController {
  // 全カテゴリ取得
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const categories = await categoryService.findAll();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // カテゴリ作成
  async create(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const category = await categoryService.create(req.body);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // カテゴリ更新
  async update(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { id } = req.params;
      const category = await categoryService.update(id, req.body);
      res.json(category);
    } catch (error: any) {
      console.error("Error updating category:", error);

      if (error.code === "P2025") {
        res.status(404).json({ error: "Category not found" });
        return;
      }

      res.status(500).json({ error: "Internal server error" });
    }
  }

  // カテゴリ削除
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await categoryService.delete(id);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting category:", error);

      if (error.code === "P2025") {
        res.status(404).json({ error: "Category not found" });
        return;
      }

      res.status(500).json({ error: "Internal server error" });
    }
  }
}

// シングルトンインスタンスをエクスポート
export const categoryController = new CategoryController();