// 問い合わせ内容の種類
export type ContactType = "inquiry" | "accessRequest" | "other";

// 問い合わせフォームのデータ構造
export interface ContactFormData {
  name: string;
  email: string;
  company: string;
  type: ContactType;
  content: string;
}

// サーバーレスポンス
export interface ContactSubmitResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}
