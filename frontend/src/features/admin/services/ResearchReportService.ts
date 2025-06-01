"use client";

import { TrendReport } from "@/types/trendReport";

// API URL
const API_BASE_URL = "/api/trend-reports";

// ResearchReportService クラス
export class ResearchReportService {
  // レポート一覧を取得
  static async getReports(): Promise<TrendReport[]> {
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("レポートデータの取得に失敗しました:", error);
      throw error;
    }
  }

  // レポートを1件取得
  static async getReportById(id: string): Promise<TrendReport | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`API error: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("レポートデータの取得に失敗しました:", error);
      throw error;
    }
  }

  // レポートを新規作成
  static async createReport(
    report: Omit<TrendReport, "id">
  ): Promise<TrendReport> {
    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(report),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error("レポート作成に失敗しました:", error);
      throw error;
    }
  }

  // レポートを更新
  static async updateReport(
    id: string,
    report: Omit<TrendReport, "id">
  ): Promise<TrendReport> {
    try {
      console.log(`更新API呼び出し: ${API_BASE_URL}/${id}`);
      console.log("更新データ:", JSON.stringify(report));

      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(report),
      });

      if (!response.ok) {
        console.error(`API更新エラー: ${response.status}`);
        const errorText = await response.text();
        console.error("レスポンス内容:", errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      return response.json();
    } catch (error) {
      console.error("レポート更新に失敗しました:", error);
      throw error;
    }
  }

  // レポートを削除
  static async deleteReport(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
    } catch (error) {
      console.error("レポート削除に失敗しました:", error);
      throw error;
    }
  }
}
