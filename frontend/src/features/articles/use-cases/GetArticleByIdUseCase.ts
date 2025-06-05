// 記事詳細取得ユースケース
import { Article } from "@/types/article";

export class GetArticleByIdUseCase {
  async execute(articleId: string): Promise<Article> {
    const response = await fetch(`/api/articles/${articleId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("記事が見つかりません");
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const article = await response.json();
    
    // データの正規化
    return {
      ...article,
      publishedAt: article.publishedAt || article.createdAt,
      labels: article.labels || [],
      summary: article.summary || '',
      thumbnailUrl: article.thumbnailUrl || null,
      fullText: article.fullText || null,
    };
  }
}