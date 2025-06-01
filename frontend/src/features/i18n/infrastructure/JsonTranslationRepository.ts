import { Translation } from "@/types/i18n";
import { Locale, supportedLocales, defaultLocale } from "../constants";
import { ITranslationRepository } from "../ports/ITranslationRepository";
import { getTranslation } from "../translations";

export class JsonTranslationRepository implements ITranslationRepository {
  // 内部キャッシュ（インスタンスレベルで翻訳データを保持）
  private translationCache: Record<Locale, Translation> = {} as Record<
    Locale,
    Translation
  >;

  async getTranslations(locale: Locale): Promise<Translation> {
    try {
      // キャッシュを優先的に使用
      if (this.translationCache[locale]) {
        return this.translationCache[locale];
      }

      // 翻訳データの取得
      const translation = await getTranslation(locale);

      // 取得したデータがあればキャッシュ
      if (Object.keys(translation).length > 0) {
        this.translationCache[locale] = translation;
        return translation;
      }

      // データが取得できなかった場合はデフォルトロケールを試す
      if (locale !== defaultLocale) {
        const defaultTranslation = await getTranslation(defaultLocale);
        this.translationCache[defaultLocale] = defaultTranslation;
        return defaultTranslation;
      }

      // それでもダメなら最低限の空オブジェクトを返す
      return {};
    } catch (error) {
      console.error(`Failed to load translations for ${locale}:`, error);
      return {};
    }
  }

  async getSupportedLocales(): Promise<Locale[]> {
    return supportedLocales;
  }

  async getDefaultLocale(): Promise<Locale> {
    return defaultLocale;
  }
}
