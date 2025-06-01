import axios from "axios";

// ===== Server API (Express + Prisma) =====
// サーバーサイド（Next.js API Routes）では内部URL、クライアントサイド（ブラウザ）では外部URLを使用
const getApiBaseUrl = () => {
  // サーバーサイドの場合はDocker内部URL
  if (typeof window === "undefined") {
    return process.env.API_URL_INTERNAL || "http://server:4000";
  }
  // クライアントサイドの場合は外部URL
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:4100";
};

const getPipelineBaseUrl = () => {
  // サーバーサイドの場合はDocker内部URL
  if (typeof window === "undefined") {
    return process.env.PIPELINE_URL_INTERNAL || "http://pipeline:8000";
  }
  // クライアントサイドの場合は外部URL
  return process.env.NEXT_PUBLIC_PIPELINE_URL || "http://localhost:8100";
};

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

// ===== Pipeline API (FastAPI) =====
const pipelineClient = axios.create({
  baseURL: getPipelineBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

// ===== SERVER APIs (Express + Prisma) =====

// Research API
export const researchApi = {
  getAll: () => apiClient.get("/api/research"),
  getById: (id: string) => apiClient.get(`/api/research/${id}`),
  create: (data: any) => apiClient.post("/api/research", data),
  update: (id: string, data: any) => apiClient.put(`/api/research/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/research/${id}`),
};

// Articles API
export const articlesApi = {
  getAll: () => apiClient.get("/api/articles"),
  getById: (id: string) => apiClient.get(`/api/articles/${id}`),
  delete: (id: string) => apiClient.delete(`/api/articles/${id}`),
  deleteMultiple: (ids: string[]) =>
    apiClient.delete("/api/articles", { data: { ids } }),
  getLabels: () => apiClient.get("/api/articles/labels"),
};

// Topics API
export const topicsApi = {
  getAll: () => apiClient.get("/api/topics"),
  getById: (id: string) => apiClient.get(`/api/topics/${id}`),
  create: (data: any) => apiClient.post("/api/topics", data),
  update: (id: string, data: any) => apiClient.put(`/api/topics/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/topics/${id}`),
  export: (id: string) => apiClient.post(`/api/topics/${id}/export`),
  categorize: (id: string) => apiClient.post(`/api/topics/${id}/categorize`),
  updateArticleCategory: (id: string, articleId: string, data: any) =>
    apiClient.patch(`/api/topics/${id}/article/${articleId}/category`, data),
};

// Categories API
export const categoriesApi = {
  getAll: () => apiClient.get("/api/categories"),
  create: (data: any) => apiClient.post("/api/categories", data),
  update: (id: string, data: any) =>
    apiClient.put(`/api/categories/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/categories/${id}`),
};

// Health API
export const healthApi = {
  check: () => apiClient.get("/api/health"),
};

// ===== PIPELINE APIs (FastAPI) =====

// Pipeline Health & Status API
export const pipelineHealthApi = {
  health: () => pipelineClient.get("/health"),
  status: () => pipelineClient.get("/api/status"),
  root: () => pipelineClient.get("/"),
};

// Crawl API (RSS記事収集)
export const crawlApi = {
  // RSS記事収集実行
  crawl: (data: { start_date?: string; end_date?: string; days?: number }) =>
    pipelineClient.post("/api/crawl", data),

  // 最新記事取得
  getLatest: (limit: number = 10) =>
    pipelineClient.get(`/api/crawl/latest?limit=${limit}`),

  // 手動クロール実行
  manual: () => pipelineClient.post("/api/crawl/manual"),
};

// Summarize API (記事要約・分類)
export const summarizeApi = {
  // 記事要約・ラベル付け
  summarize: (data: {
    article_ids?: string[];
    include_labeling?: boolean;
    model_name?: string;
  }) => pipelineClient.post("/api/summarize", data),

  // 記事カテゴリ分類
  categorize: (data: {
    article_ids?: string[];
    categories?: string[];
    model_name?: string;
  }) => pipelineClient.post("/api/categorize", data),

  // バッチ処理
  batch: (limit: number = 50, includeCategorization: boolean = true) =>
    pipelineClient.post(
      `/api/summarize/batch?limit=${limit}&include_categorization=${includeCategorization}`
    ),

  // カテゴリ統計
  categoryStats: () => pipelineClient.get("/api/categories/stats"),

  // カテゴリ提案
  categorySuggestions: (minFrequency: number = 5) =>
    pipelineClient.get(
      `/api/categories/suggestions?min_frequency=${minFrequency}`
    ),
};

// Pipeline Topics API (TOPICS生成・管理)
export const pipelineTopicsApi = {
  // TOPICS生成
  generate: (data: {
    article_ids: string[];
    template_type?: string;
    title?: string;
  }) => pipelineClient.post("/api/topics/generate", data),

  // TOPICS詳細取得
  getDetail: (topicId: string) => pipelineClient.get(`/api/topics/${topicId}`),

  // TOPICSエクスポート
  export: (data: { topic_id: string; format_type?: string }) =>
    pipelineClient.post("/api/topics/export", data),

  // 利用可能テンプレート取得
  getTemplates: () => pipelineClient.get("/api/topics/templates"),

  // 最近のTOPICS取得
  getRecent: (limit: number = 10) =>
    pipelineClient.get(`/api/topics/recent?limit=${limit}`),

  // TOPICS削除
  delete: (topicId: string) => pipelineClient.delete(`/api/topics/${topicId}`),

  // TOPICS再生成
  regenerate: (topicId: string, templateType: string = "default") =>
    pipelineClient.post(
      `/api/topics/${topicId}/regenerate?template_type=${templateType}`
    ),
};

export default apiClient;
