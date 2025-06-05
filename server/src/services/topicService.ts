import prisma from "../adapters/prismaAdapter";
import { Topic } from "../entities/topic";
import { CreateTopicDto, UpdateTopicDto, TopicStore, ExportResult, CategorizeDto, UpdateArticleCategoryDto } from "../types/topic";

// 一時的なインメモリストア（本来はDBに保存すべき）
const topicsStore: { [id: string]: TopicStore } = {};

export class TopicService {
  // 全Topics取得
  async findAll(): Promise<Topic[]> {
    const topics = await prisma.topic.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    
    return topics.map(this.toDomainEntity);
  }

  // ID指定でTopic取得（インメモリストアも確認）
  async findById(id: string): Promise<TopicStore | null> {
    // まずインメモリストアを確認
    if (topicsStore[id]) {
      return topicsStore[id];
    }

    // DBから取得
    const topic = await prisma.topic.findUnique({
      where: { id },
    });
    
    return topic ? this.toStoreFormat(topic) : null;
  }

  // Topic作成
  async create(dto: CreateTopicDto): Promise<TopicStore> {
    const topicId = `topic_${Date.now()}`;
    
    // インメモリストアに保存（テスト用）
    topicsStore[topicId] = {
      id: topicId,
      title: dto.title,
      articles: dto.articles || [],
      categories: dto.categories || {},
    };

    return topicsStore[topicId];
  }

  // Topic更新
  async update(id: string, dto: UpdateTopicDto): Promise<TopicStore | null> {
    const topic = topicsStore[id];
    
    if (!topic) {
      return null;
    }

    topicsStore[id] = {
      ...topic,
      title: dto.title || topic.title,
      articles: dto.articles || topic.articles,
      categories: dto.categories || topic.categories,
    };

    return topicsStore[id];
  }

  // 記事カテゴリ更新
  async updateArticleCategory(
    topicId: string, 
    articleId: string, 
    dto: UpdateArticleCategoryDto
  ): Promise<{ success: boolean; categories: any }> {
    const topic = topicsStore[topicId];
    
    if (!topic) {
      throw new Error("Topic not found");
    }

    if (!topic.categories) {
      topic.categories = {};
    }

    topic.categories[articleId] = { 
      main: dto.main, 
      sub: dto.sub || [] 
    };

    return { 
      success: true, 
      categories: topic.categories[articleId] 
    };
  }

  // LLM自動分類（モック実装）
  async categorize(topicId: string, dto: CategorizeDto): Promise<any> {
    const topic = topicsStore[topicId];
    
    if (!topic) {
      throw new Error("Topic not found");
    }

    // LLM自動分類の模擬実装
    const categorizedResults = dto.article_ids.map((articleId: number) => ({
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

    return {
      success: true,
      results: categorizedResults,
      message: "LLM categorization completed",
    };
  }

  // HTMLテンプレート出力
  async export(id: string): Promise<ExportResult> {
    const topic = topicsStore[id];
    
    if (!topic) {
      throw new Error("Topic not found");
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

    return { html, success: true };
  }

  // Prismaモデルからドメインエンティティへのマッピング
  private toDomainEntity(prismaTopic: any): Topic {
    return new Topic(
      prismaTopic.id,
      prismaTopic.title,
      prismaTopic.summary,
      prismaTopic.publishDate,
      prismaTopic.content,
      prismaTopic.viewCount,
      prismaTopic.createdAt,
      prismaTopic.updatedAt
    );
  }

  // DBデータをストア形式に変換
  private toStoreFormat(prismaTopic: any): TopicStore {
    return {
      id: prismaTopic.id,
      title: prismaTopic.title,
      articles: [],  // 実際にはtopicsArticlesから取得すべき
      categories: {},
    };
  }
}

// シングルトンインスタンスをエクスポート
export const topicService = new TopicService();