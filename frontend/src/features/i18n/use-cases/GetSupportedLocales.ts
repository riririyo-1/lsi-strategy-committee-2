import { Locale } from "../constants";
import { ITranslationRepository } from "../ports/ITranslationRepository";

export class GetSupportedLocales {
  constructor(private readonly translationRepository: ITranslationRepository) {}

  async execute(): Promise<{
    supportedLocales: Locale[];
    defaultLocale: Locale;
  }> {
    const supportedLocales =
      await this.translationRepository.getSupportedLocales();
    const defaultLocale = await this.translationRepository.getDefaultLocale();

    return {
      supportedLocales,
      defaultLocale,
    };
  }
}
