"use client";

import { useState, useRef, useEffect } from "react";
import { useI18n } from "@/features/i18n/hooks/useI18n";
import { Locale } from "@/types/i18n";

const LanguageSwitcher = () => {
  const { locale, setLocale, t, supportedLocales, translations } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 言語の表示名を取得 - 翻訳ファイルに依存しない方法
  const getLanguageDisplay = (localeCode: Locale): string => {
    // 各言語のネイティブ表記（翻訳に依存しない）
    const nativeNames: Record<Locale, string> = {
      ja: "日本語",
      en: "English",
    };

    // 固定の名前を返す（翻訳ファイルに依存しない）
    return nativeNames[localeCode] || localeCode;
  };

  // 外部クリックでドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 言語切替は常に有効（翻訳データの有無に関わらず）
  // 高速切り替えループ防止のため、常にUIを有効にする
  const isTranslationReady = true;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => isTranslationReady && setIsOpen(!isOpen)}
        className={`flex items-center gap-1 px-3 py-2 rounded-md transition-colors
          ${
            isTranslationReady
              ? "text-navbartext hover:text-link dark:hover:text-linkhover"
              : "text-gray-400 cursor-not-allowed"
          }`}
        disabled={!isTranslationReady}
      >
        <span>{getLanguageDisplay(locale)}</span>
        <svg
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && isTranslationReady && (
        <div className="absolute right-0 mt-1 py-2 w-40 bg-navbar text-navbartext dark:bg-gray-800 dark:text-gray-100 rounded-md shadow-lg z-20">
          {supportedLocales.map((localeOption) => (
            <button
              key={localeOption}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-200 dark:hover:bg-blue-600 transition-colors rounded-md ${
                locale === localeOption
                  ? "bg-blue-100 dark:bg-blue-700 text-link dark:text-white"
                  : ""
              }`}
              onClick={() => {
                if (isTranslationReady) {
                  setLocale(localeOption);
                  setIsOpen(false);
                }
              }}
              disabled={!isTranslationReady}
            >
              {getLanguageDisplay(localeOption)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
