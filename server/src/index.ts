import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import axios from "axios";
import { check, validationResult } from "express-validator";
import { PrismaClient, Prisma } from "@prisma/client";

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

// ─── Prisma Client ──────────────────────────
const prisma = new PrismaClient();

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
    const articles = await prisma.article.findMany({
      orderBy: {
        publishedAt: "desc",
      },
    });
    res.json(articles);
  } catch (error) {
    console.error("Error fetching articles:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

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
 *             required:
 *               - title
 *               - articleUrl
 *               - source
 *               - publishedAt
 *             properties:
 *               title:
 *                 type: string
 *                 description: 記事タイトル
 *               articleUrl:
 *                 type: string
 *                 description: 記事URL
 *               source:
 *                 type: string
 *                 description: 出典元
 *               publishedAt:
 *                 type: string
 *                 format: date
 *                 description: 公開日 (YYYY-MM-DD形式)
 *               summary:
 *                 type: string
 *                 description: 記事概要
 *               labels:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: ラベル
 *               thumbnailUrl:
 *                 type: string
 *                 description: サムネイル画像URL
 *     responses:
 *       201:
 *         description: 記事作成成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: バリデーションエラー
 *       409:
 *         description: 記事URLが既に存在
 */
app.post(
  "/api/articles",
  [
    check("title").notEmpty().withMessage("タイトルは必須です"),
    check("articleUrl").isURL().withMessage("有効なURLを入力してください"),
    check("source").notEmpty().withMessage("出典元は必須です"),
    check("publishedAt").isDate().withMessage("有効な日付を入力してください"),
  ],
  async (req: Request, res: Response) => {
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

      const {
        title,
        articleUrl,
        source,
        publishedAt,
        summary = "",
        labels = [],
        thumbnailUrl = null,
      } = req.body;

      // Prismaを使用して記事を作成
      const article = await prisma.article.create({
        data: {
          title,
          articleUrl,
          source,
          publishedAt: new Date(publishedAt),
          summary,
          labels,
          thumbnailUrl,
        },
      });

      res.status(201).json({
        id: article.id,
        message: "記事が正常に追加されました",
      });
    } catch (error: any) {
      console.error("Error creating article:", error);

      // Unique制約違反の場合
      if (
        error.code === "P2002" &&
        error.meta?.target?.includes("articleUrl")
      ) {
        res.status(409).json({
          error: "この記事URLは既に登録されています",
        });
        return;
      }

      res.status(500).json({ error: "Internal server error" });
    }
  }
);

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
    const article = await prisma.article.findUnique({
      where: { id },
    });

    if (!article) {
      res.status(404).json({ error: "Article not found" });
      return;
    }

    res.json(article);
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
    const article = await prisma.article.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error: any) {
    console.error("Error deleting article:", error);

    if (error.code === "P2025") {
      res.status(404).json({ error: "Article not found" });
      return;
    }

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

    await prisma.article.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

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
    const articles = await prisma.article.findMany({
      select: {
        labels: true,
      },
      where: {
        labels: {
          isEmpty: false,
        },
      },
    });

    // すべてのラベルを抽出して重複を削除、ソート
    const allLabels = articles.flatMap((article) => article.labels || []);
    const uniqueLabels = [...new Set(allLabels)].sort();

    res.json(uniqueLabels);
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
    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    });
    res.json(categories);
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
      const category = await prisma.category.create({
        data: { name },
      });
      res.status(201).json(category);
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

      const category = await prisma.category.update({
        where: { id },
        data: { name },
      });

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
    await prisma.category.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error: any) {
    console.error("Error deleting category:", error);

    if (error.code === "P2025") {
      res.status(404).json({ error: "Category not found" });
      return;
    }

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
    const topics = await prisma.topic.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    res.json(topics);
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

/**
 * @swagger
 * /api/research:
 *   get:
 *     tags: [Research]
 *     summary: 動向調査一覧取得
 *     responses:
 *       200:
 *         description: 動向調査配列を返す
 */
app.get("/api/research", async (req: Request, res: Response) => {
  try {
    const research = await prisma.research.findMany({
      orderBy: {
        publishDate: "desc",
      },
      select: {
        id: true,
        title: true,
        summary: true,
        publishDate: true,
        videoUrl: true,
        posterUrl: true,
        pdfUrl: true,
        speaker: true,
        department: true,
        viewCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.json(research);
  } catch (error) {
    console.error("Error fetching research:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/research:
 *   post:
 *     tags: [Research]
 *     summary: 新規動向調査作成
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               summary:
 *                 type: string
 *               publishDate:
 *                 type: string
 *                 format: date
 *               videoUrl:
 *                 type: string
 *               posterUrl:
 *                 type: string
 *               pdfUrl:
 *                 type: string
 *               speaker:
 *                 type: string
 *               department:
 *                 type: string
 *               agenda:
 *                 type: array
 *                 items:
 *                   type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: 作成成功
 */
app.post(
  "/api/research",
  [
    check("title").notEmpty().withMessage("Title is required"),
    check("summary").notEmpty().withMessage("Summary is required"),
    check("publishDate")
      .isISO8601()
      .withMessage("Valid publish date is required"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const {
        title,
        summary,
        publishDate,
        videoUrl,
        posterUrl,
        pdfUrl,
        speaker,
        department,
        agenda,
        content,
      } = req.body;

      const research = await prisma.research.create({
        data: {
          title,
          summary,
          publishDate: new Date(publishDate),
          videoUrl,
          posterUrl,
          pdfUrl,
          speaker,
          department,
          agenda: agenda || [],
          content,
        },
      });

      res.status(201).json(research);
    } catch (error) {
      console.error("Error creating research:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * @swagger
 * /api/research/{id}:
 *   get:
 *     tags: [Research]
 *     summary: 単一動向調査取得
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 動向調査オブジェクトを返す
 *       404:
 *         description: 存在しない
 */
app.get("/api/research/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const research = await prisma.research.findUnique({
      where: { id },
    });

    if (!research) {
      res.status(404).json({ error: "Research not found" });
      return;
    }

    res.json(research);
  } catch (error) {
    console.error("Error fetching research:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/research/{id}:
 *   put:
 *     tags: [Research]
 *     summary: 動向調査更新
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
 *               summary:
 *                 type: string
 *               publishDate:
 *                 type: string
 *                 format: date
 *               videoUrl:
 *                 type: string
 *               posterUrl:
 *                 type: string
 *               pdfUrl:
 *                 type: string
 *               speaker:
 *                 type: string
 *               department:
 *                 type: string
 *               agenda:
 *                 type: array
 *                 items:
 *                   type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: 更新成功
 *       404:
 *         description: 存在しない
 */
app.put("/api/research/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      summary,
      publishDate,
      videoUrl,
      posterUrl,
      pdfUrl,
      speaker,
      department,
      agenda,
      content,
    } = req.body;

    const research = await prisma.research.update({
      where: { id },
      data: {
        title,
        summary,
        publishDate: publishDate ? new Date(publishDate) : undefined,
        videoUrl,
        posterUrl,
        pdfUrl,
        speaker,
        department,
        agenda,
        content,
      },
    });

    res.json(research);
  } catch (error) {
    console.error("Error updating research:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // errorがPrismaClientKnownRequestErrorのインスタンスである場合
      if (error.code === "P2025") {
        res
          .status(404)
          .json({ error: "Research not found (Prisma Error P2025)" });
      } else {
        // その他のPrismaクライアントの既知のエラー
        res
          .status(500)
          .json({ error: "A Prisma error occurred", code: error.code });
      }
    } else if (error instanceof Error) {
      // Prisma以外の一般的なJavaScriptエラーの場合
      res
        .status(500)
        .json({ error: "Internal server error", message: error.message });
    } else {
      // それ以外の予期しないエラー
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
});

/**
 * @swagger
 * /api/research/{id}:
 *   delete:
 *     tags: [Research]
 *     summary: 動向調査削除
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
app.delete("/api/research/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.research.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting research:", error); // エラーオブジェクト全体はログに出力してOK
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // errorがPrismaClientKnownRequestErrorのインスタンスである場合
      if (error.code === "P2025") {
        res
          .status(404)
          .json({ error: "Research not found (Prisma Error P2025)" });
      } else {
        // その他のPrismaクライアントの既知のエラー
        res
          .status(500)
          .json({ error: "A Prisma error occurred", code: error.code });
      }
    } else if (error instanceof Error) {
      // Prisma以外の一般的なJavaScriptエラーの場合
      res
        .status(500)
        .json({ error: "Internal server error", message: error.message });
    } else {
      // それ以外の予期しないエラー
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
});

/**
 * @swagger
 * /api/articles/batch_create:
 *   post:
 *     tags: [Articles]
 *     summary: 記事一括作成
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               articles:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - title
 *                     - articleUrl
 *                     - source
 *                     - publishedAt
 *                   properties:
 *                     title:
 *                       type: string
 *                     articleUrl:
 *                       type: string
 *                     source:
 *                       type: string
 *                     publishedAt:
 *                       type: string
 *                       format: date-time
 *                     summary:
 *                       type: string
 *                     labels:
 *                       type: array
 *                       items:
 *                         type: string
 *                     thumbnailUrl:
 *                       type: string
 *     responses:
 *       200:
 *         description: 一括作成成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 insertedCount:
 *                   type: number
 *                 skippedCount:
 *                   type: number
 *                 invalidCount:
 *                   type: number
 *                 invalidItems:
 *                   type: array
 *                   items:
 *                     type: object
 */
app.post("/api/articles/batch_create", async (req: Request, res: Response) => {
  try {
    const { articles } = req.body;

    if (!articles || !Array.isArray(articles)) {
      res.status(400).json({ error: "articles array is required" });
      return;
    }

    console.log(`バッチ作成開始: ${articles.length}件の記事を処理中`);

    const validArticles = [];
    const invalidItems = [];

    // バリデーション処理
    for (const [index, article] of articles.entries()) {
      const validation = validateArticleData(article);
      if (validation.isValid) {
        validArticles.push({
          title: article.title,
          articleUrl: article.articleUrl,
          source: article.source,
          publishedAt: new Date(article.publishedAt),
          summary: article.summary || "",
          labels: article.labels || [],
          thumbnailUrl: article.thumbnailUrl || null,
        });
      } else {
        invalidItems.push({
          index,
          article: { title: article.title, url: article.articleUrl },
          errors: validation.errors,
        });
      }
    }

    let insertedCount = 0;
    let skippedCount = 0;

    if (validArticles.length > 0) {
      // 重複チェック用: 既存のarticleUrlを取得
      const existingUrls = await prisma.article.findMany({
        select: { articleUrl: true },
        where: {
          articleUrl: {
            in: validArticles.map((a) => a.articleUrl),
          },
        },
      });

      const existingUrlSet = new Set(existingUrls.map((a) => a.articleUrl));

      // 新規記事のみをフィルタリング
      const newArticles = validArticles.filter(
        (article) => !existingUrlSet.has(article.articleUrl)
      );

      skippedCount = validArticles.length - newArticles.length;

      if (newArticles.length > 0) {
        // 一括作成実行
        const result = await prisma.article.createMany({
          data: newArticles,
          skipDuplicates: true, // 念のため
        });
        insertedCount = result.count;
      }
    }

    console.log(
      `バッチ作成完了: 新規=${insertedCount}件, 重複=${skippedCount}件, 無効=${invalidItems.length}件`
    );

    res.json({
      success: true,
      insertedCount,
      skippedCount,
      invalidCount: invalidItems.length,
      invalidItems,
    });
  } catch (error) {
    console.error("Error in batch create:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/articles/rss-collect:
 *   post:
 *     tags: [Articles]
 *     summary: RSS収集実行
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sources:
 *                 type: array
 *                 items:
 *                   type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: RSS収集成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 insertedCount:
 *                   type: number
 *                 skippedCount:
 *                   type: number
 *                 invalidCount:
 *                   type: number
 *                 invalidItems:
 *                   type: array
 */
app.post("/api/articles/rss-collect", async (req: Request, res: Response) => {
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

    console.log(
      `RSS収集開始: sources=${sources}, period=${startDate}〜${endDate}`
    );

    // PipelineのRSS収集エンドポイントを呼び出し
    const pipelineResponse = await fetch("http://pipeline:8000/collect-rss", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sources, startDate, endDate }),
    });

    if (!pipelineResponse.ok) {
      throw new Error(
        `Pipeline error: ${pipelineResponse.status} ${pipelineResponse.statusText}`
      );
    }

    const pipelineResult = await pipelineResponse.json();
    console.log(
      `Pipeline収集完了: 結果受信 - inserted=${pipelineResult.insertedCount}, skipped=${pipelineResult.skippedCount}`
    );

    // Pipelineから返された結果をそのまま返却
    res.json(pipelineResult);
  } catch (error: any) {
    console.error("RSS収集エラー:", error);

    if (error.message?.includes("fetch")) {
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
});

// バリデーション関数
function validateArticleData(article: any) {
  const errors = [];

  if (
    !article.title ||
    typeof article.title !== "string" ||
    !article.title.trim()
  ) {
    errors.push("タイトルは必須です");
  }

  if (!article.articleUrl || typeof article.articleUrl !== "string") {
    errors.push("記事URLは必須です");
  } else {
    try {
      new URL(article.articleUrl);
    } catch {
      errors.push("有効なURLを入力してください");
    }
  }

  if (
    !article.source ||
    typeof article.source !== "string" ||
    !article.source.trim()
  ) {
    errors.push("出典元は必須です");
  }

  if (!article.publishedAt) {
    errors.push("公開日は必須です");
  } else {
    const date = new Date(article.publishedAt);
    if (isNaN(date.getTime())) {
      errors.push("有効な日付を入力してください");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ─── Server Start ───────────────────────────
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📚 API Docs: http://localhost:${port}/api-docs`);
});
