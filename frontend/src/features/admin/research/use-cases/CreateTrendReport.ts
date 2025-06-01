import { TrendReport } from "@/types/trendReport";
import { ITrendReportRepository } from "../ports/ITrendReportRepository";
import { TrendReportRepository } from "../infrastructure/TrendReportRepository";

export class CreateTrendReport {
  private repository: ITrendReportRepository;

  constructor(repository?: ITrendReportRepository) {
    this.repository = repository || new TrendReportRepository();
  }

  async execute(data: Omit<TrendReport, "id">): Promise<TrendReport> {
    return this.repository.create(data);
  }
}
