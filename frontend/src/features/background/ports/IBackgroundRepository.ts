import { PageBackgroundSettings } from "@/types/BackgroundConfig";

export interface IBackgroundRepository {
  loadSettings(): Promise<PageBackgroundSettings>;
}
