import { ContactFormData, ContactSubmitResponse } from "@/types/contact";

// 問い合わせ送信のための抽象リポジトリインターフェース
export interface IContactRepository {
  submitContact(data: ContactFormData): Promise<ContactSubmitResponse>;
}
