import { Schedule, ScheduleFormData, ScheduleExecution } from "@/types/schedule";

export interface IScheduleRepository {
  // スケジュール管理
  getAll(): Promise<Schedule[]>;
  getById(id: string): Promise<Schedule | null>;
  create(data: ScheduleFormData): Promise<Schedule>;
  update(id: string, data: Partial<ScheduleFormData>): Promise<Schedule>;
  delete(id: string): Promise<void>;
  
  // スケジュールの有効化・無効化
  activate(id: string): Promise<void>;
  deactivate(id: string): Promise<void>;
  
  // 実行履歴
  getExecutions(scheduleId: string, limit?: number): Promise<ScheduleExecution[]>;
  getLatestExecution(scheduleId: string): Promise<ScheduleExecution | null>;
  
  // 即時実行
  executeNow(scheduleId: string): Promise<ScheduleExecution>;
}