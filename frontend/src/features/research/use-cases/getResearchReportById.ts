import { TrendReport } from "@/types/trendReport";
import { GetTrendReport } from "@/features/admin/research/use-cases/GetTrendReport";

// API経由ではなく直接リポジトリを使用するように修正
export async function getResearchReportById(
  id: string
): Promise<TrendReport | null> {
  try {
    console.log(`getResearchReportById called with ID: ${id}`);

    // リポジトリを直接使用したユースケースを実行
    const useCase = new GetTrendReport();
    const report = await useCase.execute(id);

    // レポートが取得できたかログ出力
    if (report) {
      console.log(`Report found with ID: ${id}`);
      return report;
    } else {
      console.log(`No report found with ID: ${id}`);
      return null;
    }
  } catch (error) {
    console.error(`レポートID:${id}の取得に失敗しました:`, error);
    throw error;
  }
}
