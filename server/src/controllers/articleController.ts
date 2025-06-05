import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { articleService } from "../services/articleService";
import { rssCollectService } from "../services/rssCollectService";
import { Prisma } from "@prisma/client";

export class ArticleController {
  /**
   * @swagger
   * /api/articles:
   *   get:
   *     tags: [Articles]
   *     summary: 記事一覧取得
   *     responses:
   *       200:
   *         description: 記事配列を返す
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      
      // ページネーション対応
      if (req.query.page || req.query.limit) {
        const result = await articleService.findWithPagination(page, limit);
        res.json(result);
      } else {
        // 従来の全件取得（後方互換性）
        const articles = await articleService.findAll();
        res.json(articles);
      }
    } catch (error) {
      console.error("Error fetching articles:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // 単一記事取得
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const article = await articleService.findById(id);

      if (!article) {
        res.status(404).json({ error: "Article not found" });
        return;
      }

      res.json(article);
    } catch (error) {
      console.error("Error fetching article:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  /**
   * @swagger
   * /api/articles:
   *   post:
   *     tags: [Articles]
   *     summary: 新しい記事を追加
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [title, articleUrl, source, publishedAt]
   *             properties:
   *               title:
   *                 type: string
   *               articleUrl:
   *                 type: string
   *               source:
   *                 type: string
   *               publishedAt:
   *                 type: string
   *                 format: date
   *     responses:
   *       201:
   *         description: 記事作成成功
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      // バリデーション結果確認
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          error: "Validation failed",
          details: errors.array(),
        });
        return;
      }

      const article = await articleService.create(req.body);

      res.status(201).json({
        id: article.id,
        message: "記事が正常に追加されました",
      });
    } catch (error: any) {
      console.error("Error creating article:", error);

      // Unique制約違反の場合
      if (error.code === "P2002" && error.meta?.target?.includes("articleUrl")) {
        res.status(409).json({
          error: "この記事URLは既に登録されています",
        });
        return;
      }

      res.status(500).json({ error: "Internal server error" });
    }
  }

  // 単一記事削除
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await articleService.delete(id);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting article:", error);

      if (error.code === "P2025") {
        res.status(404).json({ error: "Article not found" });
        return;
      }

      res.status(500).json({ error: "Internal server error" });
    }
  }

  // 複数記事削除
  async deleteMany(req: Request, res: Response): Promise<void> {
    try {
      const { ids } = req.body;
      if (!ids || !Array.isArray(ids)) {
        res.status(400).json({ error: "ids array is required" });
        return;
      }

      await articleService.deleteMany(ids);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting articles:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // 全ラベル取得
  async getLabels(req: Request, res: Response): Promise<void> {
    try {
      const labels = await articleService.getAllLabels();
      res.json(labels);
    } catch (error) {
      console.error("Error fetching labels:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // バッチ作成
  async batchCreate(req: Request, res: Response): Promise<void> {
    try {
      const { articles } = req.body;

      if (!articles || !Array.isArray(articles)) {
        res.status(400).json({ error: "articles array is required" });
        return;
      }

      console.log(`バッチ作成開始: ${articles.length}件の記事を処理中`);

      const result = await articleService.batchCreate({ articles });

      console.log(
        `バッチ作成完了: 新規=${result.insertedCount}件, 重複=${result.skippedCount}件, 無効=${result.invalidCount}件`
      );

      res.json(result);
    } catch (error) {
      console.error("Error in batch create:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // RSS収集
  async collectRSS(req: Request, res: Response): Promise<void> {
    try {
      const { sources, startDate, endDate } = req.body;

      if (!sources || !Array.isArray(sources) || sources.length === 0) {
        res.status(400).json({ error: "sources array is required" });
        return;
      }

      if (!startDate || !endDate) {
        res.status(400).json({ error: "startDate and endDate are required" });
        return;
      }

      console.log(`RSS収集開始: sources=${sources}, period=${startDate}〜${endDate}`);

      const result = await rssCollectService.collectRSS({
        sources,
        startDate,
        endDate,
      });

      res.json(result);
    } catch (error: any) {
      console.error("RSS収集エラー:", error);

      if (error.message?.includes("Pipeline サービスに接続できません")) {
        res.status(503).json({
          error: "Pipeline サービスに接続できません",
          details: error.message,
        });
      } else {
        res.status(500).json({
          error: "RSS収集処理に失敗しました",
          details: error.message,
        });
      }
    }
  }
}

// シングルトンインスタンスをエクスポート
export const articleController = new ArticleController();