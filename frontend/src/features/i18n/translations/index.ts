// src/features/i18n/translations/index.ts
import { Locale } from "../constants";
import { Translation } from "@/types/i18n";

// フォールバック翻訳（最低限の翻訳データ）
const fallbackTranslations: Translation = {
  common: {
    loading: "Loading...",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    save: "Save",
    search: "Search",
    back: "Back",
  },
  nav: {
    home: "Home",
    research: "Research",
    topics: "Topics",
    analysis: "Analysis",
    contact: "Contact",
    admin: "Admin",
    articles: "Articles",
  },
  articles: {
    title: "Articles",
    description: "Latest semiconductor industry articles",
  },
  topics: {
    title: "Topics",
    description: "Monthly semiconductor industry topics",
  },
  admin: {
    topics: {
      management: "Topics Management",
      create: "Create New Topic",
      edit: "Edit",
      delete: "Delete",
    },
  },
};

// クライアントサイド: fetchで取得
export async function getTranslation(locale: Locale): Promise<Translation> {
  try {
    const res = await fetch(`/locales/${locale}.json`, {
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    if (!res.ok) {
      console.warn(`Translation file for ${locale} not found, using fallback`);
      return fallbackTranslations;
    }
    const translations = await res.json();
    return translations;
  } catch (error) {
    console.error(`Failed to fetch translation for ${locale}:`, error);
    return fallbackTranslations;
  }
}
