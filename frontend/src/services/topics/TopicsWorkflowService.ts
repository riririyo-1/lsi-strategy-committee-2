import {
  CreateTopicsUseCase,
  UpdateTopicsUseCase,
  SelectArticlesUseCase,
  AssignCategoryUseCase,
  GeneratePreviewUseCase,
  TopicsDomainServices,
} from '@/domains/topics';
import { Article } from '@/types/article.d';

export interface TopicsWorkflowState {
  // 基本情報
  title: string;
  publishDate: Date;
  summary: string;
  
  // 記事選択
  availableArticles: Article[];
  selectedArticles: Article[];
  searchQuery: string;
  filters: {
    category?: string;
    source?: string;
    startDate?: Date;
    endDate?: Date;
  };
  
  // カテゴリ管理
  articlesWithCategories: Array<Article & { mainCategory?: string }>;
  categories: Array<{ id: string; name: string }>;
  
  // UI状態
  activeTab: 'articles' | 'template' | 'preview';
  isLoading: boolean;
  isSaving: boolean;
  validationErrors: string[];
}

export interface TopicsWorkflowCallbacks {
  onStateChange: (state: TopicsWorkflowState) => void;
  onError: (error: string) => void;
  onSuccess: (message: string) => void;
}

export class TopicsWorkflowService {
  private state: TopicsWorkflowState;
  private callbacks: TopicsWorkflowCallbacks;
  private domainServices: TopicsDomainServices;

  constructor(
    domainServices: TopicsDomainServices,
    callbacks: TopicsWorkflowCallbacks,
    initialState?: Partial<TopicsWorkflowState>
  ) {
    this.domainServices = domainServices;
    this.callbacks = callbacks;
    
    const defaultCategories = [
      { id: 'political', name: '政治' },
      { id: 'economical', name: '経済' },
      { id: 'social', name: '社会' },
      { id: 'technological', name: '技術' },
    ];

    this.state = {
      title: '',
      publishDate: new Date(),
      summary: '',
      availableArticles: [],
      selectedArticles: [],
      searchQuery: '',
      filters: {},
      articlesWithCategories: [],
      categories: defaultCategories,
      activeTab: 'articles',
      isLoading: false,
      isSaving: false,
      validationErrors: [],
      ...initialState,
      categories: initialState?.categories || defaultCategories, // categoriesは初期値を保持
    };
  }

  // 状態管理
  private updateState(updates: Partial<TopicsWorkflowState>) {
    this.state = { ...this.state, ...updates };
    this.callbacks.onStateChange(this.state);
  }

  public getState(): TopicsWorkflowState {
    return { ...this.state };
  }

  // 基本情報の更新
  public updateBasicInfo(updates: {
    title?: string;
    publishDate?: Date;
    summary?: string;
  }) {
    this.updateState(updates);
    this.validateBasicInfo();
  }

  private validateBasicInfo() {
    const errors: string[] = [];
    
    if (!this.state.title.trim()) {
      errors.push('タイトルを入力してください');
    }
    
    if (!this.state.publishDate) {
      errors.push('公開日を選択してください');
    }
    
    this.updateState({ validationErrors: errors });
  }

  // 記事検索・選択
  public async searchArticles(query: string, filters: typeof this.state.filters = {}) {
    try {
      this.updateState({ isLoading: true, searchQuery: query, filters });
      
      const response = await this.domainServices.selectArticlesUseCase.execute({
        searchQuery: query,
        category: filters.category,
        source: filters.source,
        startDate: filters.startDate,
        endDate: filters.endDate,
        selectedIds: this.state.selectedArticles.map(a => a.id),
      });

      // 選択済み記事のarticlesWithCategoriesも更新
      const updatedArticlesWithCategories = response.selectedArticles.map(article => {
        const existing = this.state.articlesWithCategories.find(a => a.id === article.id);
        return existing || { ...article, mainCategory: undefined };
      });

      this.updateState({
        availableArticles: response.availableArticles,
        selectedArticles: response.selectedArticles,
        articlesWithCategories: updatedArticlesWithCategories,
        validationErrors: response.validationErrors,
        isLoading: false,
      });
    } catch (error) {
      this.updateState({ isLoading: false });
      this.callbacks.onError(error instanceof Error ? error.message : '記事の検索に失敗しました');
    }
  }

  public async selectArticle(article: Article) {
    try {
      const updatedIds = await this.domainServices.selectArticlesUseCase.addArticle(
        this.state.selectedArticles.map(a => a.id),
        article.id
      );

      const selectedArticles = [...this.state.selectedArticles, article];
      const articlesWithCategories = [
        ...this.state.articlesWithCategories,
        { ...article, mainCategory: undefined }
      ];

      this.updateState({ selectedArticles, articlesWithCategories });
    } catch (error) {
      this.callbacks.onError(error instanceof Error ? error.message : '記事の選択に失敗しました');
    }
  }

  public async removeArticle(articleId: string) {
    try {
      const updatedIds = await this.domainServices.selectArticlesUseCase.removeArticle(
        this.state.selectedArticles.map(a => a.id),
        articleId
      );

      const selectedArticles = this.state.selectedArticles.filter(a => a.id !== articleId);
      const articlesWithCategories = this.state.articlesWithCategories.filter(a => a.id !== articleId);

      this.updateState({ selectedArticles, articlesWithCategories });
    } catch (error) {
      this.callbacks.onError(error instanceof Error ? error.message : '記事の削除に失敗しました');
    }
  }

  // カテゴリ管理
  public async assignCategory(articleId: string, categoryId: string, topicsId?: string) {
    if (!topicsId) {
      // ローカル状態のみ更新（保存前）
      const updatedArticles = this.state.articlesWithCategories.map(article =>
        article.id === articleId
          ? { ...article, mainCategory: categoryId || undefined }
          : article
      );
      this.updateState({ articlesWithCategories: updatedArticles });
      return;
    }

    try {
      await this.domainServices.assignCategoryUseCase.assignCategory({
        topicsId,
        articleId,
        categoryId,
      });

      // 成功時にローカル状態も更新
      const updatedArticles = this.state.articlesWithCategories.map(article =>
        article.id === articleId
          ? { ...article, mainCategory: categoryId || undefined }
          : article
      );
      this.updateState({ articlesWithCategories: updatedArticles });
    } catch (error) {
      this.callbacks.onError(error instanceof Error ? error.message : 'カテゴリの割り当てに失敗しました');
    }
  }

  public async autoCategorizeArticles(topicsId: string, articleIds?: string[]) {
    if (!topicsId) {
      this.callbacks.onError('TOPICSが保存されていません');
      return;
    }

    try {
      this.updateState({ isLoading: true });

      const targetIds = articleIds || this.state.selectedArticles.map(a => a.id);
      const response = await this.domainServices.assignCategoryUseCase.autoCategorize({
        topicsId,
        articleIds: targetIds,
      });

      // 結果を状態に反映
      const updatedArticles = this.state.articlesWithCategories.map(article => {
        const categoryId = response.categorizedArticles.get(article.id);
        return categoryId ? { ...article, mainCategory: categoryId } : article;
      });

      this.updateState({ articlesWithCategories: updatedArticles, isLoading: false });
      this.callbacks.onSuccess('自動カテゴリ分類が完了しました');
    } catch (error) {
      this.updateState({ isLoading: false });
      this.callbacks.onError(error instanceof Error ? error.message : '自動カテゴリ分類に失敗しました');
    }
  }

  // サマリー生成
  public async generateSummary(topicsId: string) {
    if (!topicsId) {
      this.callbacks.onError('TOPICSが保存されていません');
      return;
    }

    try {
      this.updateState({ isLoading: true });

      const response = await this.domainServices.generatePreviewUseCase.generatePreview({
        topicsId,
        summaryStyle: 'overview',
      });

      this.updateState({ 
        summary: response.previewData.summary,
        isLoading: false 
      });
      this.callbacks.onSuccess('サマリーを生成しました');
    } catch (error) {
      this.updateState({ isLoading: false });
      this.callbacks.onError(error instanceof Error ? error.message : 'サマリーの生成に失敗しました');
    }
  }

  // TOPICS保存
  public async saveTopic(mode: 'create' | 'edit', topicsId?: string) {
    try {
      this.updateState({ isSaving: true });
      this.validateBasicInfo();

      if (this.state.validationErrors.length > 0) {
        this.updateState({ isSaving: false });
        return;
      }

      const categories: { [articleId: string]: string } = {};
      this.state.articlesWithCategories.forEach(article => {
        if (article.mainCategory) {
          categories[article.id] = article.mainCategory;
        }
      });

      if (mode === 'create') {
        const response = await this.domainServices.createTopicsUseCase.execute({
          title: this.state.title,
          publishDate: this.state.publishDate,
          summary: this.state.summary,
          articleIds: this.state.selectedArticles.map(a => a.id),
          categories,
        });

        this.updateState({ isSaving: false });
        this.callbacks.onSuccess('TOPICSを作成しました');
        return response.topics.id;
      } else if (mode === 'edit' && topicsId) {
        await this.domainServices.updateTopicsUseCase.execute({
          id: topicsId,
          title: this.state.title,
          publishDate: this.state.publishDate,
          summary: this.state.summary,
          articleIds: this.state.selectedArticles.map(a => a.id),
          categories,
        });

        this.updateState({ isSaving: false });
        this.callbacks.onSuccess('TOPICSを更新しました');
        return topicsId;
      }
    } catch (error) {
      this.updateState({ isSaving: false });
      this.callbacks.onError(error instanceof Error ? error.message : 'TOPICSの保存に失敗しました');
    }
  }

  // エクスポート
  public async exportTopic(topicsId: string, format: 'html' | 'pdf' | 'json') {
    try {
      const response = await this.domainServices.generatePreviewUseCase.exportTopics({
        topicsId,
        format,
      });

      // ファイルダウンロード処理
      const blob = new Blob([response.content], { type: response.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.callbacks.onSuccess(`${format.toUpperCase()}ファイルをダウンロードしました`);
    } catch (error) {
      this.callbacks.onError(error instanceof Error ? error.message : 'エクスポートに失敗しました');
    }
  }

  // タブ切り替え
  public switchTab(tab: typeof this.state.activeTab) {
    this.updateState({ activeTab: tab });
  }

  // 初期化（編集モード用）
  public async loadTopics(topicsId: string) {
    try {
      this.updateState({ isLoading: true });

      const topicsData = await this.domainServices.generatePreviewUseCase.topicsRepository.findByIdWithArticles(topicsId);
      
      if (!topicsData) {
        throw new Error('TOPICSが見つかりません');
      }

      const { topics, articles } = topicsData;
      
      // 記事リストを変換
      const articlesWithCategories: Array<Article & { mainCategory?: string }> = [];
      const selectedArticles: Article[] = [];
      
      articles.forEach(topicsArticle => {
        const articleWithCategory = {
          ...topicsArticle.article,
          mainCategory: topicsArticle.categoryId || undefined,
        };
        articlesWithCategories.push(articleWithCategory);
        selectedArticles.push(topicsArticle.article);
      });

      this.updateState({
        title: topics.title,
        publishDate: topics.publishDate,
        summary: topics.summary || '',
        selectedArticles,
        articlesWithCategories,
        isLoading: false,
      });
    } catch (error) {
      this.updateState({ isLoading: false });
      this.callbacks.onError(error instanceof Error ? error.message : 'TOPICSの読み込みに失敗しました');
    }
  }
}