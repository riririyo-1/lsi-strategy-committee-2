export interface ArticleEntity {
  readonly id: string;
  readonly title: string;
  readonly source: string;
  readonly publishedAt: Date;
  readonly summary: string;
  readonly labels: string[];
  readonly thumbnailUrl?: string;
  readonly articleUrl: string;
  readonly fullText?: string;
  readonly category?: string;
  readonly subCategory?: string;
  readonly viewCount?: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface TopicsArticleEntity {
  readonly id: string;
  readonly topicId: string;
  readonly articleId: string;
  readonly categoryId?: string;
  readonly displayOrder?: number;
  readonly createdAt: Date;
  readonly article: ArticleEntity;
  readonly category?: CategoryEntity;
}

export interface CategoryEntity {
  readonly id: string;
  readonly name: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface ArticleWithCategoryData {
  readonly article: ArticleEntity;
  readonly categoryId?: string;
  readonly categoryName?: string;
  readonly displayOrder?: number;
}

export class ArticleBusinessRules {
  static validateCategoryAssignment(articleId: string, categoryId: string): string[] {
    const errors: string[] = [];
    
    if (!articleId || articleId.trim().length === 0) {
      errors.push("記事IDは必須です");
    }
    
    if (!categoryId || categoryId.trim().length === 0) {
      errors.push("カテゴリIDは必須です");
    }
    
    return errors;
  }

  static validateArticleSelection(articles: ArticleEntity[]): string[] {
    const errors: string[] = [];
    
    // 記事を選択しなくてもTOPICSを作成できるようにするため、0件チェックを削除
    
    if (articles && articles.length > 50) {
      errors.push("選択できる記事は50件までです");
    }
    
    const duplicateIds = articles
      .map(a => a.id)
      .filter((id, index, array) => array.indexOf(id) !== index);
    
    if (duplicateIds.length > 0) {
      errors.push("重複した記事が選択されています");
    }
    
    return errors;
  }

  static groupArticlesByCategory(articles: TopicsArticleEntity[]): Map<string, TopicsArticleEntity[]> {
    const grouped = new Map<string, TopicsArticleEntity[]>();
    
    articles.forEach(topicsArticle => {
      const categoryKey = topicsArticle.categoryId || 'uncategorized';
      
      if (!grouped.has(categoryKey)) {
        grouped.set(categoryKey, []);
      }
      
      grouped.get(categoryKey)!.push(topicsArticle);
    });
    
    // カテゴリ内で日付順にソート
    grouped.forEach(categoryArticles => {
      categoryArticles.sort((a, b) => 
        new Date(b.article.publishedAt).getTime() - new Date(a.article.publishedAt).getTime()
      );
    });
    
    return grouped;
  }
}