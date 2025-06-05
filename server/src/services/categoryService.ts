import prisma from "../adapters/prismaAdapter";
import { Category } from "../entities/category";
import { CreateCategoryDto, UpdateCategoryDto } from "../types/category";

export class CategoryService {
  // 全カテゴリ取得
  async findAll(): Promise<Category[]> {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    });
    
    return categories.map(this.toDomainEntity);
  }

  // ID指定でカテゴリ取得
  async findById(id: string): Promise<Category | null> {
    const category = await prisma.category.findUnique({
      where: { id },
    });
    
    return category ? this.toDomainEntity(category) : null;
  }

  // カテゴリ作成
  async create(dto: CreateCategoryDto): Promise<Category> {
    const category = await prisma.category.create({
      data: {
        name: dto.name,
      },
    });
    
    return this.toDomainEntity(category);
  }

  // カテゴリ更新
  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await prisma.category.update({
      where: { id },
      data: {
        name: dto.name,
      },
    });
    
    return this.toDomainEntity(category);
  }

  // カテゴリ削除
  async delete(id: string): Promise<void> {
    await prisma.category.delete({
      where: { id },
    });
  }

  // Prismaモデルからドメインエンティティへのマッピング
  private toDomainEntity(prismaCategory: any): Category {
    return new Category(
      prismaCategory.id,
      prismaCategory.name,
      prismaCategory.createdAt,
      prismaCategory.updatedAt
    );
  }
}

// シングルトンインスタンスをエクスポート
export const categoryService = new CategoryService();