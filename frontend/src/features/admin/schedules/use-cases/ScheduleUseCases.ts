import { IScheduleRepository } from "../ports/IScheduleRepository";
import { Schedule, ScheduleFormData, ScheduleExecution } from "@/types/schedule";

export class GetSchedulesUseCase {
  constructor(private repository: IScheduleRepository) {}

  async execute(): Promise<Schedule[]> {
    return await this.repository.getAll();
  }
}

export class GetScheduleByIdUseCase {
  constructor(private repository: IScheduleRepository) {}

  async execute(id: string): Promise<Schedule | null> {
    return await this.repository.getById(id);
  }
}

export class CreateScheduleUseCase {
  constructor(private repository: IScheduleRepository) {}

  async execute(data: ScheduleFormData): Promise<Schedule> {
    // バリデーション
    this.validateScheduleData(data);
    
    return await this.repository.create(data);
  }

  private validateScheduleData(data: ScheduleFormData): void {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error("スケジュール名は必須です");
    }

    if (data.scheduleType === "daily" && !data.time) {
      throw new Error("毎日実行の場合、時刻の指定が必要です");
    }

    if (data.scheduleType === "weekly" && (data.dayOfWeek === undefined || data.dayOfWeek < 0 || data.dayOfWeek > 6)) {
      throw new Error("毎週実行の場合、曜日の指定が必要です");
    }

    if (data.scheduleType === "monthly" && (data.dayOfMonth === undefined || data.dayOfMonth < 1 || data.dayOfMonth > 31)) {
      throw new Error("毎月実行の場合、日付の指定が必要です");
    }

    if (data.scheduleType === "custom" && !data.cronExpression) {
      throw new Error("カスタムスケジュールの場合、Cron式の指定が必要です");
    }
  }
}

export class UpdateScheduleUseCase {
  constructor(private repository: IScheduleRepository) {}

  async execute(id: string, data: Partial<ScheduleFormData>): Promise<Schedule> {
    return await this.repository.update(id, data);
  }
}

export class DeleteScheduleUseCase {
  constructor(private repository: IScheduleRepository) {}

  async execute(id: string): Promise<void> {
    return await this.repository.delete(id);
  }
}

export class ToggleScheduleUseCase {
  constructor(private repository: IScheduleRepository) {}

  async execute(id: string, activate: boolean): Promise<void> {
    if (activate) {
      await this.repository.activate(id);
    } else {
      await this.repository.deactivate(id);
    }
  }
}

export class GetScheduleExecutionsUseCase {
  constructor(private repository: IScheduleRepository) {}

  async execute(scheduleId: string, limit: number = 10): Promise<ScheduleExecution[]> {
    return await this.repository.getExecutions(scheduleId, limit);
  }
}

export class ExecuteScheduleNowUseCase {
  constructor(private repository: IScheduleRepository) {}

  async execute(scheduleId: string): Promise<ScheduleExecution> {
    return await this.repository.executeNow(scheduleId);
  }
}