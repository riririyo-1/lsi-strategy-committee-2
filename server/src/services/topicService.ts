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
  // カテゴリ階層マッピング（小カテゴリ → 大カテゴリ）
  private readonly CATEGORY_HIERARCHY: { [key: string]: string | null } = {
    government_initiatives: "political",    // 国の取り組み → 政治
    ma: "economical",                      // M&A → 経済
    market_trends: "economical",           // 市場動向 → 経済
    production_tech: "technological",      // 生産技術 → 技術
    advanced_tech: "technological",        // 先端技術 → 技術
    research_development: "technological", // 研究開発 → 技術
    supply_chain: "technological",         // サプライチェーン → 技術
    environmental: "technological",        // 環境・サステナビリティ → 技術
    social_trends: "social",              // 世の中の動き → 社会
    others: null,                         // その他 → 未分類
  };

  // カテゴリ名からIDへのマッピング
  private readonly CATEGORY_NAME_TO_ID_MAP = {
    // 基本4カテゴリ（日本語）
    政治: "political",
    経済: "economical", 
    社会: "social",
    技術: "technological",
    
    // 基本4カテゴリ（英語）
    Political: "political",
    Economical: "economical",
    Social: "social",
    Technological: "technological",
    political: "political",
    economical: "economical",
    social: "social",
    technological: "technological",
    
    // その他の分類を4カテゴリに集約
    技術動向: "technological",
    市場動向: "economical",
    企業動向: "economical",
    "政策・規制": "political",
    "投資・M&A": "economical",
    "人材・組織": "social",
    "Government Initiatives": "political",
    "M&A": "economical",
    "Production Technology": "technological",
    "Advanced Technology": "technological",
    "Social Trends": "social",
    "Market Trends": "economical",
    "R&D": "technological",
    "Supply Chain": "technological",
    Environmental: "technological",
    国の取り組み: "political",
    生産技術: "technological",
    先端技術: "technological",
    世の中の動き: "social",
    研究開発: "technological",
    サプライチェーン: "technological",
    "環境・サステナビリティ": "technological",
    
    // その他は除外（null = 無視）
    その他: null,
    Others: null,
    others: null,
    other: null,
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

      // カテゴリ情報を含めて関連付けを作成
      const topicsArticleData = await Promise.all(
        articleIds.map(async (articleId) => {
          let categoryId = null;

          // カテゴリ情報がある場合は処理
          if (dto.categories && dto.categories[articleId]) {
            const categoryName = dto.categories[articleId].main;
            if (categoryName) {
              // カテゴリ名をIDに変換
              const mainCategoryId = this.mapCategoryNameToId(categoryName);
              if (mainCategoryId) {
                const category = await prisma.category.upsert({
                  where: { name: mainCategoryId },
                  update: {},
                  create: { name: mainCategoryId },
                });
                categoryId = category.id;
              }
            }
          }

          return {
            topicId: topic.id,
            articleId: articleId,
            categoryId: categoryId,
          };
        })
      );

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

        // カテゴリ情報を含めて関連付けを作成
        const topicsArticleData = await Promise.all(
          articleIds.map(async (articleId) => {
            let categoryId = null;

            // カテゴリ情報がある場合は処理
            if (dto.categories && dto.categories[articleId]) {
              const categoryName = dto.categories[articleId].main;
              if (categoryName) {
                // カテゴリ名をIDに変換
                const mainCategoryId = this.mapCategoryNameToId(categoryName);
                if (mainCategoryId) {
                  const category = await prisma.category.upsert({
                    where: { name: mainCategoryId },
                    update: {},
                    create: { name: mainCategoryId },
                  });
                  categoryId = category.id;
                }
              }
            }

            return {
              topicId: id,
              articleId: articleId,
              categoryId: categoryId,
            };
          })
        );

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

    // メインカテゴリのIDを取得（単一カテゴリのみ）
    let categoryId = null;

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

    await prisma.topicsArticle.updateMany({
      where: {
        topicId: topicId,
        articleId: articleId,
      },
      data: {
        categoryId: categoryId,
      },
    });

    return {
      success: true,
      categories: { main: dto.main },
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
          categorization_type: "single",
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

      // 各カテゴリセクションから記事を処理（単一カテゴリのみ）
      for (const [categoryName, articles] of Object.entries(
        categoryBreakdown
      )) {
        if (Array.isArray(articles)) {
          for (const article of articles) {
            categorizedResults.push({
              article_id: article.id,
              main: categoryName,
              confidence: 0.95, // Pipeline APIから信頼度が返される場合はそれを使用
            });
          }
        }
      }

      // 結果をDBに保存（単一カテゴリのみ）
      for (const result of categorizedResults) {
        let categoryId = null;

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

        // TopicsArticleテーブルのカテゴリを更新（単一カテゴリのみ）
        await prisma.topicsArticle.updateMany({
          where: {
            topicId: topicId,
            articleId: result.article_id,
          },
          data: {
            categoryId: categoryId,
          },
        });

        console.log(
          `Updated categories for article ${result.article_id}: main=${result.main}`
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

  // レスポンス形式に変換（アロー関数でthisコンテキストを保持）
  private toResponseFormat = (prismaTopic: any): any => {
    const articles = prismaTopic.topicsArticles?.map((ta: any) => ({
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
    })) || [];

    // 記事を階層構造でグループ化
    const categories = this.groupArticlesByHierarchy(articles);

    return {
      id: prismaTopic.id,
      title: prismaTopic.title,
      summary: prismaTopic.summary,
      publishDate: prismaTopic.publishDate,
      content: prismaTopic.content,
      viewCount: prismaTopic.viewCount,
      createdAt: prismaTopic.createdAt,
      updatedAt: prismaTopic.updatedAt,
      articles,
      categories,
    };
  };

  // 記事を階層構造でグループ化するメソッド（大カテゴリのみ）
  private groupArticlesByHierarchy(articles: any[]): any[] {
    const categoryGroups: { [mainCategory: string]: any[] } = {};

    // 記事を大カテゴリで分類
    articles.forEach((article) => {
      let mainCategory = article.category;

      // 小カテゴリから大カテゴリを推定
      if (article.subCategory && this.CATEGORY_HIERARCHY[article.subCategory]) {
        mainCategory = this.CATEGORY_HIERARCHY[article.subCategory];
      }

      // 大カテゴリがない場合はスキップ
      if (!mainCategory) {
        return;
      }

      // カテゴリグループに追加
      if (!categoryGroups[mainCategory]) {
        categoryGroups[mainCategory] = [];
      }
      categoryGroups[mainCategory].push(article);
    });

    // 配列形式に変換してソート
    const result: any[] = [];
    const mainCategoryOrder = ["political", "economical", "social", "technological"];

    mainCategoryOrder.forEach((mainCat) => {
      if (categoryGroups[mainCat] && categoryGroups[mainCat].length > 0) {
        // 記事を日付順にソート（新しい順）
        const sortedArticles = categoryGroups[mainCat].sort((a, b) => {
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        });

        result.push({
          name: this.getCategoryDisplayName(mainCat),
          mainCategory: mainCat,
          articles: sortedArticles,
        });
      }
    });

    return result;
  }

  // カテゴリ表示名を取得
  private getCategoryDisplayName(mainCategory: string): string {
    const mainNames: { [key: string]: string } = {
      political: "政治",
      economical: "経済", 
      social: "社会",
      technological: "技術",
    };

    return mainNames[mainCategory] || mainCategory;
  }
}

// シングルトンインスタンスをエクスポート
export const topicService = new TopicService();
