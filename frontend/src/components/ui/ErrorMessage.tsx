"use client";

import { useI18n } from "@/features/i18n/hooks/useI18n";

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({ 
  message, 
  onRetry, 
  className = "" 
}: ErrorMessageProps) {
  const { t } = useI18n();

  const displayMessage = message || t("common.error", { defaultValue: "エラーが発生しました" });

  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="text-red-400 dark:text-red-300 mb-4">
        <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p className="text-lg font-medium">{displayMessage}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {t("common.retry", { defaultValue: "再試行" })}
        </button>
      )}
    </div>
  );
}