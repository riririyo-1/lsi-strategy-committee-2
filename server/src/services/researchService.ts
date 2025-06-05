import { Prisma } from "@prisma/client";
import prisma from "../adapters/prismaAdapter";
import { Research } from "../entities/research";
import { CreateResearchDto, UpdateResearchDto } from "../types/research";

export class ResearchService {
  // 全Research取得
  async findAll(): Promise<Research[]> {
    const researches = await prisma.research.findMany({
      orderBy: {
        publishDate: "desc",
      },
    });
    
    return researches.map(this.toDomainEntity);
  }

  // ID指定でResearch取得
  async findById(id: string): Promise<Research | null> {
    const research = await prisma.research.findUnique({
      where: { id },
    });
    
    return research ? this.toDomainEntity(research) : null;
  }

  // Research作成
  async create(dto: CreateResearchDto): Promise<Research> {
    const research = await prisma.research.create({
      data: {
        title: dto.title,
        summary: dto.summary,
        publishDate: new Date(dto.publishDate),
        videoUrl: dto.videoUrl,
        posterUrl: dto.posterUrl,
        pdfUrl: dto.pdfUrl,
        speaker: dto.speaker,
        department: dto.department,
        agenda: dto.agenda || [],
        content: dto.content,
      },
    });
    
    return this.toDomainEntity(research);
  }

  // Research更新
  async update(id: string, dto: UpdateResearchDto): Promise<Research> {
    const updateData: any = {};
    
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.summary !== undefined) updateData.summary = dto.summary;
    if (dto.publishDate !== undefined) updateData.publishDate = new Date(dto.publishDate);
    if (dto.videoUrl !== undefined) updateData.videoUrl = dto.videoUrl;
    if (dto.posterUrl !== undefined) updateData.posterUrl = dto.posterUrl;
    if (dto.pdfUrl !== undefined) updateData.pdfUrl = dto.pdfUrl;
    if (dto.speaker !== undefined) updateData.speaker = dto.speaker;
    if (dto.department !== undefined) updateData.department = dto.department;
    if (dto.agenda !== undefined) updateData.agenda = dto.agenda;
    if (dto.content !== undefined) updateData.content = dto.content;

    const research = await prisma.research.update({
      where: { id },
      data: updateData,
    });
    
    return this.toDomainEntity(research);
  }

  // Research削除
  async delete(id: string): Promise<void> {
    await prisma.research.delete({
      where: { id },
    });
  }

  // Prismaモデルからドメインエンティティへのマッピング
  private toDomainEntity(prismaResearch: any): Research {
    return new Research(
      prismaResearch.id,
      prismaResearch.title,
      prismaResearch.summary,
      prismaResearch.content,
      prismaResearch.publishDate,
      prismaResearch.videoUrl,
      prismaResearch.posterUrl,
      prismaResearch.pdfUrl,
      prismaResearch.speaker,
      prismaResearch.department,
      prismaResearch.agenda,
      prismaResearch.viewCount,
      prismaResearch.createdAt,
      prismaResearch.updatedAt
    );
  }
}

// シングルトンインスタンスをエクスポート
export const researchService = new ResearchService();