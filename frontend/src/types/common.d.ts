// ページネーション関連の共通型
export interface PaginationParams {
  page: number;
  limit: number;
  query?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// API共通レスポンス型
export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// API共通エラー型
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// 日付型の統一（ISO 8601形式の文字列）
export type ISODateString = string;

// 共通のエンティティベース型
export interface BaseEntity {
  id: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

// 共通のフィルター型
export interface BaseFilter {
  startDate?: ISODateString;
  endDate?: ISODateString;
  keyword?: string;
  tags?: string[];
}

// ステータス型
export type Status = 'active' | 'inactive' | 'pending' | 'completed' | 'failed';

// ソート可能なフィールドの共通型
export type SortableFields<T> = {
  [K in keyof T]?: 'asc' | 'desc';
};