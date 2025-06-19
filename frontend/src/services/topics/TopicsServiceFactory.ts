import { createTopicsDomainServices, TopicsDomainServices } from '@/domains/topics';
import {
  ApiTopicsRepository,
  ApiArticleRepository,
  ApiCategoryRepository,
} from '@/infrastructure/repositories/ApiTopicsRepository';
import { TopicsWorkflowService, TopicsWorkflowCallbacks } from './TopicsWorkflowService';

export class TopicsServiceFactory {
  private static domainServices: TopicsDomainServices | null = null;

  static createDomainServices(): TopicsDomainServices {
    if (!this.domainServices) {
      const topicsRepository = new ApiTopicsRepository();
      const articleRepository = new ApiArticleRepository();
      const categoryRepository = new ApiCategoryRepository();

      this.domainServices = createTopicsDomainServices(
        topicsRepository,
        articleRepository,
        categoryRepository
      );
    }

    return this.domainServices;
  }

  static createWorkflowService(
    callbacks: TopicsWorkflowCallbacks,
    initialState?: any
  ): TopicsWorkflowService {
    const domainServices = this.createDomainServices();
    
    return new TopicsWorkflowService(
      domainServices,
      callbacks,
      initialState
    );
  }

  // レポジトリの個別取得（テスト用など）
  static createTopicsRepository() {
    return new ApiTopicsRepository();
  }

  static createArticleRepository() {
    return new ApiArticleRepository();
  }

  static createCategoryRepository() {
    return new ApiCategoryRepository();
  }
}

// React Hook for easy integration
export function useTopicsServices() {
  return {
    domainServices: TopicsServiceFactory.createDomainServices(),
    createWorkflowService: (callbacks: TopicsWorkflowCallbacks, initialState?: any) =>
      TopicsServiceFactory.createWorkflowService(callbacks, initialState),
  };
}