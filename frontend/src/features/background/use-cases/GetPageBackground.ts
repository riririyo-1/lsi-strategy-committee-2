import { BackgroundConfig } from "@/types/BackgroundConfig";
import { IBackgroundRepository } from "../ports/IBackgroundRepository";

export class GetPageBackground {
  constructor(private readonly backgroundRepository: IBackgroundRepository) {}

  async execute(pageId: string): Promise<BackgroundConfig | undefined> {
    const settings = await this.backgroundRepository.loadSettings();

    // ビジネスロジック（例：ページIDの正規化）
    const normalizedPageId = this.normalizePageId(pageId);

    return settings[normalizedPageId] || settings["default"];
  }

  private normalizePageId(pageId: string): string {
    // スラッシュで始まるパスをIDに変換
    if (pageId === "/") return "home";
    // 先頭のスラッシュを除去
    return pageId.replace(/^\//, "");
  }
}
