"use client";

import React from "react";
import { useI18n } from "@/features/i18n/hooks/useI18n";
import { useContactForm } from "../hooks/useContactForm";
import { FormField } from "./FormField";
import { SuccessMessage } from "./SuccessMessage";

export const ContactForm: React.FC = () => {
  const { t } = useI18n();
  const {
    formData,
    errors,
    isSubmitting,
    submitResult,
    handleChange,
    handleSubmit,
    clearResult,
  } = useContactForm();

  if (submitResult?.success) {
    return <SuccessMessage result={submitResult} onClose={clearResult} />;
  }

  return (
    <div className="max-w-3xl mx-auto">
      {submitResult && !submitResult.success && (
        <SuccessMessage result={submitResult} onClose={clearResult} />
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white/80 dark:bg-slate-800/90 p-6 rounded-lg shadow-md text-gray-900 dark:text-gray-100"
      >
        <h2 className="text-2xl text-gray-900 dark:text-white mb-6">
          {t("contact.title") || "お問い合わせ・アクセス権申請"}
        </h2>

        <FormField
          label={t("contact.name") || "お名前"}
          name="name"
          value={formData.name}
          onChange={handleChange}
          errors={errors.name}
          placeholder={t("contact.name") || "お名前"}
          required
        />

        <FormField
          label={t("contact.email") || "メールアドレス"}
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          errors={errors.email}
          placeholder="example@company.com"
          required
        />

        <FormField
          label={t("contact.company") || "ご所属（会社）"}
          name="company"
          value={formData.company}
          onChange={handleChange}
          errors={errors.company}
          placeholder={t("contact.company") || "ご所属（会社）"}
          required
        />

        <FormField
          label={t("contact.type") || "お問い合わせ種別"}
          name="type"
          as="select"
          value={formData.type}
          onChange={handleChange}
          errors={errors.type}
          required
        >
          <option value="inquiry">
            {t("contact.types.inquiry") || "一般のお問い合わせ"}
          </option>
          <option value="accessRequest">
            {t("contact.types.accessRequest") || "アクセス権申請"}
          </option>
          <option value="other">{t("contact.types.other") || "その他"}</option>
        </FormField>

        <FormField
          label={t("contact.content") || "内容・申請理由"}
          name="content"
          as="textarea"
          value={formData.content}
          onChange={handleChange}
          errors={errors.content}
          placeholder={t("contact.content") || "内容・申請理由"}
          required
        />

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-green-600 text-white py-3 px-8 rounded-md hover:bg-green-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-base w-full"
          >
            {isSubmitting
              ? t("contact.submitting") || "送信中..."
              : t("contact.submit") || "送信する"}
          </button>
        </div>
      </form>
    </div>
  );
};
