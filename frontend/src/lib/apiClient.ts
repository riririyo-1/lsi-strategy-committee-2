import axios from "axios";

// ===== Base URL Helper =====
const getBaseUrl = (internalEnvKey: string, publicEnvKey: string, defaultInternal: string, defaultPublic: string) => {
  if (typeof window === "undefined") {
    return process.env[internalEnvKey] || defaultInternal;
  }
  return process.env[publicEnvKey] || defaultPublic;
};

// ===== Server API (Express + Prisma) =====
const getApiBaseUrl = () => 
  getBaseUrl('API_URL_INTERNAL', 'NEXT_PUBLIC_API_URL', 'http://server:4000', 'http://localhost:4100');

const getPipelineBaseUrl = () => 
  getBaseUrl('PIPELINE_URL_INTERNAL', 'NEXT_PUBLIC_PIPELINE_URL', 'http://pipeline:8000', 'http://localhost:8100');

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

// ===== CRUD API Factory =====
const createCrudApi = <T = any>(resource: string) => ({
  getAll: () => apiClient.get(`/api/${resource}`),
  getById: (id: string) => apiClient.get(`/api/${resource}/${id}`),
  create: (data: T) => apiClient.post(`/api/${resource}`, data),
  update: (id: string, data: Partial<T>) => apiClient.put(`/api/${resource}/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/${resource}/${id}`),
});

// ===== SERVER APIs (Express + Prisma) =====

// Research API
export const researchApi = createCrudApi('research');

// Articles API
export const articlesApi = {
  getAll: () => apiClient.get("/api/articles"),
  getById: (id: string) => apiClient.get(`/api/articles/${id}`),
  create: (data: {
    title: string;
    articleUrl: string;
    source: string;
    publishedAt: string;
  }) => apiClient.post("/api/articles", data),
  delete: (idOrIds: string | string[]) => {
    if (Array.isArray(idOrIds)) {
      return apiClient.delete("/api/articles", { data: { ids: idOrIds } });
    }
    return apiClient.delete(`/api/articles/${idOrIds}`);
  },
  getLabels: () => apiClient.get("/api/articles/labels"),
  collectRSS: (data: {
    sources: string[];
    startDate: string;
    endDate: string;
  }) => apiClient.post("/api/articles/rss-collect", data),
  batchCreate: (data: {
    articles: Array<{
      title: string;
      articleUrl: string;
      source: string;
      publishedAt: string;
      summary?: string;
      labels?: string[];
      thumbnailUrl?: string;
    }>;
  }) => apiClient.post("/api/articles/batch_create", data),
};

// Topics API
export const topicsApi = {
  ...createCrudApi('topics'),
  export: (id: string) => apiClient.post(`/api/topics/${id}/export`),
  categorize: (id: string, data: { article_ids: string[] }) => apiClient.post(`/api/topics/${id}/categorize`, data),
  generateSummary: (id: string, data: { article_ids: string[]; summary_style?: string }) => 
    apiClient.post(`/api/topics/${id}/generate-summary`, data),
  updateArticleCategory: (id: string, articleId: string, data: any) =>
    apiClient.patch(`/api/topics/${id}/article/${articleId}/category`, data),
};

// Categories API
export const categoriesApi = {
  ...createCrudApi('categories'),
  getById: undefined, // Categories APIにはgetByIdがないため除外
};

// Health API
export const healthApi = {
  check: () => apiClient.get("/api/health"),
};

// Schedules API
export const schedulesApi = {
  ...createCrudApi('schedules'),
  activate: (id: string) => apiClient.post(`/api/schedules/${id}/activate`),
  deactivate: (id: string) => apiClient.post(`/api/schedules/${id}/deactivate`),
  getExecutions: (scheduleId: string, limit?: number) => 
    apiClient.get(`/api/schedules/${scheduleId}/executions${limit ? `?limit=${limit}` : ""}`),
  getLatestExecution: (scheduleId: string) => 
    apiClient.get(`/api/schedules/${scheduleId}/executions/latest`),
  executeNow: (scheduleId: string) => 
    apiClient.post(`/api/schedules/${scheduleId}/execute`),
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
  // 記事要約・ラベル付け（llm_routerを使用）
  summarize: (data: {
    article_ids?: string[];
    include_labeling?: boolean;
    model_name?: string;
  }) => {
    // include_labelingに応じてエンドポイントを切り替え
    if (data.include_labeling === false) {
      // 要約のみの場合
      return pipelineClient.post("/api/llm/summarize-only", {
        article_ids: data.article_ids,
        limit: 50
      });
    } else if (data.include_labeling === true) {
      // ラベルのみの場合
      return pipelineClient.post("/api/llm/labels-only", {
        article_ids: data.article_ids,
        limit: 50
      });
    } else {
      // デフォルト：要約とラベル両方
      return pipelineClient.post("/api/llm/summarize", {
        article_ids: data.article_ids,
        limit: 50
      });
    }
  },

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

  // カテゴリ分類
  categorize: (data: {
    article_ids: string[];
    main_categories: Array<{ id: string; name: string }>;
    sub_categories: Array<{ id: string; name: string }>;
  }) => pipelineClient.post("/api/topics/categorize", data),
};

export default apiClient;
