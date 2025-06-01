import { Translation } from "@/types/i18n";
import { Locale } from "../constants";

export interface ITranslationRepository {
  getTranslations(locale: Locale): Promise<Translation>;
  getSupportedLocales(): Promise<Locale[]>;
  getDefaultLocale(): Promise<Locale>;
}
