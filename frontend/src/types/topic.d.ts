export interface Topic {
  id: string;
  title: string;
  publishDate: string;
  summary: string;
  articleCount: number;
  categories: TopicCategory[];
  createdAt: string;
  updatedAt: string;
}

export interface TopicCategory {
  id: string;
  name: string;
  displayOrder: number;
  articles: TopicArticleStub[];
}

export interface TopicArticleStub {
  id: string;
}
