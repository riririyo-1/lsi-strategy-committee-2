import * as z from "zod";
import { ContactFormData } from "@/types/contact";

// Zodを使用したバリデーションスキーマ
export const getContactFormSchema = (
  t: (key: string, params?: Record<string, string>) => string
) =>
  z.object({
    name: z
      .string()
      .min(1, t("contact.validation.required", { field: t("contact.name") })),
    email: z.string().email(t("contact.validation.email")),
    company: z
      .string()
      .min(
        1,
        t("contact.validation.required", { field: t("contact.company") })
      ),
    type: z.enum(["inquiry", "accessRequest", "other"], {
      required_error: t("contact.validation.required", {
        field: t("contact.type"),
      }),
    }),
    content: z
      .string()
      .min(
        10,
        t("contact.validation.minLength", {
          field: t("contact.content"),
          min: "10",
        })
      ),
  });

// デフォルトスキーマ（SSR用）
export const contactFormSchema = z.object({
  name: z.string().min(1, "名前は必須です"),
  email: z.string().email("有効なメールアドレスを入力してください"),
  company: z.string().min(1, "会社名は必須です"),
  type: z.enum(["inquiry", "accessRequest", "other"], {
    required_error: "問い合わせ種別を選択してください",
  }),
  content: z.string().min(10, "内容は10文字以上入力してください"),
});

// 型の安全性を確保
export type ContactFormSchema = z.infer<typeof contactFormSchema>;

// バリデーション関数
export const validateContactForm = (
  data: Partial<ContactFormData>,
  t?: (key: string, params?: Record<string, string>) => string
) => {
  try {
    // 翻訳関数が渡された場合は翻訳されたスキーマを使用
    const schema = t ? getContactFormSchema(t) : contactFormSchema;
    const result = schema.safeParse(data);

    if (!result.success) {
      const errors: Record<string, string[]> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        if (!errors[field]) {
          errors[field] = [];
        }
        errors[field].push(err.message);
      });
      return { valid: false, errors };
    }
    return { valid: true };
  } catch (error) {
    console.error("バリデーションエラー:", error);
    const errorMessage = t
      ? t("contact.error.message")
      : "フォームの検証中にエラーが発生しました";

    return {
      valid: false,
      errors: { form: [errorMessage] },
    };
  }
};
