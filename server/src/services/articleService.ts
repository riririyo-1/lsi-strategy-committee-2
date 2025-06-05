import { Prisma } from "@prisma/client";
import prisma from "../adapters/prismaAdapter";
import { Article } from "../entities/article";
import { CreateArticleDto, BatchCreateArticlesDto, BatchCreateResult } from "../types/article";

export class ArticleService {
  // 全記事取得
  async findAll(): Promise<Article[]> {
    const articles = await prisma.article.findMany({
      orderBy: {
        publishedAt: "desc",
      },
    });
    
    return articles.map(this.toDomainEntity);
  }

  // ページネーション付き記事取得
  async findWithPagination(page: number = 1, limit: number = 50): Promise<{
    articles: Article[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }> {
    const skip = (page - 1) * limit;
    
    // 並列で記事取得と総数取得
    const [articles, totalCount] = await Promise.all([
      prisma.article.findMany({
        orderBy: {
          publishedAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.article.count(),
    ]);
    
    const totalPages = Math.ceil(totalCount / limit);
    
    return {
      articles: articles.map(this.toDomainEntity),
      totalCount,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  // ID指定で記事取得
  async findById(id: string): Promise<Article | null> {
    const article = await prisma.article.findUnique({
      where: { id },
    });
    
    return article ? this.toDomainEntity(article) : null;
  }

  // 記事作成
  async create(dto: CreateArticleDto): Promise<Article> {
    const article = await prisma.article.create({
      data: {
        title: dto.title,
        articleUrl: dto.articleUrl,
        source: dto.source,
        publishedAt: new Date(dto.publishedAt),
        summary: dto.summary || "",
        labels: dto.labels || [],
        thumbnailUrl: dto.thumbnailUrl || null,
        fullText: dto.fullText || null,
      },
    });
    
    return this.toDomainEntity(article);
  }

  // 記事削除
  async delete(id: string): Promise<void> {
    await prisma.article.delete({
      where: { id },
    });
  }

  // 複数記事削除
  async deleteMany(ids: string[]): Promise<void> {
    await prisma.article.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }

  // 全ラベル取得
  async getAllLabels(): Promise<string[]> {
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

    const allLabels = articles.flatMap((article) => article.labels || []);
    const uniqueLabels = [...new Set(allLabels)].sort();
    
    return uniqueLabels;
  }

  // バッチ作成
  async batchCreate(dto: BatchCreateArticlesDto): Promise<BatchCreateResult> {
    const validArticles = [];
    const invalidItems = [];

    // バリデーション処理
    for (const [index, article] of dto.articles.entries()) {
      const validation = this.validateArticleData(article);
      if (validation.isValid) {
        validArticles.push({
          title: article.title,
          articleUrl: article.articleUrl,
          source: article.source,
          publishedAt: new Date(article.publishedAt),
          summary: article.summary || "",
          labels: article.labels || [],
          thumbnailUrl: article.thumbnailUrl || null,
          fullText: article.content || null,  // pipelineからのcontentフィールドをfullTextにマッピング
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
      // 重複チェック
      const existingUrls = await prisma.article.findMany({
        select: { articleUrl: true },
        where: {
          articleUrl: {
            in: validArticles.map((a) => a.articleUrl),
          },
        },
      });

      const existingUrlSet = new Set(existingUrls.map((a) => a.articleUrl));
      const newArticles = validArticles.filter(
        (article) => !existingUrlSet.has(article.articleUrl)
      );

      skippedCount = validArticles.length - newArticles.length;

      if (newArticles.length > 0) {
        const result = await prisma.article.createMany({
          data: newArticles,
          skipDuplicates: true,
        });
        insertedCount = result.count;
      }
    }

    return {
      success: true,
      insertedCount,
      skippedCount,
      invalidCount: invalidItems.length,
      invalidItems,
    };
  }

  // バリデーション
  private validateArticleData(article: any): { isValid: boolean; errors: string[] } {
    const errors = [];

    if (!article.title || typeof article.title !== "string" || !article.title.trim()) {
      errors.push("タイトルは必須です");
    }

    if (!article.articleUrl || typeof article.articleUrl !== "string") {
      errors.push("記事URLは必須です");
    } else if (!Article.isValidUrl(article.articleUrl)) {
      errors.push("有効なURLを入力してください");
    }

    if (!article.source || typeof article.source !== "string" || !article.source.trim()) {
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

  // Prismaモデルからドメインエンティティへのマッピング
  private toDomainEntity(prismaArticle: any): Article {
    return new Article(
      prismaArticle.id,
      prismaArticle.title,
      prismaArticle.articleUrl,
      prismaArticle.source,
      prismaArticle.publishedAt,
      prismaArticle.summary,
      prismaArticle.labels,
      prismaArticle.thumbnailUrl,
      prismaArticle.fullText,
      prismaArticle.category,
      prismaArticle.subCategory,
      prismaArticle.viewCount,
      prismaArticle.createdAt,
      prismaArticle.updatedAt
    );
  }
}

// シングルトンインスタンスをエクスポート
export const articleService = new ArticleService();