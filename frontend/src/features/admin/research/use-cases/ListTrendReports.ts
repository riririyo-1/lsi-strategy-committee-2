import { TrendReport } from "@/types/trendReport";
import { ITrendReportRepository } from "../ports/ITrendReportRepository";
import { TrendReportRepository } from "../infrastructure/TrendReportRepository";

export class ListTrendReports {
  private repository: ITrendReportRepository;

  constructor(repository?: ITrendReportRepository) {
    this.repository = repository || new TrendReportRepository();
  }

  async execute(): Promise<TrendReport[]> {
    return this.repository.findAll();
  }
}
