"use client";

import { useState } from "react";
import { ContactFormData, ContactSubmitResponse } from "@/types/contact";
import { SubmitContactUseCase } from "../use-cases/SubmitContactUseCase";
import { ApiContactRepository } from "../infrastructure/ApiContactRepository";
import { validateContactForm } from "../validations/contactFormSchema";
import { useI18n } from "@/features/i18n/hooks/useI18n";

export function useContactForm() {
  const { t } = useI18n();

  // フォームの初期状態
  const initialState: ContactFormData = {
    name: "",
    email: "",
    company: "",
    type: "inquiry",
    content: "",
  };

  // 状態管理
  const [formData, setFormData] = useState<ContactFormData>(initialState);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] =
    useState<ContactSubmitResponse | null>(null);

  // フォームフィールドの変更ハンドラ
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // 入力時にそのフィールドのエラーをクリア
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // フォーム送信ハンドラ
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // バリデーション - 翻訳関数を渡す
    const validation = validateContactForm(formData, t);
    if (!validation.valid) {
      setErrors(validation.errors || {});
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // UseCase経由でデータ送信
      const repository = new ApiContactRepository();
      const useCase = new SubmitContactUseCase(repository);
      const result = await useCase.execute(formData);

      setSubmitResult(result);

      // 成功した場合はフォームをリセット
      if (result.success) {
        setFormData(initialState);
      }
    } catch (error) {
      console.error("送信中にエラーが発生しました:", error);
      setSubmitResult({
        success: false,
        message:
          t("contact.error.message") ||
          "予期せぬエラーが発生しました。後でもう一度お試しください。",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 送信結果をクリア
  const clearResult = () => {
    setSubmitResult(null);
  };

  return {
    formData,
    errors,
    isSubmitting,
    submitResult,
    handleChange,
    handleSubmit,
    clearResult,
  };
}
