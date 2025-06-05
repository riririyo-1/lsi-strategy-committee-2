// 定期実行スケジュールの型定義

export interface Schedule {
  id: string;
  name: string;
  description?: string;
  scheduleType: ScheduleType;
  cronExpression?: string;
  time?: string; // HH:MM format for daily schedules
  dayOfWeek?: number; // 0-6 for weekly schedules
  dayOfMonth?: number; // 1-31 for monthly schedules
  taskType: TaskType;
  taskConfig: TaskConfig;
  isActive: boolean;
  lastRun?: string; // ISO 8601 datetime
  nextRun?: string; // ISO 8601 datetime
  createdAt: string;
  updatedAt: string;
}

export type ScheduleType = "daily" | "weekly" | "monthly" | "custom";

export type TaskType = "rss_collection" | "labeling" | "summarization" | "categorization" | "batch_process";

export interface TaskConfig {
  // RSS収集の設定
  sources?: string[];
  daysToCollect?: number;
  
  // ラベル付与・要約の設定
  articleFilter?: ArticleFilter;
  modelName?: string;
  
  // バッチ処理の設定
  batchSize?: number;
  includeLabeling?: boolean;
  includeSummarization?: boolean;
  includeCategorization?: boolean;
}

export interface ArticleFilter {
  onlyWithoutLabels?: boolean;
  onlyWithoutSummary?: boolean;
  onlyWithoutCategory?: boolean;
  sources?: string[];
  daysOld?: number;
}

export interface ScheduleFormData {
  name: string;
  description?: string;
  scheduleType: ScheduleType;
  time?: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  cronExpression?: string;
  taskType: TaskType;
  taskConfig: TaskConfig;
  isActive: boolean;
}

export interface ScheduleExecution {
  id: string;
  scheduleId: string;
  startedAt: string;
  completedAt?: string;
  status: ExecutionStatus;
  result?: ExecutionResult;
  error?: string;
}

export type ExecutionStatus = "running" | "completed" | "failed" | "cancelled";

export interface ExecutionResult {
  processedCount?: number;
  errorCount?: number;
  details?: string;
}