import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { topicService } from "../services/topicService";

export class TopicController {
  // 全Topics取得
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      console.log("[TopicController] Fetching all topics");
      const topics = await topicService.findAll();
      console.log("[TopicController] Found topics:", topics.length);
      res.json(topics);
    } catch (error) {
      console.error("Error fetching topics:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // 単一Topic取得
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const topic = await topicService.findById(id);

      if (!topic) {
        res.status(404).json({ error: "Topic not found" });
        return;
      }

      res.json(topic);
    } catch (error) {
      console.error("Error fetching topic:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Topic作成
  async create(req: Request, res: Response): Promise<void> {
    try {
      console.log("[TopicController] Creating topic with data:", req.body);
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("[TopicController] Validation errors:", errors.array());
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const topic = await topicService.create(req.body);
      console.log("[TopicController] Topic created successfully:", topic);
      res.status(201).json(topic);
    } catch (error) {
      console.error("Error creating topic:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Topic更新
  async update(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { id } = req.params;
      const topic = await topicService.update(id, req.body);

      if (!topic) {
        res.status(404).json({ error: "Topic not found" });
        return;
      }

      res.json(topic);
    } catch (error) {
      console.error("Error updating topic:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Topic削除
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await topicService.delete(id);

      if (!success) {
        res.status(404).json({ error: "Topic not found" });
        return;
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting topic:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // 記事カテゴリ更新
  async updateArticleCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id, article_id } = req.params;
      const { main, sub } = req.body;

      const result = await topicService.updateArticleCategory(
        id, 
        article_id, 
        { main }
      );

      res.json(result);
    } catch (error: any) {
      console.error("Error updating article category:", error);
      
      if (error.message === "Topic not found") {
        res.status(404).json({ error: "Topic not found" });
        return;
      }

      res.status(500).json({ error: "Internal server error" });
    }
  }

  // LLM自動分類
  async categorize(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { article_ids } = req.body;

      if (!article_ids || !Array.isArray(article_ids)) {
        res.status(400).json({ error: "article_ids array is required" });
        return;
      }

      const result = await topicService.categorize(id, { article_ids });
      res.json(result);
    } catch (error: any) {
      console.error("Error in LLM categorization:", error);
      
      if (error.message === "Topic not found") {
        res.status(404).json({ error: "Topic not found" });
        return;
      }

      res.status(500).json({ error: "Internal server error" });
    }
  }

  // 月次サマリ生成
  async generateSummary(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { article_ids, summary_style = "overview" } = req.body;

      if (!article_ids || !Array.isArray(article_ids)) {
        res.status(400).json({ error: "article_ids array is required" });
        return;
      }

      const result = await topicService.generateSummary(id, { article_ids, summary_style });
      res.json(result);
    } catch (error: any) {
      console.error("Error generating summary:", error);
      
      if (error.message === "Topic not found") {
        res.status(404).json({ error: "Topic not found" });
        return;
      }

      res.status(500).json({ error: "Internal server error" });
    }
  }

  // HTMLテンプレート出力
  async export(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await topicService.export(id);
      res.json(result);
    } catch (error: any) {
      console.error("Error exporting topic:", error);
      
      if (error.message === "Topic not found") {
        res.status(404).json({ error: "Topic not found" });
        return;
      }

      res.status(500).json({ error: "Internal server error" });
    }
  }
}

// シングルトンインスタンスをエクスポート
export const topicController = new TopicController();