import { TrendReport } from "@/types/trendReport";
import { ITrendReportRepository } from "../ports/ITrendReportRepository";
import { TrendReportRepository } from "../infrastructure/TrendReportRepository";

export class UpdateTrendReport {
  private repository: ITrendReportRepository;

  constructor(repository?: ITrendReportRepository) {
    this.repository = repository || new TrendReportRepository();
  }

  async execute(
    id: string,
    data: Omit<TrendReport, "id">
  ): Promise<TrendReport> {
    return this.repository.update(id, data);
  }
}
