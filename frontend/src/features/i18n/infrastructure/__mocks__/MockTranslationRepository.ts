import { Translation, Locale } from "@/types/i18n";
import { ITranslationRepository } from "../../ports/ITranslationRepository";

export class MockTranslationRepository implements ITranslationRepository {
  private mockTranslations: Record<Locale, Translation>;
  private supportedLocales: Locale[];
  private defaultLocale: Locale;

  constructor(
    mockData?: Record<Locale, Translation>,
    supportedLocales?: Locale[],
    defaultLocale?: Locale
  ) {
    this.mockTranslations = mockData || {
      ja: { hello: "こんにちは" },
      en: { hello: "Hello" },
    };
    this.supportedLocales = supportedLocales || ["ja", "en"];
    this.defaultLocale = defaultLocale || "ja";
  }

  async getTranslations(locale: Locale): Promise<Translation> {
    return this.mockTranslations[locale] || {};
  }

  async getSupportedLocales(): Promise<Locale[]> {
    return this.supportedLocales;
  }

  async getDefaultLocale(): Promise<Locale> {
    return this.defaultLocale;
  }
}
