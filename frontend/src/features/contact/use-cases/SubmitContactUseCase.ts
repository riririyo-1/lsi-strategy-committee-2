import { ContactFormData, ContactSubmitResponse } from "@/types/contact";
import { IContactRepository } from "../ports/IContactRepository";

export class SubmitContactUseCase {
  constructor(private readonly contactRepository: IContactRepository) {}

  async execute(data: ContactFormData): Promise<ContactSubmitResponse> {
    try {
      // 実際のビジネスロジック（検証など）をここに記述
      // 例: データの前処理や追加検証

      // リポジトリを通じてデータを送信
      const response = await this.contactRepository.submitContact(data);
      return response;
    } catch (error) {
      console.error("問い合わせ送信中にエラーが発生しました:", error);
      return {
        success: false,
        message: "送信中にエラーが発生しました。後でもう一度お試しください。",
      };
    }
  }
}
