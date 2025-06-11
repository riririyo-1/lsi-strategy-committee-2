"use client";

import { useI18n } from "@/features/i18n/hooks/useI18n";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ 
  message, 
  size = "md", 
  className = "" 
}: LoadingSpinnerProps) {
  const { t } = useI18n();

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  };

  const displayMessage = message || t("common.loading", { defaultValue: "読み込み中..." });

  return (
    <div className={`text-center py-8 ${className}`}>
      <div className={`inline-block animate-spin rounded-full border-t-2 border-b-2 border-blue-500 dark:border-blue-400 ${sizeClasses[size]}`}></div>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        {displayMessage}
      </p>
    </div>
  );
}