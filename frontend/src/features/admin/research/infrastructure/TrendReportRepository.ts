import { researchApi } from "@/lib/apiClient";
import type { TrendReport } from "@/types/trendReport";
import { ITrendReportRepository } from "../ports/ITrendReportRepository";

export class TrendReportRepository implements ITrendReportRepository {
  async findAll(): Promise<TrendReport[]> {
    const response = await researchApi.getAll();
    return response.data.map((item: any) => ({
      id: item.id,
      title: item.title,
      summary: item.summary,
      publishDate: item.publishDate,
      content: item.content || undefined,
      videoUrl: item.videoUrl || undefined,
      posterUrl: item.posterUrl || undefined,
      pdfUrl: item.pdfUrl || undefined,
      speaker: item.speaker || undefined,
      department: item.department || undefined,
      agenda: item.agenda || [],
    }));
  }

  async findById(id: string): Promise<TrendReport | null> {
    try {
      const response = await researchApi.getById(id);
      const item = response.data;
      return {
        id: item.id,
        title: item.title,
        summary: item.summary,
        publishDate: item.publishDate,
        content: item.content || undefined,
        videoUrl: item.videoUrl || undefined,
        posterUrl: item.posterUrl || undefined,
        pdfUrl: item.pdfUrl || undefined,
        speaker: item.speaker || undefined,
        department: item.department || undefined,
        agenda: item.agenda || [],
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async create(data: Omit<TrendReport, "id">): Promise<TrendReport> {
    const response = await researchApi.create(data);
    const item = response.data;
    return {
      id: item.id,
      title: item.title,
      summary: item.summary,
      publishDate: item.publishDate,
      content: item.content || undefined,
      videoUrl: item.videoUrl || undefined,
      posterUrl: item.posterUrl || undefined,
      pdfUrl: item.pdfUrl || undefined,
      speaker: item.speaker || undefined,
      department: item.department || undefined,
      agenda: item.agenda || [],
    };
  }

  async update(
    id: string,
    data: Omit<TrendReport, "id">
  ): Promise<TrendReport> {
    const response = await researchApi.update(id, data);
    const item = response.data;
    return {
      id: item.id,
      title: item.title,
      summary: item.summary,
      publishDate: item.publishDate,
      content: item.content || undefined,
      videoUrl: item.videoUrl || undefined,
      posterUrl: item.posterUrl || undefined,
      pdfUrl: item.pdfUrl || undefined,
      speaker: item.speaker || undefined,
      department: item.department || undefined,
      agenda: item.agenda || [],
    };
  }

  async delete(id: string): Promise<void> {
    await researchApi.delete(id);
  }
}
