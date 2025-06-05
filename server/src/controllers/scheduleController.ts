import { Request, Response } from "express";
import { ScheduleService } from "../services/scheduleService";
import { CreateScheduleInput, UpdateScheduleInput } from "../entities/schedule";
import { scheduleEngine } from "../services/scheduleExecutionEngine";

const scheduleService = new ScheduleService();

// スケジュール一覧取得
export const getSchedules = async (req: Request, res: Response) => {
  try {
    const schedules = await scheduleService.getAllSchedules();
    res.json(schedules);
  } catch (error: any) {
    console.error("Failed to get schedules:", error);
    res.status(500).json({ 
      error: "Failed to get schedules",
      message: error.message 
    });
  }
};

// スケジュール詳細取得
export const getScheduleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const schedule = await scheduleService.getScheduleById(id);
    
    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }
    
    res.json(schedule);
  } catch (error: any) {
    console.error("Failed to get schedule:", error);
    res.status(500).json({ 
      error: "Failed to get schedule",
      message: error.message 
    });
  }
};

// スケジュール作成
export const createSchedule = async (req: Request, res: Response) => {
  try {
    const input: CreateScheduleInput = req.body;
    
    // バリデーション
    const validationError = validateScheduleInput(input);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }
    
    const schedule = await scheduleService.createSchedule(input);
    
    // アクティブなスケジュールの場合、エンジンに登録
    if (schedule.isActive) {
      await scheduleEngine.scheduleTask(schedule.id);
    }
    
    res.status(201).json(schedule);
  } catch (error: any) {
    console.error("Failed to create schedule:", error);
    res.status(500).json({ 
      error: "Failed to create schedule",
      message: error.message 
    });
  }
};

// スケジュール更新
export const updateSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const input: UpdateScheduleInput = req.body;
    
    const schedule = await scheduleService.updateSchedule(id, input);
    
    // スケジュールエンジンの更新
    if (schedule.isActive) {
      await scheduleEngine.scheduleTask(schedule.id);
    } else {
      await scheduleEngine.unscheduleTask(schedule.id);
    }
    
    res.json(schedule);
  } catch (error: any) {
    console.error("Failed to update schedule:", error);
    res.status(500).json({ 
      error: "Failed to update schedule",
      message: error.message 
    });
  }
};

// スケジュール削除
export const deleteSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await scheduleService.deleteSchedule(id);
    
    // スケジュールエンジンからも削除
    await scheduleEngine.unscheduleTask(id);
    
    res.status(204).send();
  } catch (error: any) {
    console.error("Failed to delete schedule:", error);
    res.status(500).json({ 
      error: "Failed to delete schedule",
      message: error.message 
    });
  }
};

// スケジュール有効化
export const activateSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await scheduleService.activateSchedule(id);
    
    // スケジュールエンジンに登録
    await scheduleEngine.scheduleTask(id);
    
    res.json({ message: "Schedule activated successfully" });
  } catch (error: any) {
    console.error("Failed to activate schedule:", error);
    res.status(500).json({ 
      error: "Failed to activate schedule",
      message: error.message 
    });
  }
};

// スケジュール無効化
export const deactivateSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await scheduleService.deactivateSchedule(id);
    
    // スケジュールエンジンから削除
    await scheduleEngine.unscheduleTask(id);
    
    res.json({ message: "Schedule deactivated successfully" });
  } catch (error: any) {
    console.error("Failed to deactivate schedule:", error);
    res.status(500).json({ 
      error: "Failed to deactivate schedule",
      message: error.message 
    });
  }
};

// スケジュール即時実行
export const executeScheduleNow = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const execution = await scheduleService.executeScheduleNow(id);
    res.json(execution);
  } catch (error: any) {
    console.error("Failed to execute schedule:", error);
    res.status(500).json({ 
      error: "Failed to execute schedule",
      message: error.message 
    });
  }
};

// 実行履歴取得
export const getScheduleExecutions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    
    const executions = await scheduleService.getExecutions(id, limit);
    res.json(executions);
  } catch (error: any) {
    console.error("Failed to get schedule executions:", error);
    res.status(500).json({ 
      error: "Failed to get schedule executions",
      message: error.message 
    });
  }
};

// 最新実行取得
export const getLatestExecution = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const execution = await scheduleService.getLatestExecution(id);
    
    if (!execution) {
      return res.status(404).json({ error: "No execution found" });
    }
    
    res.json(execution);
  } catch (error: any) {
    console.error("Failed to get latest execution:", error);
    res.status(500).json({ 
      error: "Failed to get latest execution",
      message: error.message 
    });
  }
};

// バリデーション関数
function validateScheduleInput(input: CreateScheduleInput): string | null {
  if (!input.name || input.name.trim().length === 0) {
    return "Schedule name is required";
  }
  
  if (!input.scheduleType) {
    return "Schedule type is required";
  }
  
  if (!["daily", "weekly", "monthly", "custom"].includes(input.scheduleType)) {
    return "Invalid schedule type";
  }
  
  if (!input.taskType) {
    return "Task type is required";
  }
  
  if (!["rss_collection", "labeling", "summarization", "categorization", "batch_process"].includes(input.taskType)) {
    return "Invalid task type";
  }
  
  // スケジュールタイプ別のバリデーション
  switch (input.scheduleType) {
    case "daily":
      if (!input.time) {
        return "Time is required for daily schedule";
      }
      break;
    case "weekly":
      if (!input.time || input.dayOfWeek === undefined) {
        return "Time and day of week are required for weekly schedule";
      }
      if (input.dayOfWeek < 0 || input.dayOfWeek > 6) {
        return "Day of week must be between 0 and 6";
      }
      break;
    case "monthly":
      if (!input.time || !input.dayOfMonth) {
        return "Time and day of month are required for monthly schedule";
      }
      if (input.dayOfMonth < 1 || input.dayOfMonth > 31) {
        return "Day of month must be between 1 and 31";
      }
      break;
    case "custom":
      if (!input.cronExpression) {
        return "Cron expression is required for custom schedule";
      }
      break;
  }
  
  // 時刻フォーマットのバリデーション
  if (input.time && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(input.time)) {
    return "Time must be in HH:MM format";
  }
  
  return null;
}