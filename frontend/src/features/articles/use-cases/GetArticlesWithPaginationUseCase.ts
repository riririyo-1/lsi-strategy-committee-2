import { PaginatedResponse } from "@/types/common";
import { Article } from "@/types/article";

// ページネーション付き記事取得ユースケース
export interface ArticlePaginationParams {
  page: number;
  limit: number;
}

export type PaginatedArticlesResponse = PaginatedResponse<Article> & {
  articles: Article[]; // 互換性のためにarticlesフィールドを保持
};

export class GetArticlesWithPaginationUseCase {
  async execute(params: ArticlePaginationParams): Promise<PaginatedArticlesResponse> {
    const searchParams = new URLSearchParams({
      page: params.page.toString(),
      limit: params.limit.toString(),
    });

    const response = await fetch(`/api/articles?${searchParams}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // APIレスポンスの正規化
    if (Array.isArray(data)) {
      // 従来形式（配列のみ）の場合
      return {
        articles: data,
        totalCount: data.length,
        totalPages: 1,
        currentPage: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };
    }
    
    // ページネーション対応形式
    return {
      items: data.articles || [],
      articles: data.articles || [], // 互換性のため
      totalCount: data.totalCount || 0,
      totalPages: data.totalPages || 1,
      currentPage: data.currentPage || 1,
      hasNextPage: data.hasNextPage || false,
      hasPreviousPage: data.hasPreviousPage || false,
    };
  }
}