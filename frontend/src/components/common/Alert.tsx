"use client";

import React from "react";

export type AlertVariant = "success" | "error" | "warning" | "info";

interface AlertProps {
  variant: AlertVariant;
  title?: string;
  message: string;
  errors?: Record<string, string[]>;
  onClose?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

const getVariantClasses = (variant: AlertVariant): string => {
  const variants = {
    success: "bg-green-700",
    error: "bg-red-700",
    warning: "bg-yellow-600",
    info: "bg-blue-600"
  };
  return variants[variant];
};

const getDefaultTitle = (variant: AlertVariant): string => {
  const titles = {
    success: "送信完了",
    error: "エラー",
    warning: "警告",
    info: "お知らせ"
  };
  return titles[variant];
};

export const Alert: React.FC<AlertProps> = ({
  variant,
  title,
  message,
  errors,
  onClose,
  actions,
  className = ""
}) => {
  const variantClasses = getVariantClasses(variant);
  const displayTitle = title || getDefaultTitle(variant);

  return (
    <div className={`rounded-md p-6 mb-6 ${variantClasses} ${className}`}>
      <div className="flex justify-between items-start">
        <div className="flex-grow">
          <h3 className="text-white text-lg font-semibold mb-2">
            {displayTitle}
          </h3>
          <p className="text-white">{message}</p>
          {errors && (
            <ul className="list-disc list-inside mt-2">
              {Object.entries(errors).map(([field, fieldErrors]) =>
                fieldErrors.map((error, index) => (
                  <li key={`${field}-${index}`} className="text-white">
                    {error}
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 text-white hover:text-gray-200"
            aria-label="閉じる"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
      {actions && (
        <div className="mt-4">
          {actions}
        </div>
      )}
    </div>
  );
};