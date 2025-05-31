import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { Pool } from "pg";
import axios from "axios";
import { check, validationResult } from "express-validator";

import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";

const app = express();
const port = 4000;

// ─── Middleware ──────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Swagger Setup ───────────────────────────
const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: { title: "Semicon API", version: "1.0.0" },
  },
  apis: [__filename], // 現在のファイル (index.ts) を直接指定
});

app.use(
  "/api-docs",
  ...(process.env.NODE_ENV !== "production"
    ? [
        (req: Request, _res: Response, next: NextFunction) => {
          console.log(`[Swagger] ${req.method} ${req.originalUrl}`);
          next();
        },
      ]
    : []),
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { explorer: true })
);

console.log(
  `[Swagger] API docs available at http://localhost:${port}/api-docs`
);

// ─── DB Pool ─────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// TOPICS関連のインメモリストア（テスト/開発用バックアップ）
// 注: 本番環境ではデータベースを使用
const topicsStore: {
  [id: string]: {
    id: string;
    title: string;
    articles: any[];
    categories: { [article_id: string]: { main: string; sub: string[] } };
    template_html?: string;
  };
} = {};

// ─── Routes ───────────────────────────────────

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
app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

/**
 * @swagger
 * /api/articles:
 *   get:
 *     tags: [Articles]
 *     summary: 記事一覧取得
 *     responses:
 *       200:
 *         description: 記事配列を返す
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
app.get("/api/articles", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT id, title, url, published_at, summary, labels, created_at, updated_at 
      FROM articles 
      ORDER BY published_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching articles:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/articles/{id}:
 *   get:
 *     tags: [Articles]
 *     summary: 単一記事取得
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 記事オブジェクトを返す
 *       404:
 *         description: 存在しない
 */
app.get("/api/articles/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM articles WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Article not found" });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching article:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/articles/{id}:
 *   delete:
 *     tags: [Articles]
 *     summary: 単一記事削除
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: 削除成功
 */
app.delete("/api/articles/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM articles WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      res.status(404).json({ error: "Article not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting article:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/articles:
 *   delete:
 *     tags: [Articles]
 *     summary: 複数記事削除
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       204:
 *         description: 削除成功
 */
app.delete("/api/articles", async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      res.status(400).json({ error: "ids array is required" });
      return;
    }

    const result = await pool.query("DELETE FROM articles WHERE id = ANY($1)", [
      ids,
    ]);

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting articles:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/articles/labels:
 *   get:
 *     tags: [Articles]
 *     summary: 全記事ラベル取得
 *     responses:
 *       200:
 *         description: ラベル配列を返す
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 */
app.get("/api/articles/labels", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT unnest(labels) as label 
      FROM articles 
      WHERE labels IS NOT NULL 
      ORDER BY label
    `);

    const labels = result.rows.map((row) => row.label);
    res.json(labels);
  } catch (error) {
    console.error("Error fetching labels:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/categories:
 *   get:
 *     tags: [Categories]
 *     summary: カテゴリ一覧取得
 *     responses:
 *       200:
 *         description: カテゴリ配列を返す
 */
app.get("/api/categories", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT id, name, created_at, updated_at 
      FROM categories 
      ORDER BY name
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/categories:
 *   post:
 *     tags: [Categories]
 *     summary: 新規カテゴリ作成
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: 作成成功
 */
app.post(
  "/api/categories",
  [check("name").notEmpty().withMessage("Name is required")],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { name } = req.body;
      const result = await pool.query(
        "INSERT INTO categories (name) VALUES ($1) RETURNING *",
        [name]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     tags: [Categories]
 *     summary: カテゴリ更新
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: 更新成功
 *       404:
 *         description: 存在しない
 */
app.put(
  "/api/categories/:id",
  [check("name").notEmpty().withMessage("Name is required")],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { id } = req.params;
      const { name } = req.body;

      const result = await pool.query(
        "UPDATE categories SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
        [name, id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: "Category not found" });
        return;
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     tags: [Categories]
 *     summary: カテゴリ削除
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: 削除成功
 *       404:
 *         description: 存在しない
 */
app.delete("/api/categories/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM categories WHERE id = $1", [
      id,
    ]);

    if (result.rowCount === 0) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/topics:
 *   get:
 *     tags: [Topics]
 *     summary: TOPICS一覧取得
 *     responses:
 *       200:
 *         description: TOPICS配列を返す
 */
app.get("/api/topics", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT id, title, created_at, updated_at 
      FROM topics 
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching topics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/topics:
 *   post:
 *     tags: [Topics]
 *     summary: 新規TOPICS作成
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               articles:
 *                 type: array
 *                 items:
 *                   type: object
 *               categories:
 *                 type: object
 *     responses:
 *       201:
 *         description: 作成成功
 */
app.post(
  "/api/topics",
  [check("title").notEmpty().withMessage("Title is required")],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { title, articles, categories } = req.body;
      const topicId = `topic_${Date.now()}`;

      // インメモリストアに保存（テスト用）
      topicsStore[topicId] = {
        id: topicId,
        title,
        articles: articles || [],
        categories: categories || {},
      };

      res.status(201).json({ id: topicId, title, articles, categories });
    } catch (error) {
      console.error("Error creating topic:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * @swagger
 * /api/topics/{id}:
 *   get:
 *     tags: [Topics]
 *     summary: 単一TOPICS取得
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: TOPICSオブジェクトを返す
 *       404:
 *         description: 存在しない
 */
app.get("/api/topics/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const topic = topicsStore[id];

  if (!topic) {
    res.status(404).json({ error: "Topic not found" });
    return;
  }

  res.json(topic);
});

/**
 * @swagger
 * /api/topics/{id}:
 *   put:
 *     tags: [Topics]
 *     summary: TOPICS更新
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               articles:
 *                 type: array
 *                 items:
 *                   type: object
 *               categories:
 *                 type: object
 *     responses:
 *       200:
 *         description: 更新成功
 *       404:
 *         description: 存在しない
 */
app.put(
  "/api/topics/:id",
  [check("title").notEmpty().withMessage("Title is required")],
  (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id } = req.params;
    const topic = topicsStore[id];

    if (!topic) {
      res.status(404).json({ error: "Topic not found" });
      return;
    }

    const { title, articles, categories } = req.body;

    topicsStore[id] = {
      ...topic,
      title: title || topic.title,
      articles: articles || topic.articles,
      categories: categories || topic.categories,
    };

    res.json(topicsStore[id]);
  }
);

/**
 * @swagger
 * /api/topics/{id}/article/{article_id}/category:
 *   patch:
 *     tags: [Topics]
 *     summary: 記事ごとのカテゴリ編集
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: TOPICS ID
 *       - in: path
 *         name: article_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 記事ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               main:
 *                 type: string
 *               sub:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: 編集成功
 */
app.patch(
  "/api/topics/:id/article/:article_id/category",
  (req: Request, res: Response) => {
    const { id, article_id } = req.params;
    const { main, sub } = req.body;
    const topic = topicsStore[id];

    if (!topic) {
      res.status(404).json({ error: "Topic not found" });
      return;
    }

    if (!topic.categories) {
      topic.categories = {};
    }

    topic.categories[article_id] = { main, sub: sub || [] };

    res.json({ success: true, categories: topic.categories[article_id] });
  }
);

/**
 * @swagger
 * /api/topics/{id}/categorize:
 *   post:
 *     tags: [Topics]
 *     summary: LLM自動分類
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: TOPICS ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               article_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: カテゴリ分類結果
 */
app.post("/api/topics/:id/categorize", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { article_ids } = req.body;
    const topic = topicsStore[id];

    if (!topic) {
      res.status(404).json({ error: "Topic not found" });
      return;
    }

    if (!article_ids || !Array.isArray(article_ids)) {
      res.status(400).json({ error: "article_ids array is required" });
      return;
    }

    // LLM自動分類の模擬実装
    const categorizedResults = article_ids.map((articleId: number) => ({
      article_id: articleId,
      main: "Technology",
      sub: ["AI", "Machine Learning"],
      confidence: 0.95,
    }));

    // 結果をトピックに保存
    if (!topic.categories) {
      topic.categories = {};
    }

    categorizedResults.forEach((result) => {
      topic.categories[result.article_id] = {
        main: result.main,
        sub: result.sub,
      };
    });

    res.json({
      success: true,
      results: categorizedResults,
      message: "LLM categorization completed",
    });
  } catch (error) {
    console.error("Error in LLM categorization:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/topics/{id}/export:
 *   post:
 *     tags: [Topics]
 *     summary: 配信テンプレートHTML出力
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: テンプレートHTML
 */
app.post("/api/topics/:id/export", (req: Request, res: Response) => {
  const { id } = req.params;
  const topic = topicsStore[id];

  if (!topic) {
    res.status(404).json({ error: "Topic not found" });
    return;
  }

  // 簡単なHTMLテンプレート生成
  const html = `
    <h1>${topic.title}</h1>
    <div class="articles">
      ${topic.articles
        .map(
          (article: any, index: number) => `
        <div class="article">
          <h3>${article.title || `Article ${index + 1}`}</h3>
          <p>${article.summary || "No summary available"}</p>
        </div>
      `
        )
        .join("")}
    </div>
  `;

  topic.template_html = html;

  res.json({ html, success: true });
});

/**
 * @swagger
 * /api/crawl:
 *   post:
 *     tags: [Batch]
 *     summary: 記事収集バッチ実行
 *     responses:
 *       200:
 *         description: 実行結果
 */
app.post("/api/crawl", async (req: Request, res: Response) => {
  try {
    // Pipeline APIを呼び出し（実際の実装では別サービス）
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
});

/**
 * @swagger
 * /api/summarize:
 *   post:
 *     tags: [Batch]
 *     summary: 記事要約・ラベル付けバッチ実行
 *     responses:
 *       200:
 *         description: 実行結果
 */
app.post("/api/summarize", async (req: Request, res: Response) => {
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
});

// ─── Server Start ───────────────────────────
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📚 API Docs: http://localhost:${port}/api-docs`);
});
