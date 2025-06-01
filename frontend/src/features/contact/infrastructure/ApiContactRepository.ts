import { ContactFormData, ContactSubmitResponse } from "@/types/contact";
import { IContactRepository } from "../ports/IContactRepository";

export class ApiContactRepository implements IContactRepository {
  async submitContact(data: ContactFormData): Promise<ContactSubmitResponse> {
    try {
      // 実際のAPIエンドポイントに送信するコード
      // 現段階ではモックレスポンスを返す
      console.log("送信されたデータ:", data);

      // 模擬的な成功レスポンス
      return {
        success: true,
        message: "お問い合わせを受け付けました。折り返しご連絡いたします。",
      };

      // 実際のAPIリクエスト実装例:
      // const response = await fetch("/api/contact", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(data),
      // });
      // return await response.json();
    } catch (error) {
      console.error("APIリクエスト中にエラーが発生しました:", error);
      return {
        success: false,
        message: "送信に失敗しました。ネットワーク接続を確認してください。",
      };
    }
  }
}
