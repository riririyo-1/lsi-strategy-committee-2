import { ITrendReportRepository } from "../ports/ITrendReportRepository";
import { TrendReportRepository } from "../infrastructure/TrendReportRepository";

export class DeleteTrendReport {
  private repository: ITrendReportRepository;

  constructor(repository?: ITrendReportRepository) {
    this.repository = repository || new TrendReportRepository();
  }

  async execute(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}
