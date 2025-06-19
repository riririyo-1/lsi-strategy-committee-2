// Entities
export * from './entities/TopicsEntity';
export * from './entities/ArticleEntity';

// Repositories (interfaces)
export * from './repositories/TopicsRepository';

// Use Cases
export * from './usecases/CreateTopicsUseCase';
export * from './usecases/UpdateTopicsUseCase';
export * from './usecases/SelectArticlesUseCase';
export * from './usecases/AssignCategoryUseCase';
export * from './usecases/GeneratePreviewUseCase';

// Domain Service Factory
export interface TopicsDomainServices {
  createTopicsUseCase: import('./usecases/CreateTopicsUseCase').CreateTopicsUseCase;
  updateTopicsUseCase: import('./usecases/UpdateTopicsUseCase').UpdateTopicsUseCase;
  selectArticlesUseCase: import('./usecases/SelectArticlesUseCase').SelectArticlesUseCase;
  assignCategoryUseCase: import('./usecases/AssignCategoryUseCase').AssignCategoryUseCase;
  generatePreviewUseCase: import('./usecases/GeneratePreviewUseCase').GeneratePreviewUseCase;
}

export function createTopicsDomainServices(
  topicsRepository: import('./repositories/TopicsRepository').TopicsRepository,
  articleRepository: import('./repositories/TopicsRepository').ArticleRepository,
  categoryRepository: import('./repositories/TopicsRepository').CategoryRepository
): TopicsDomainServices {
  const CreateTopicsUseCase = require('./usecases/CreateTopicsUseCase').CreateTopicsUseCase;
  const UpdateTopicsUseCase = require('./usecases/UpdateTopicsUseCase').UpdateTopicsUseCase;
  const SelectArticlesUseCase = require('./usecases/SelectArticlesUseCase').SelectArticlesUseCase;
  const AssignCategoryUseCase = require('./usecases/AssignCategoryUseCase').AssignCategoryUseCase;
  const GeneratePreviewUseCase = require('./usecases/GeneratePreviewUseCase').GeneratePreviewUseCase;

  return {
    createTopicsUseCase: new CreateTopicsUseCase(topicsRepository),
    updateTopicsUseCase: new UpdateTopicsUseCase(topicsRepository),
    selectArticlesUseCase: new SelectArticlesUseCase(articleRepository),
    assignCategoryUseCase: new AssignCategoryUseCase(topicsRepository, categoryRepository),
    generatePreviewUseCase: new GeneratePreviewUseCase(topicsRepository),
  };
}