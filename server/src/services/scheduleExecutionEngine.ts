import * as cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { ScheduleService } from './scheduleService';
import axios from 'axios';

const prisma = new PrismaClient();
const scheduleService = new ScheduleService();

export class ScheduleExecutionEngine {
  private activeTasks: Map<string, cron.ScheduledTask> = new Map();
  private isRunning = false;

  // エンジン開始
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('[Schedule Engine] Already running');
      return;
    }

    console.log('[Schedule Engine] Starting...');
    this.isRunning = true;

    // アクティブなスケジュールを取得してタスクを登録
    await this.loadActiveSchedules();
    
    console.log('[Schedule Engine] Started successfully');
  }

  // エンジン停止
  async stop(): Promise<void> {
    if (!this.isRunning) {
      console.log('[Schedule Engine] Already stopped');
      return;
    }

    console.log('[Schedule Engine] Stopping...');
    
    // すべてのタスクを停止
    for (const [scheduleId, task] of this.activeTasks.entries()) {
      task.stop();
      console.log(`[Schedule Engine] Stopped task for schedule: ${scheduleId}`);
    }
    
    this.activeTasks.clear();
    this.isRunning = false;
    
    console.log('[Schedule Engine] Stopped successfully');
  }

  // アクティブなスケジュールを読み込み
  private async loadActiveSchedules(): Promise<void> {
    try {
      const schedules = await prisma.schedule.findMany({
        where: { isActive: true }
      });

      console.log(`[Schedule Engine] Loading ${schedules.length} active schedules`);

      for (const schedule of schedules) {
        await this.scheduleTask(schedule.id, schedule);
      }
    } catch (error) {
      console.error('[Schedule Engine] Failed to load active schedules:', error);
    }
  }

  // スケジュールタスクを登録
  async scheduleTask(scheduleId: string, scheduleData?: any): Promise<void> {
    try {
      // 既存のタスクがあれば停止
      if (this.activeTasks.has(scheduleId)) {
        this.activeTasks.get(scheduleId)?.stop();
        this.activeTasks.delete(scheduleId);
      }

      // スケジュールデータを取得（未提供の場合）
      if (!scheduleData) {
        scheduleData = await prisma.schedule.findUnique({
          where: { id: scheduleId }
        });
      }

      if (!scheduleData || !scheduleData.isActive) {
        console.log(`[Schedule Engine] Schedule ${scheduleId} is not active, skipping`);
        return;
      }

      // Cron式を生成
      const cronExpression = this.generateCronExpression(scheduleData);
      if (!cronExpression) {
        console.log(`[Schedule Engine] Could not generate cron expression for schedule ${scheduleId}`);
        return;
      }

      // Cron式が有効かチェック
      if (!cron.validate(cronExpression)) {
        console.error(`[Schedule Engine] Invalid cron expression: ${cronExpression} for schedule ${scheduleId}`);
        return;
      }

      // タスクを作成して登録
      const task = cron.schedule(cronExpression, async () => {
        console.log(`[Schedule Engine] Executing scheduled task: ${scheduleId}`);
        await this.executeScheduledTask(scheduleId);
      }, {
        timezone: 'Asia/Tokyo'
      });
      
      // タスクを開始
      task.start();

      this.activeTasks.set(scheduleId, task);
      console.log(`[Schedule Engine] Scheduled task for ${scheduleId} with cron: ${cronExpression}`);

    } catch (error) {
      console.error(`[Schedule Engine] Failed to schedule task for ${scheduleId}:`, error);
    }
  }

  // タスクの登録解除
  async unscheduleTask(scheduleId: string): Promise<void> {
    if (this.activeTasks.has(scheduleId)) {
      this.activeTasks.get(scheduleId)?.stop();
      this.activeTasks.delete(scheduleId);
      console.log(`[Schedule Engine] Unscheduled task for ${scheduleId}`);
    }
  }

  // スケジュールデータからCron式を生成
  private generateCronExpression(schedule: any): string | null {
    switch (schedule.scheduleType) {
      case 'daily':
        if (schedule.time) {
          const [hours, minutes] = schedule.time.split(':').map(Number);
          return `${minutes} ${hours} * * *`;
        }
        break;

      case 'weekly':
        if (schedule.time && schedule.dayOfWeek !== undefined) {
          const [hours, minutes] = schedule.time.split(':').map(Number);
          return `${minutes} ${hours} * * ${schedule.dayOfWeek}`;
        }
        break;

      case 'monthly':
        if (schedule.time && schedule.dayOfMonth) {
          const [hours, minutes] = schedule.time.split(':').map(Number);
          return `${minutes} ${hours} ${schedule.dayOfMonth} * *`;
        }
        break;

      case 'custom':
        if (schedule.cronExpression) {
          return schedule.cronExpression;
        }
        break;
    }

    return null;
  }

  // スケジュールされたタスクを実行
  private async executeScheduledTask(scheduleId: string): Promise<void> {
    try {
      // スケジュールサービスの即時実行機能を使用
      await scheduleService.executeScheduleNow(scheduleId);
    } catch (error) {
      console.error(`[Schedule Engine] Failed to execute scheduled task ${scheduleId}:`, error);
    }
  }

  // アクティブなタスク数を取得
  getActiveTaskCount(): number {
    return this.activeTasks.size;
  }

  // 特定のスケジュールがアクティブかチェック
  isTaskActive(scheduleId: string): boolean {
    return this.activeTasks.has(scheduleId);
  }

  // すべてのアクティブタスクのIDを取得
  getActiveTaskIds(): string[] {
    return Array.from(this.activeTasks.keys());
  }

  // エンジンの状態を取得
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeTaskCount: this.getActiveTaskCount(),
      activeTaskIds: this.getActiveTaskIds()
    };
  }
}

// シングルトンインスタンス
export const scheduleEngine = new ScheduleExecutionEngine();