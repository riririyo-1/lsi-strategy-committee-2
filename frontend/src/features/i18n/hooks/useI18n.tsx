"use client";

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
  useMemo,
} from "react";
import { Translation } from "@/types/i18n";
import { Locale, supportedLocales, defaultLocale } from "../constants";
import { JsonTranslationRepository } from "../infrastructure/JsonTranslationRepository";
import { GetTranslations } from "../use-cases/GetTranslations";
import { GetSupportedLocales } from "../use-cases/GetSupportedLocales";
import { ITranslationRepository } from "../ports/ITranslationRepository";

// コンテキストの型
interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  translations: Translation;
  t: (key: string, params?: Record<string, string>) => string;
  isLoading: boolean;
  supportedLocales: Locale[];
}

// デフォルト値
const defaultContext: I18nContextType = {
  locale: defaultLocale,
  setLocale: () => {},
  translations: {},
  t: (key) => key,
  isLoading: true,
  supportedLocales: supportedLocales,
};

// Reactコンテキストの作成
export const I18nContext = createContext<I18nContextType>(defaultContext);

interface I18nProviderProps {
  children: ReactNode;
  repository?: ITranslationRepository;
  initialLocale?: Locale;
}

// プロバイダーコンポーネント
export const I18nProvider: React.FC<I18nProviderProps> = ({
  children,
  repository = new JsonTranslationRepository(),
  initialLocale,
}) => {
  // SSR時は初期値のみ返す（副作用・fetch禁止）
  if (typeof window === "undefined") {
    return (
      <I18nContext.Provider value={defaultContext}>
        {children}
      </I18nContext.Provider>
    );
  }

  // クライアントサイドで実行時、ローカルストレージからロケールを取得
  const getInitialLocale = (): Locale => {
    if (initialLocale) return initialLocale;

    try {
      const savedLocale = localStorage.getItem("locale") as Locale;
      if (savedLocale && supportedLocales.includes(savedLocale)) {
        return savedLocale;
      }
    } catch (e) {
      console.error("ローカルストレージへのアクセスに失敗しました。");
    }

    return defaultLocale;
  };

  const [locale, setLocaleState] = useState<Locale>(getInitialLocale());
  const [translations, setTranslations] = useState<Translation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [availableLocales, setAvailableLocales] =
    useState<Locale[]>(supportedLocales);

  // 利用可能な言語リストの取得（クライアントのみ）
  useEffect(() => {
    const fetchSupportedLocales = async () => {
      try {
        const locales = await repository.getSupportedLocales();
        setAvailableLocales(locales);
      } catch (error) {
        console.error("対応言語の取得に失敗しました:", error);
      }
    };

    fetchSupportedLocales();
  }, [repository]);

  // ロケール変更時に翻訳を取得（クライアントのみ）
  useEffect(() => {
    let isMounted = true;
    const fetchTranslations = async () => {
      setIsLoading(true);
      try {
        const data = await repository.getTranslations(locale);

        // コンポーネントがアンマウントされていなければ状態を更新
        if (isMounted && Object.keys(data).length > 0) {
          setTranslations(data);
        }
      } catch (error) {
        console.error("翻訳の取得に失敗しました:", error);
        // エラー時はステートを更新しない（ループ防止）
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchTranslations();

    // クリーンアップ関数
    return () => {
      isMounted = false;
    };
  }, [locale, repository]);

  // ロケール設定と保存（クライアントのみ）
  const setLocale = (newLocale: Locale) => {
    // 現在のロケールと同じなら何もしない（ループ防止）
    if (newLocale === locale) {
      return;
    }

    // 有効なロケールかチェック
    if (newLocale && availableLocales.includes(newLocale)) {
      setLocaleState(newLocale);

      // ローカルストレージに保存
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem("locale", newLocale);
        }
      } catch (e) {
        console.error("ローカルストレージへの保存に失敗しました。");
      }
    }
  };

  // この項目は上で getInitialLocale() に統合したので削除
  // SSRでの初期ロード時に状態を安定させるため

  // 翻訳関数
  const t = (key: string, params?: Record<string, string>): string => {
    if (!translations) return key;
    const keys = key.split(".");
    let value: Record<string, unknown> = translations;
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k] as Record<string, unknown>;
      } else {
        return key;
      }
    }
    if (typeof value === "string") {
      if (params) {
        return Object.entries(params).reduce((str, [key, val]) => {
          // 安全な文字列置換（正規表現エラーを避ける）
          const placeholder = `{${key}}`;
          return str.split(placeholder).join(String(val));
        }, value);
      }
      return value;
    }
    return key;
  };

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        translations: translations || {},
        t,
        isLoading,
        supportedLocales: availableLocales,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

// フックを使用する
export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
};
