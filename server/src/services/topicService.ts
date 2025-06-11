import prisma from "../adapters/prismaAdapter";
import { Topic } from "../entities/topic";
import {
  CreateTopicDto,
  UpdateTopicDto,
  TopicStore,
  ExportResult,
  CategorizeDto,
  UpdateArticleCategoryDto,
} from "../types/topic";
import axios from "axios";

export class TopicService {
  // カテゴリ名からIDへのマッピング
  private readonly CATEGORY_NAME_TO_ID_MAP = {
    // 日本語名からIDへのマッピング
    政治: "political",
    経済: "economical",
    社会: "social",
    技術: "technological",
    技術動向: "technological",
    市場動向: "economical",
    企業動向: "economical",
    "政策・規制": "political",
    "投資・M&A": "economical",
    "人材・組織": "social",
    その他: "others",

    // 英語名からIDへのマッピング
    Political: "political",
    Economical: "economical",
    Social: "social",
    Technological: "technological",
    "Government Initiatives": "government_initiatives",
    "M&A": "ma",
    "Production Technology": "production_tech",
    "Advanced Technology": "advanced_tech",
    "Social Trends": "social_trends",
    "Market Trends": "market_trends",
    "R&D": "research_development",
    "Supply Chain": "supply_chain",
    Environmental: "environmental",
    Others: "others",

    // サブカテゴリの日本語名
    国の取り組み: "government_initiatives",
    生産技術: "production_tech",
    先端技術: "advanced_tech",
    世の中の動き: "social_trends",
    研究開発: "research_development",
    サプライチェーン: "supply_chain",
    "環境・サステナビリティ": "environmental",
  };

  // カテゴリ名をIDに変換
  private mapCategoryNameToId(categoryName: string): string | null {
    const mappedId =
      this.CATEGORY_NAME_TO_ID_MAP[
        categoryName as keyof typeof this.CATEGORY_NAME_TO_ID_MAP
      ];
    if (mappedId) {
      return mappedId;
    }

    console.warn(`Unknown category name: ${categoryName}`);
    return null;
  }

  // 全Topics取得
  async findAll(): Promise<any[]> {
    const topics = await prisma.topic.findMany({
      include: {
        topicsArticles: {
          include: {
            article: true,
            category: true,
            subCategory: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return topics.map(this.toResponseFormat);
  }

  // ID指定でTopic取得
  async findById(id: string): Promise<any | null> {
    const topic = await prisma.topic.findUnique({
      where: { id },
      include: {
        topicsArticles: {
          include: {
            article: true,
            category: true,
            subCategory: true,
          },
        },
      },
    });

    return topic ? this.toResponseFormat(topic) : null;
  }

  // Topic作成
  async create(dto: CreateTopicDto): Promise<any> {
    const topicData = {
      title: dto.title,
      summary: dto.summary || null,
      publishDate: dto.publishDate ? new Date(dto.publishDate) : new Date(),
      content: dto.content || null,
    };

    const topic = await prisma.topic.create({
      data: topicData,
      include: {
        topicsArticles: {
          include: {
            article: true,
            category: true,
            subCategory: true,
          },
        },
      },
    });

    // 記事の関連付けを処理
    if (dto.articles && dto.articles.length > 0) {
      const articleIds = dto.articles.map((articleId) =>
        typeof articleId === "string" ? articleId : String(articleId)
      );

      const topicsArticleData = articleIds.map((articleId) => ({
        topicId: topic.id,
        articleId: articleId,
      }));

      await prisma.topicsArticle.createMany({
        data: topicsArticleData,
        skipDuplicates: true,
      });

      // 更新されたトピックを再取得
      const updatedTopic = await prisma.topic.findUnique({
        where: { id: topic.id },
        include: {
          topicsArticles: {
            include: {
              article: true,
              category: true,
              subCategory: true,
            },
          },
        },
      });

      return this.toResponseFormat(updatedTopic!);
    }

    return this.toResponseFormat(topic);
  }

  // Topic更新
  async update(id: string, dto: UpdateTopicDto): Promise<any | null> {
    const existingTopic = await prisma.topic.findUnique({
      where: { id },
    });

    if (!existingTopic) {
      return null;
    }

    const updateData: any = {};
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.summary !== undefined) updateData.summary = dto.summary;
    if (dto.publishDate !== undefined)
      updateData.publishDate = new Date(dto.publishDate);
    if (dto.content !== undefined) updateData.content = dto.content;

    const topic = await prisma.topic.update({
      where: { id },
      data: updateData,
      include: {
        topicsArticles: {
          include: {
            article: true,
            category: true,
            subCategory: true,
          },
        },
      },
    });

    // 記事の関連付けを更新
    if (dto.articles !== undefined) {
      // 既存の関連付けを削除
      await prisma.topicsArticle.deleteMany({
        where: { topicId: id },
      });

      // 新しい関連付けを作成
      if (dto.articles.length > 0) {
        const articleIds = dto.articles.map((articleId) =>
          typeof articleId === "string" ? articleId : String(articleId)
        );

        const topicsArticleData = articleIds.map((articleId) => ({
          topicId: id,
          articleId: articleId,
        }));

        await prisma.topicsArticle.createMany({
          data: topicsArticleData,
          skipDuplicates: true,
        });
      }

      // 更新されたトピックを再取得
      const updatedTopic = await prisma.topic.findUnique({
        where: { id },
        include: {
          topicsArticles: {
            include: {
              article: true,
              category: true,
              subCategory: true,
            },
          },
        },
      });

      return this.toResponseFormat(updatedTopic!);
    }

    return this.toResponseFormat(topic);
  }

  // Topic削除
  async delete(id: string): Promise<boolean> {
    try {
      await prisma.topic.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  // 記事カテゴリ更新
  async updateArticleCategory(
    topicId: string,
    articleId: string,
    dto: UpdateArticleCategoryDto
  ): Promise<{ success: boolean; categories: any }> {
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      throw new Error("Topic not found");
    }

    // メインカテゴリとサブカテゴリのIDを取得
    let categoryId = null;
    let subCategoryId = null;

    if (dto.main) {
      // カテゴリ名をIDに変換
      const mainCategoryId = this.mapCategoryNameToId(dto.main);
      if (mainCategoryId) {
        const category = await prisma.category.upsert({
          where: { name: mainCategoryId },
          update: {},
          create: { name: mainCategoryId },
        });
        categoryId = category.id;
      }
    }

    if (dto.sub && Array.isArray(dto.sub) && dto.sub.length > 0) {
      // サブカテゴリの最初の要素を使用
      const subCategoryName = dto.sub[0];
      const subCatId = this.mapCategoryNameToId(subCategoryName);
      if (subCatId) {
        const subCategory = await prisma.category.upsert({
          where: { name: subCatId },
          update: {},
          create: { name: subCatId },
        });
        subCategoryId = subCategory.id;
      }
    }

    await prisma.topicsArticle.updateMany({
      where: {
        topicId: topicId,
        articleId: articleId,
      },
      data: {
        categoryId: categoryId,
        subCategoryId: subCategoryId,
      },
    });

    return {
      success: true,
      categories: { main: dto.main, sub: dto.sub || [] },
    };
  }

  // 月次サマリ生成（Pipeline API連携）
  async generateSummary(
    topicId: string,
    dto: { article_ids: string[]; summary_style?: string }
  ): Promise<any> {
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: {
        topicsArticles: {
          include: {
            article: true,
          },
        },
      },
    });

    if (!topic) {
      throw new Error("Topic not found");
    }

    try {
      // 指定された記事IDに対応する記事情報を取得
      const articlesToSummarize = topic.topicsArticles
        .filter((ta) => dto.article_ids.includes(ta.articleId))
        .map((ta) => ta.article);

      if (articlesToSummarize.length === 0) {
        throw new Error("No articles found for the specified IDs");
      }

      console.log(
        `Generating summary for ${articlesToSummarize.length} articles for topic ${topicId}`
      );

      // Pipeline APIのエンドポイントURL
      const pipelineBaseUrl =
        process.env.PIPELINE_URL_INTERNAL || "http://pipeline:8000";
      const pipelineUrl = `${pipelineBaseUrl}/api/llm/topics/summary`;

      // Pipeline API呼び出し
      const response = await axios.post(
        pipelineUrl,
        {
          article_ids: dto.article_ids,
          summary_style: dto.summary_style || "overview",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 60000, // 60秒タイムアウト
        }
      );

      console.log("Pipeline API summary response:", response.data);

      return {
        success: true,
        summary: response.data.topics_summary || "",
        article_count: articlesToSummarize.length,
        key_themes: response.data.key_themes || [],
        word_count: response.data.word_count || 0,
        pipeline_response: response.data,
      };
    } catch (error: any) {
      console.error("Error in summary generation:", error);

      // Pipeline APIエラーの詳細ログ
      if (error.response) {
        console.error("Pipeline API error response:", {
          status: error.response.status,
          data: error.response.data,
        });
      }

      throw new Error(`Summary generation failed: ${error.message}`);
    }
  }

  // LLM自動分類（Pipeline API連携）
  async categorize(topicId: string, dto: CategorizeDto): Promise<any> {
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: {
        topicsArticles: {
          include: {
            article: true,
          },
        },
      },
    });

    if (!topic) {
      throw new Error("Topic not found");
    }

    try {
      // 指定された記事IDに対応する記事情報を取得
      const articlesToCategorize = topic.topicsArticles
        .filter((ta) => dto.article_ids.includes(ta.articleId))
        .map((ta) => ta.article);

      if (articlesToCategorize.length === 0) {
        throw new Error("No articles found for the specified IDs");
      }

      console.log(
        `Categorizing ${articlesToCategorize.length} articles for topic ${topicId}`
      );

      // Pipeline APIのエンドポイントURL
      const pipelineBaseUrl =
        process.env.PIPELINE_URL_INTERNAL || "http://pipeline:8000";
      const pipelineUrl = `${pipelineBaseUrl}/api/llm/topics/categorize`;

      // Pipeline API呼び出し
      const response = await axios.post(
        pipelineUrl,
        {
          article_ids: dto.article_ids,
          categorization_type: "hierarchical",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 60000, // 60秒タイムアウト
        }
      );

      console.log("Pipeline API response:", response.data);

      // レスポンスから分類結果を処理
      const categorizedResults = [];
      const categoryBreakdown = response.data.category_breakdown || {};

      // 各カテゴリセクションから記事を処理
      for (const [categoryName, articles] of Object.entries(
        categoryBreakdown
      )) {
        if (Array.isArray(articles)) {
          for (const article of articles) {
            categorizedResults.push({
              article_id: article.id,
              main: categoryName,
              sub: article.subcategories || [],
              confidence: 0.95, // Pipeline APIから信頼度が返される場合はそれを使用
            });
          }
        }
      }

      // 結果をDBに保存
      for (const result of categorizedResults) {
        let categoryId = null;
        let subCategoryId = null;

        // メインカテゴリをDBに保存
        if (result.main) {
          const mainCategoryId = this.mapCategoryNameToId(result.main);
          if (mainCategoryId) {
            const category = await prisma.category.upsert({
              where: { name: mainCategoryId },
              update: {},
              create: { name: mainCategoryId },
            });
            categoryId = category.id;
          }
        }

        // サブカテゴリをDBに保存
        if (result.sub && Array.isArray(result.sub) && result.sub.length > 0) {
          const subCategoryName = result.sub[0];
          const subCatId = this.mapCategoryNameToId(subCategoryName);
          if (subCatId) {
            const subCategory = await prisma.category.upsert({
              where: { name: subCatId },
              update: {},
              create: { name: subCatId },
            });
            subCategoryId = subCategory.id;
          }
        }

        // TopicsArticleテーブルのカテゴリを更新
        await prisma.topicsArticle.updateMany({
          where: {
            topicId: topicId,
            articleId: result.article_id,
          },
          data: {
            categoryId: categoryId,
            subCategoryId: subCategoryId,
          },
        });

        console.log(
          `Updated categories for article ${result.article_id}: main=${result.main}, sub=${result.sub}`
        );
      }

      return {
        success: true,
        results: categorizedResults,
        message: "LLM categorization completed",
        pipeline_response: response.data,
      };
    } catch (error: any) {
      console.error("Error in LLM categorization:", error);

      // Pipeline APIエラーの詳細ログ
      if (error.response) {
        console.error("Pipeline API error response:", {
          status: error.response.status,
          data: error.response.data,
        });
      }

      throw new Error(`LLM categorization failed: ${error.message}`);
    }
  }

  // HTMLテンプレート出力
  async export(id: string): Promise<ExportResult> {
    const topic = await this.findById(id);

    if (!topic) {
      throw new Error("Topic not found");
    }

    // 簡単なHTMLテンプレート生成
    const html = `
      <h1>${topic.title}</h1>
      <div class="summary">
        <p>${topic.summary || "サマリーはありません"}</p>
      </div>
      <div class="articles">
        ${topic.articles
          .map(
            (article: any, index: number) => `
          <div class="article">
            <h3>${article.title || `Article ${index + 1}`}</h3>
            <p class="source">${article.source} - ${new Date(article.publishedAt).toLocaleDateString()}</p>
            <p>${article.summary || "要約はありません"}</p>
            ${
              article.labels && article.labels.length > 0
                ? `<div class="labels">${article.labels.map((label: string) => `<span class="label">${label}</span>`).join(" ")}</div>`
                : ""
            }
          </div>
        `
          )
          .join("")}
      </div>
    `;

    return { html, success: true };
  }

  // レスポンス形式に変換
  private toResponseFormat(prismaTopic: any): any {
    return {
      id: prismaTopic.id,
      title: prismaTopic.title,
      summary: prismaTopic.summary,
      publishDate: prismaTopic.publishDate,
      content: prismaTopic.content,
      viewCount: prismaTopic.viewCount,
      createdAt: prismaTopic.createdAt,
      updatedAt: prismaTopic.updatedAt,
      articles:
        prismaTopic.topicsArticles?.map((ta: any) => ({
          id: ta.article.id,
          title: ta.article.title,
          source: ta.article.source,
          publishedAt: ta.article.publishedAt,
          summary: ta.article.summary,
          labels: ta.article.labels,
          thumbnailUrl: ta.article.thumbnailUrl,
          articleUrl: ta.article.articleUrl,
          category: ta.category?.name || null,
          subCategory: ta.subCategory?.name || null,
        })) || [],
    };
  }
}

// シングルトンインスタンスをエクスポート
export const topicService = new TopicService();
