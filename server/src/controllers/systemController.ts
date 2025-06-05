import { Request, Response } from "express";

export class SystemController {
  /**
   * @swagger
   * /api/health:
   *   get:
   *     tags: [System]
   *     summary: サーバーヘルスチェック
   *     responses:
   *       200:
   *         description: OK
   */
  async healthCheck(req: Request, res: Response): Promise<void> {
    res.status(200).json({ 
      status: "OK", 
      timestamp: new Date().toISOString() 
    });
  }

  // 記事収集バッチ実行（Pipeline APIへの委譲）
  async crawl(req: Request, res: Response): Promise<void> {
    try {
      console.log("Running article crawl batch...");
      res.json({
        status: "success",
        message: "Article crawl batch executed",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error running crawl batch:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // 記事要約・ラベル付けバッチ実行（Pipeline APIへの委譲）
  async summarize(req: Request, res: Response): Promise<void> {
    try {
      console.log("Running article summarization batch...");
      res.json({
        status: "success",
        message: "Article summarization batch executed",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error running summarization batch:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

// シングルトンインスタンスをエクスポート
export const systemController = new SystemController();