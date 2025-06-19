import axios from "axios";
import { RSSCollectDto, BatchCreateResult } from "../types/article";

export class RSSCollectService {
  private pipelineUrl: string;

  constructor() {
    this.pipelineUrl = process.env.PIPELINE_URL_INTERNAL || "http://pipeline:8000";
  }

  async collectRSS(dto: RSSCollectDto): Promise<BatchCreateResult> {
    try {
      console.log(`RSS収集開始: sources=${dto.sources}, period=${dto.startDate}〜${dto.endDate}`);

      // PipelineのRSS収集エンドポイントを呼び出し
      const response = await axios.post(`${this.pipelineUrl}/collect-rss`, {
        sources: dto.sources,
        startDate: dto.startDate,
        endDate: dto.endDate,
      });

      const result = response.data;
      console.log(
        `Pipeline収集完了: inserted=${result.insertedCount}, skipped=${result.skippedCount}, invalid=${result.invalidCount}`
      );

      // レスポンス形式を統一
      return {
        success: true,
        insertedCount: result.insertedCount || 0,
        skippedCount: result.skippedCount || 0,
        invalidCount: result.invalidCount || 0,
        invalidItems: result.invalidItems || [],
      };
    } catch (error: any) {
      console.error("RSS収集エラー:", error);

      if (error.code === "ECONNREFUSED" || error.message?.includes("ECONNREFUSED")) {
        throw new Error("Pipeline サービスに接続できません");
      }

      throw new Error(
        error.response?.data?.detail || "RSS収集処理に失敗しました"
      );
    }
  }
}

// シングルトンインスタンスをエクスポート
export const rssCollectService = new RSSCollectService();