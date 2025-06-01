import { Translation } from "@/types/i18n";
import { Locale, defaultLocale } from "../constants";
import { ITranslationRepository } from "../ports/ITranslationRepository";

export class GetTranslations {
  constructor(private readonly translationRepository: ITranslationRepository) {}

  async execute(locale: Locale): Promise<Translation> {
    try {
      return await this.translationRepository.getTranslations(locale);
    } catch (error) {
      console.error(`Failed to get translations for ${locale}:`, error);

      // 失敗した場合はデフォルトロケールを試す（locale がすでにデフォルトでない場合）
      if (locale !== defaultLocale) {
        try {
          return await this.translationRepository.getTranslations(
            defaultLocale
          );
        } catch {
          // デフォルトロケールも失敗した場合は空のオブジェクトを返す
          return {};
        }
      }

      return {};
    }
  }
}
