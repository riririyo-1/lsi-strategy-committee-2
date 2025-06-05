export interface Schedule {
  id: string;
  name: string;
  description?: string;
  scheduleType: "daily" | "weekly" | "monthly" | "custom";
  cronExpression?: string;
  time?: string; // HH:MM format
  dayOfWeek?: number; // 0-6
  dayOfMonth?: number; // 1-31
  taskType: "rss_collection" | "labeling" | "summarization" | "categorization" | "batch_process";
  taskConfig: any; // タスク設定（JSON形式）
  isActive: boolean;
  lastRun?: string;
  nextRun?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleExecution {
  id: string;
  scheduleId: string;
  status: "pending" | "running" | "completed" | "failed";
  startedAt: string;
  completedAt?: string;
  result?: any; // 実行結果（JSON形式）
  errorMessage?: string;
  createdAt: string;
}

export interface CreateScheduleInput {
  name: string;
  description?: string;
  scheduleType: "daily" | "weekly" | "monthly" | "custom";
  cronExpression?: string;
  time?: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  taskType: "rss_collection" | "labeling" | "summarization" | "categorization" | "batch_process";
  taskConfig: any;
  isActive?: boolean;
}

export interface UpdateScheduleInput {
  name?: string;
  description?: string;
  scheduleType?: "daily" | "weekly" | "monthly" | "custom";
  cronExpression?: string;
  time?: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  taskType?: "rss_collection" | "labeling" | "summarization" | "categorization" | "batch_process";
  taskConfig?: any;
  isActive?: boolean;
}