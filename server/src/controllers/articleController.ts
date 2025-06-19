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
      
      // フィルターパラメータを取得
      const filters = {
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        labelTags: req.query.labelTags ? (req.query.labelTags as string).split(',') : undefined,
        searchQuery: req.query.searchQuery as string,
        sourceFilter: req.query.sourceFilter as string,
      };
      
      // 空の値を除去
      Object.keys(filters).forEach(key => {
        if (!filters[key as keyof typeof filters]) {
          delete filters[key as keyof typeof filters];
        }
      });
      
      // ページネーション対応
      if (req.query.page || req.query.limit || Object.keys(filters).length > 0) {
        const result = await articleService.findWithPagination(page, limit, filters);
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
      console.log("🗑️ DELETE /api/articles - 複数記事削除開始");
      const { ids } = req.body;
      console.log("🗑️ 削除対象IDs:", ids);
      
      if (!ids || !Array.isArray(ids)) {
        console.log("❌ 無効なリクエスト: ids array is required");
        res.status(400).json({ error: "ids array is required" });
        return;
      }

      console.log(`🗑️ ${ids.length}件の記事を削除中...`);
      await articleService.deleteMany(ids);
      console.log("✅ 記事削除完了");
      res.status(204).send();
    } catch (error) {
      console.error("❌ 記事削除エラー:", error);
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

  // デバッグ用：記事のデータ構造確認
  async getDebugInfo(req: Request, res: Response): Promise<void> {
    try {
      const articles = await articleService.findAll();
      const sampleArticles = articles.slice(0, 5); // 最初の5件のみ
      
      const debugInfo = {
        totalCount: articles.length,
        sampleArticles: sampleArticles.map(article => ({
          id: article.id,
          title: article.title?.substring(0, 50) + "...",
          source: article.source,
          publishedAt: article.publishedAt,
          labels: article.labels,
          labelsType: typeof article.labels,
          labelsLength: Array.isArray(article.labels) ? article.labels.length : 'not array',
          summary: article.summary ? article.summary.substring(0, 100) + "..." : null,
          summaryLength: article.summary?.length || 0
        })),
        distinctSources: [...new Set(articles.map(a => a.source))],
        distinctLabels: [...new Set(articles.flatMap(a => Array.isArray(a.labels) ? a.labels : []))],
        dateRange: {
          earliest: articles.reduce((min, article) => 
            new Date(article.publishedAt) < new Date(min.publishedAt) ? article : min
          ).publishedAt,
          latest: articles.reduce((max, article) => 
            new Date(article.publishedAt) > new Date(max.publishedAt) ? article : max
          ).publishedAt
        }
      };
      
      res.json(debugInfo);
    } catch (error) {
      console.error("Error fetching debug info:", error);
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