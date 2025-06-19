export interface TopicsEntity {
  readonly id: string;
  readonly title: string;
  readonly publishDate: Date;
  readonly summary?: string;
  readonly content?: string;
  readonly viewCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface TopicsCreateData {
  title: string;
  publishDate: Date;
  summary?: string;
  content?: string;
}

export interface TopicsUpdateData {
  title?: string;
  publishDate?: Date;
  summary?: string;
  content?: string;
}

export class TopicsBusinessRules {
  static validateTitle(title: string): string[] {
    const errors: string[] = [];
    
    if (!title || title.trim().length === 0) {
      errors.push("タイトルは必須です");
    }
    
    if (title.trim().length > 200) {
      errors.push("タイトルは200文字以内で入力してください");
    }
    
    return errors;
  }

  static validatePublishDate(publishDate: Date): string[] {
    const errors: string[] = [];
    
    if (!publishDate) {
      errors.push("公開日は必須です");
    }
    
    if (publishDate && isNaN(publishDate.getTime())) {
      errors.push("有効な公開日を入力してください");
    }
    
    return errors;
  }

  static validateCreateData(data: TopicsCreateData): string[] {
    const errors: string[] = [];
    
    errors.push(...this.validateTitle(data.title));
    errors.push(...this.validatePublishDate(data.publishDate));
    
    if (data.summary && data.summary.length > 5000) {
      errors.push("サマリーは5000文字以内で入力してください");
    }
    
    return errors;
  }

  static validateUpdateData(data: TopicsUpdateData): string[] {
    const errors: string[] = [];
    
    if (data.title !== undefined) {
      errors.push(...this.validateTitle(data.title));
    }
    
    if (data.publishDate !== undefined) {
      errors.push(...this.validatePublishDate(data.publishDate));
    }
    
    if (data.summary && data.summary.length > 5000) {
      errors.push("サマリーは5000文字以内で入力してください");
    }
    
    return errors;
  }
}