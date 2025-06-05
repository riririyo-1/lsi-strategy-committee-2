import { PrismaClient } from "@prisma/client";
import { Schedule, ScheduleExecution, CreateScheduleInput, UpdateScheduleInput } from "../entities/schedule";
import { ScheduleType, ScheduleExecutionType } from "../types/schedule";

const prisma = new PrismaClient();

export class ScheduleService {
  
  // スケジュール一覧取得
  async getAllSchedules(): Promise<Schedule[]> {
    const schedules = await prisma.schedule.findMany({
      orderBy: [
        { isActive: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return schedules.map(this.convertToSchedule);
  }

  // スケジュール詳細取得
  async getScheduleById(id: string): Promise<Schedule | null> {
    const schedule = await prisma.schedule.findUnique({
      where: { id }
    });

    if (!schedule) return null;
    return this.convertToSchedule(schedule);
  }

  // スケジュール作成
  async createSchedule(input: CreateScheduleInput): Promise<Schedule> {
    // nextRunの計算
    const nextRun = this.calculateNextRun(input);

    const schedule = await prisma.schedule.create({
      data: {
        name: input.name,
        description: input.description,
        scheduleType: input.scheduleType,
        cronExpression: input.cronExpression,
        time: input.time,
        dayOfWeek: input.dayOfWeek,
        dayOfMonth: input.dayOfMonth,
        taskType: input.taskType,
        taskConfig: input.taskConfig,
        isActive: input.isActive ?? true,
        nextRun: nextRun
      }
    });

    return this.convertToSchedule(schedule);
  }

  // スケジュール更新
  async updateSchedule(id: string, input: UpdateScheduleInput): Promise<Schedule> {
    // 次回実行時刻の再計算
    const nextRun = input.scheduleType || input.time || input.dayOfWeek !== undefined || input.dayOfMonth !== undefined
      ? this.calculateNextRun(input as CreateScheduleInput)
      : undefined;

    const updateData: any = {
      ...input,
      updatedAt: new Date()
    };

    if (nextRun !== undefined) {
      updateData.nextRun = nextRun;
    }

    const schedule = await prisma.schedule.update({
      where: { id },
      data: updateData
    });

    return this.convertToSchedule(schedule);
  }

  // スケジュール削除
  async deleteSchedule(id: string): Promise<void> {
    await prisma.schedule.delete({
      where: { id }
    });
  }

  // スケジュール有効化
  async activateSchedule(id: string): Promise<void> {
    const schedule = await prisma.schedule.findUnique({ where: { id } });
    if (!schedule) throw new Error("Schedule not found");

    const nextRun = this.calculateNextRun(schedule as any);

    await prisma.schedule.update({
      where: { id },
      data: { 
        isActive: true,
        nextRun: nextRun
      }
    });
  }

  // スケジュール無効化
  async deactivateSchedule(id: string): Promise<void> {
    await prisma.schedule.update({
      where: { id },
      data: { 
        isActive: false,
        nextRun: null
      }
    });
  }

  // 即時実行
  async executeScheduleNow(scheduleId: string): Promise<ScheduleExecution> {
    // 実行履歴を作成
    const execution = await prisma.scheduleExecution.create({
      data: {
        scheduleId,
        status: "pending"
      }
    });

    // 非同期でタスクを実行
    this.executeTask(execution.id, scheduleId).catch(error => {
      console.error(`Failed to execute schedule ${scheduleId}:`, error);
    });

    return this.convertToScheduleExecution(execution);
  }

  // 実行履歴取得
  async getExecutions(scheduleId: string, limit?: number): Promise<ScheduleExecution[]> {
    const executions = await prisma.scheduleExecution.findMany({
      where: { scheduleId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return executions.map(this.convertToScheduleExecution);
  }

  // 最新実行取得
  async getLatestExecution(scheduleId: string): Promise<ScheduleExecution | null> {
    const execution = await prisma.scheduleExecution.findFirst({
      where: { scheduleId },
      orderBy: { createdAt: 'desc' }
    });

    if (!execution) return null;
    return this.convertToScheduleExecution(execution);
  }

  // 次回実行時刻の計算
  private calculateNextRun(schedule: Partial<CreateScheduleInput>): Date | null {
    if (!schedule.isActive && schedule.isActive !== undefined) return null;

    const now = new Date();
    let nextRun = new Date(now);

    switch (schedule.scheduleType) {
      case "daily":
        if (schedule.time) {
          const [hours, minutes] = schedule.time.split(':').map(Number);
          nextRun.setHours(hours, minutes, 0, 0);
          
          // 今日の指定時刻が過ぎている場合は明日に設定
          if (nextRun <= now) {
            nextRun.setDate(nextRun.getDate() + 1);
          }
        }
        break;

      case "weekly":
        if (schedule.dayOfWeek !== undefined && schedule.time) {
          const [hours, minutes] = schedule.time.split(':').map(Number);
          const daysUntilTarget = (schedule.dayOfWeek - now.getDay() + 7) % 7;
          
          nextRun.setDate(now.getDate() + daysUntilTarget);
          nextRun.setHours(hours, minutes, 0, 0);
          
          // 今週の指定時刻が過ぎている場合は来週に設定
          if (nextRun <= now) {
            nextRun.setDate(nextRun.getDate() + 7);
          }
        }
        break;

      case "monthly":
        if (schedule.dayOfMonth !== undefined && schedule.time) {
          const [hours, minutes] = schedule.time.split(':').map(Number);
          
          nextRun.setDate(schedule.dayOfMonth);
          nextRun.setHours(hours, minutes, 0, 0);
          
          // 今月の指定日時が過ぎている場合は来月に設定
          if (nextRun <= now) {
            nextRun.setMonth(nextRun.getMonth() + 1);
          }
        }
        break;

      case "custom":
        // Cron式の場合は外部ライブラリで計算する必要がある
        // 今回は簡易実装として null を返す
        return null;

      default:
        return null;
    }

    return nextRun;
  }

  // タスク実行
  private async executeTask(executionId: string, scheduleId: string): Promise<void> {
    try {
      // 実行開始
      await prisma.scheduleExecution.update({
        where: { id: executionId },
        data: { 
          status: "running",
          startedAt: new Date()
        }
      });

      const schedule = await prisma.schedule.findUnique({ where: { id: scheduleId } });
      if (!schedule) throw new Error("Schedule not found");

      // タスクタイプに応じて実行
      let result: any = {};
      
      switch (schedule.taskType) {
        case "rss_collection":
          result = await this.executeRSSCollection(schedule.taskConfig);
          break;
        case "labeling":
          result = await this.executeLabeling(schedule.taskConfig);
          break;
        case "summarization":
          result = await this.executeSummarization(schedule.taskConfig);
          break;
        case "categorization":
          result = await this.executeCategorization(schedule.taskConfig);
          break;
        case "batch_process":
          result = await this.executeBatchProcess(schedule.taskConfig);
          break;
        default:
          throw new Error(`Unknown task type: ${schedule.taskType}`);
      }

      // 実行完了
      await prisma.scheduleExecution.update({
        where: { id: executionId },
        data: {
          status: "completed",
          completedAt: new Date(),
          result: result
        }
      });

      // スケジュールのlastRunとnextRunを更新
      const nextRun = this.calculateNextRun(schedule as any);
      await prisma.schedule.update({
        where: { id: scheduleId },
        data: {
          lastRun: new Date(),
          nextRun: nextRun
        }
      });

    } catch (error: any) {
      console.error(`Task execution failed for schedule ${scheduleId}:`, error);
      
      // 実行失敗
      await prisma.scheduleExecution.update({
        where: { id: executionId },
        data: {
          status: "failed",
          completedAt: new Date(),
          errorMessage: error.message || "Unknown error"
        }
      });
    }
  }

  // RSS収集タスクの実行
  private async executeRSSCollection(config: any): Promise<any> {
    try {
      const pipelineUrl = process.env.PIPELINE_URL_INTERNAL || "http://pipeline:8000";
      
      const response = await fetch(`${pipelineUrl}/api/crawl`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          days: config.daysToCollect || 1,
          sources: config.sources
        })
      });

      if (!response.ok) {
        throw new Error(`Pipeline API error: ${response.status}`);
      }

      const result = await response.json();
      
      return {
        task: "rss_collection",
        sources: config.sources,
        daysToCollect: config.daysToCollect,
        articlesCollected: result.articlesCollected || 0,
        pipelineResponse: result,
        executedAt: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('RSS collection task failed:', error);
      throw new Error(`RSS collection failed: ${error.message}`);
    }
  }

  // ラベル付与タスクの実行
  private async executeLabeling(config: any): Promise<any> {
    try {
      const pipelineUrl = process.env.PIPELINE_URL_INTERNAL || "http://pipeline:8000";
      
      // 対象記事の取得
      let articleIds: string[] = [];
      if (config.articleFilter) {
        articleIds = await this.getFilteredArticleIds(config.articleFilter);
      }

      const response = await fetch(`${pipelineUrl}/api/llm/labels-only`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          article_ids: articleIds.length > 0 ? articleIds : undefined,
          limit: 50
        })
      });

      if (!response.ok) {
        throw new Error(`Pipeline API error: ${response.status}`);
      }

      const result = await response.json();
      
      return {
        task: "labeling",
        articlesProcessed: result.processed_count || 0,
        pipelineResponse: result,
        executedAt: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Labeling task failed:', error);
      throw new Error(`Labeling failed: ${error.message}`);
    }
  }

  // 要約作成タスクの実行
  private async executeSummarization(config: any): Promise<any> {
    try {
      const pipelineUrl = process.env.PIPELINE_URL_INTERNAL || "http://pipeline:8000";
      
      // 対象記事の取得
      let articleIds: string[] = [];
      if (config.articleFilter) {
        articleIds = await this.getFilteredArticleIds(config.articleFilter);
      }

      const response = await fetch(`${pipelineUrl}/api/llm/summarize-only`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          article_ids: articleIds.length > 0 ? articleIds : undefined,
          limit: 50
        })
      });

      if (!response.ok) {
        throw new Error(`Pipeline API error: ${response.status}`);
      }

      const result = await response.json();
      
      return {
        task: "summarization",
        articlesProcessed: result.processed_count || 0,
        pipelineResponse: result,
        executedAt: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Summarization task failed:', error);
      throw new Error(`Summarization failed: ${error.message}`);
    }
  }

  // バッチ処理タスクの実行
  private async executeBatchProcess(config: any): Promise<any> {
    try {
      const pipelineUrl = process.env.PIPELINE_URL_INTERNAL || "http://pipeline:8000";
      
      const response = await fetch(`${pipelineUrl}/api/summarize/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          limit: config.batchSize || 50,
          include_categorization: config.includeCategorization || false
        })
      });

      if (!response.ok) {
        throw new Error(`Pipeline API error: ${response.status}`);
      }

      const result = await response.json();
      
      return {
        task: "batch_process",
        batchSize: config.batchSize,
        includeLabeling: config.includeLabeling,
        includeSummarization: config.includeSummarization,
        includeCategorization: config.includeCategorization,
        articlesProcessed: result.processed_count || 0,
        pipelineResponse: result,
        executedAt: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Batch process task failed:', error);
      throw new Error(`Batch process failed: ${error.message}`);
    }
  }

  // カテゴリ分類タスクの実行
  private async executeCategorization(config: any): Promise<any> {
    try {
      const pipelineUrl = process.env.PIPELINE_URL_INTERNAL || "http://pipeline:8000";
      
      // 対象記事の取得
      let articleIds: string[] = [];
      if (config.articleFilter) {
        articleIds = await this.getFilteredArticleIds(config.articleFilter);
      }

      const response = await fetch(`${pipelineUrl}/api/categorize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          article_ids: articleIds.length > 0 ? articleIds : undefined,
          categories: config.categories,
          model_name: config.modelName
        })
      });

      if (!response.ok) {
        throw new Error(`Pipeline API error: ${response.status}`);
      }

      const result = await response.json();
      
      return {
        task: "categorization",
        articlesProcessed: result.processed_count || 0,
        pipelineResponse: result,
        executedAt: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Categorization task failed:', error);
      throw new Error(`Categorization failed: ${error.message}`);
    }
  }

  // フィルタ条件に基づいて記事IDを取得
  private async getFilteredArticleIds(filter: any): Promise<string[]> {
    const where: any = {};

    // ラベルがない記事のみ
    if (filter.onlyWithoutLabels) {
      where.labels = { isEmpty: true };
    }

    // 要約がない記事のみ
    if (filter.onlyWithoutSummary) {
      where.OR = [
        { summary: null },
        { summary: "" }
      ];
    }

    // 対象ソース
    if (filter.sources && filter.sources.length > 0) {
      where.source = { in: filter.sources };
    }

    // 何日前までの記事か
    if (filter.daysOld) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - filter.daysOld);
      where.publishedAt = { gte: cutoffDate };
    }

    const articles = await prisma.article.findMany({
      where,
      select: { id: true },
      take: 1000 // 最大1000件
    });

    return articles.map(article => article.id);
  }

  // Prismaオブジェクトをエンティティに変換
  private convertToSchedule(prismaSchedule: any): Schedule {
    return {
      id: prismaSchedule.id,
      name: prismaSchedule.name,
      description: prismaSchedule.description,
      scheduleType: prismaSchedule.scheduleType,
      cronExpression: prismaSchedule.cronExpression,
      time: prismaSchedule.time,
      dayOfWeek: prismaSchedule.dayOfWeek,
      dayOfMonth: prismaSchedule.dayOfMonth,
      taskType: prismaSchedule.taskType,
      taskConfig: prismaSchedule.taskConfig,
      isActive: prismaSchedule.isActive,
      lastRun: prismaSchedule.lastRun?.toISOString(),
      nextRun: prismaSchedule.nextRun?.toISOString(),
      createdAt: prismaSchedule.createdAt.toISOString(),
      updatedAt: prismaSchedule.updatedAt.toISOString()
    };
  }

  private convertToScheduleExecution(prismaExecution: any): ScheduleExecution {
    return {
      id: prismaExecution.id,
      scheduleId: prismaExecution.scheduleId,
      status: prismaExecution.status,
      startedAt: prismaExecution.startedAt.toISOString(),
      completedAt: prismaExecution.completedAt?.toISOString(),
      result: prismaExecution.result,
      errorMessage: prismaExecution.errorMessage,
      createdAt: prismaExecution.createdAt.toISOString()
    };
  }
}