"use client";

import { ContactSubmitResponse } from "@/types/contact";
import { useI18n } from "@/features/i18n/hooks/useI18n";
import { Alert } from "@/components/ui/Alert";

interface SuccessMessageProps {
  result: ContactSubmitResponse;
  onClose: () => void;
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({
  result,
  onClose,
}) => {
  const { t } = useI18n();
  
  const title = result.success
    ? t("contact.success.title") || "送信完了"
    : t("contact.error.title") || "エラー";

  const actions = result.success ? (
    <button
      onClick={onClose}
      className="bg-white text-green-700 px-4 py-2 rounded hover:bg-gray-100 transition-colors"
    >
      {t("contact.success.newInquiry") || "新しい問い合わせを作成"}
    </button>
  ) : undefined;

  return (
    <Alert
      variant={result.success ? "success" : "error"}
      title={title}
      message={result.message}
      errors={result.errors}
      onClose={onClose}
      actions={actions}
    />
  );
};
