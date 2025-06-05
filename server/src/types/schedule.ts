export interface ScheduleType {
  id: string;
  name: string;
  description?: string;
  scheduleType: "daily" | "weekly" | "monthly" | "custom";
  cronExpression?: string;
  time?: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  taskType: "rss_collection" | "labeling" | "summarization" | "categorization" | "batch_process";
  taskConfig: any;
  isActive: boolean;
  lastRun?: Date;
  nextRun?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduleExecutionType {
  id: string;
  scheduleId: string;
  status: "pending" | "running" | "completed" | "failed";
  startedAt: Date;
  completedAt?: Date;
  result?: any;
  errorMessage?: string;
  createdAt: Date;
}

// タスク設定の型定義
export interface RSSCollectionConfig {
  sources: string[];
  daysToCollect: number;
}

export interface LabelingConfig {
  articleFilter: {
    onlyWithoutLabels?: boolean;
    onlyWithoutSummary?: boolean;
    sources?: string[];
    daysOld?: number;
  };
  modelName?: string;
}

export interface BatchProcessConfig {
  batchSize: number;
  includeLabeling: boolean;
  includeSummarization: boolean;
  includeCategorization: boolean;
}

export type TaskConfig = RSSCollectionConfig | LabelingConfig | BatchProcessConfig;