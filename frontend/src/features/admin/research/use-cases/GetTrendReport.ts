import { TrendReport } from "@/types/trendReport";
import { ITrendReportRepository } from "../ports/ITrendReportRepository";
import { TrendReportRepository } from "../infrastructure/TrendReportRepository";

export class GetTrendReport {
  private repository: ITrendReportRepository;

  constructor(repository?: ITrendReportRepository) {
    this.repository = repository || new TrendReportRepository();
  }

  async execute(id: string): Promise<TrendReport | null> {
    return this.repository.findById(id);
  }
}
