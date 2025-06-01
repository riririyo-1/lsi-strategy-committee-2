// src/features/i18n/translations/index.ts
import { Locale } from "../constants";
import { Translation } from "@/types/i18n";

// クライアントサイド: fetchで取得
export async function getTranslation(locale: Locale): Promise<Translation> {
  try {
    const res = await fetch(`/locales/${locale}.json`);
    if (!res.ok) throw new Error("Failed to fetch translation");
    return await res.json();
  } catch (error) {
    console.error(`Failed to fetch translation for ${locale}:`, error);
    return {};
  }
}
