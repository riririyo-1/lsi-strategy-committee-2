import { TrendReport } from "@/types/trendReport";

export interface ITrendReportRepository {
  findAll(): Promise<TrendReport[]>;
  findById(id: string): Promise<TrendReport | null>;
  create(data: Omit<TrendReport, "id">): Promise<TrendReport>;
  update(id: string, data: Omit<TrendReport, "id">): Promise<TrendReport>;
  delete(id: string): Promise<void>;
}
