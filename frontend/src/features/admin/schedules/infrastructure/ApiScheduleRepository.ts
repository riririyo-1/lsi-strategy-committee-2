import { IScheduleRepository } from "../ports/IScheduleRepository";
import { Schedule, ScheduleFormData, ScheduleExecution } from "@/types/schedule";
import { schedulesApi } from "@/lib/apiClient";

export class ApiScheduleRepository implements IScheduleRepository {
  async getAll(): Promise<Schedule[]> {
    const response = await schedulesApi.getAll();
    return response.data;
  }

  async getById(id: string): Promise<Schedule | null> {
    try {
      const response = await schedulesApi.getById(id);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async create(data: ScheduleFormData): Promise<Schedule> {
    const response = await schedulesApi.create(data);
    return response.data;
  }

  async update(id: string, data: Partial<ScheduleFormData>): Promise<Schedule> {
    const response = await schedulesApi.update(id, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await schedulesApi.delete(id);
  }

  async activate(id: string): Promise<void> {
    await schedulesApi.activate(id);
  }

  async deactivate(id: string): Promise<void> {
    await schedulesApi.deactivate(id);
  }

  async getExecutions(scheduleId: string, limit?: number): Promise<ScheduleExecution[]> {
    const response = await schedulesApi.getExecutions(scheduleId, limit);
    return response.data;
  }

  async getLatestExecution(scheduleId: string): Promise<ScheduleExecution | null> {
    try {
      const response = await schedulesApi.getLatestExecution(scheduleId);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async executeNow(scheduleId: string): Promise<ScheduleExecution> {
    const response = await schedulesApi.executeNow(scheduleId);
    return response.data;
  }
}