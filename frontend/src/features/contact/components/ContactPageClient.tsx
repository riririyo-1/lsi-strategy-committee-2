"use client";

import React from "react";
import { useI18n } from "@/features/i18n/hooks/useI18n";
import { ContactForm } from "./ContactForm";

export const ContactPageClient: React.FC = () => {
  const { t } = useI18n();

  return (
    <>
      <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center text-gray-900 dark:text-white">
        {t("contact.heading") || "お問い合わせ・アクセス権申請"}
      </h1>
      <p className="text-lg text-gray-700 dark:text-gray-300 mb-10 text-center">
        {t("contact.description") ||
          "ご質問や資料請求、アクセス権申請などございましたら、以下のフォームからお問い合わせください。"}
      </p>
      <ContactForm />
    </>
  );
};
