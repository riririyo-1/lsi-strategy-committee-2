"use client";

import { ContactSubmitResponse } from "@/types/contact";
import { useI18n } from "@/features/i18n/hooks/useI18n";

interface SuccessMessageProps {
  result: ContactSubmitResponse;
  onClose: () => void;
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({
  result,
  onClose,
}) => {
  const { t } = useI18n();
  return (
    <div
      className={`rounded-md p-6 mb-6 ${
        result.success ? "bg-green-700" : "bg-red-700"
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-grow">
          <h3 className="text-white text-lg font-semibold mb-2">
            {result.success
              ? t("contact.success.title") || "送信完了"
              : t("contact.error.title") || "エラー"}
          </h3>
          <p className="text-white">{result.message}</p>
          {result.errors && (
            <ul className="list-disc list-inside mt-2">
              {Object.entries(result.errors).map(([field, errors]) =>
                errors.map((error, index) => (
                  <li key={`${field}-${index}`} className="text-white">
                    {error}
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-white hover:text-gray-200"
          aria-label={t("close") || "閉じる"}
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
      </div>
      {result.success && (
        <button
          onClick={onClose}
          className="mt-4 bg-white text-green-700 px-4 py-2 rounded hover:bg-gray-100 transition-colors"
        >
          {t("contact.success.newInquiry") || "新しい問い合わせを作成"}
        </button>
      )}
    </div>
  );
};
