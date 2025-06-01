import { PageBackgroundSettings } from "@/types/BackgroundConfig";
import { IBackgroundRepository } from "../../ports/IBackgroundRepository";

export class MockBackgroundRepository implements IBackgroundRepository {
  constructor(
    private mockData: PageBackgroundSettings = {
      default: { type: "color", value: "#000000" },
    }
  ) {}

  async loadSettings(): Promise<PageBackgroundSettings> {
    return this.mockData;
  }
}
