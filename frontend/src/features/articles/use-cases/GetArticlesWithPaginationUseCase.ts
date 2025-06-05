// ページネーション付き記事取得ユースケース
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedArticlesResponse {
  articles: any[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export class GetArticlesWithPaginationUseCase {
  async execute(params: PaginationParams): Promise<PaginatedArticlesResponse> {
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
      articles: data.articles || [],
      totalCount: data.totalCount || 0,
      totalPages: data.totalPages || 1,
      currentPage: data.currentPage || 1,
      hasNextPage: data.hasNextPage || false,
      hasPreviousPage: data.hasPreviousPage || false,
    };
  }
}