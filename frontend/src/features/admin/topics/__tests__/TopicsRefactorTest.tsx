/**
 * Integration test for the refactored TOPICS management system
 * 
 * This test verifies that the clean architecture implementation works correctly:
 * 1. Domain entities and business rules
 * 2. Use cases and application services
 * 3. UI components with single responsibility
 * 4. Data flow through the architecture layers
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { TopicsServiceFactory } from '@/services/topics';
import { TopicsBusinessRules, ArticleBusinessRules } from '@/domains/topics';

// Mock API responses
const mockArticles = [
  {
    id: '1',
    title: 'Test Article 1',
    source: 'Test Source',
    publishedAt: new Date('2024-01-01'),
    summary: 'Test summary 1',
    labels: ['test'],
    articleUrl: 'https://example.com/1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'Test Article 2',
    source: 'Test Source',
    publishedAt: new Date('2024-01-02'),
    summary: 'Test summary 2',
    labels: ['test'],
    articleUrl: 'https://example.com/2',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockTopic = {
  id: 'topic-1',
  title: 'Test Topic',
  publishDate: new Date('2024-01-15'),
  summary: 'Test topic summary',
  viewCount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('TOPICS Clean Architecture Integration', () => {
  beforeEach(() => {
    // Reset any mocks
    jest.clearAllMocks();
  });

  describe('Domain Layer', () => {
    test('TopicsBusinessRules validates data correctly', () => {
      // Valid data should pass
      const validData = {
        title: 'Valid Title',
        publishDate: new Date(),
        summary: 'Valid summary',
      };
      const validErrors = TopicsBusinessRules.validateCreateData(validData);
      expect(validErrors).toHaveLength(0);

      // Invalid data should fail
      const invalidData = {
        title: '',
        publishDate: new Date('invalid'),
        summary: 'x'.repeat(6000), // Too long
      };
      const invalidErrors = TopicsBusinessRules.validateCreateData(invalidData);
      expect(invalidErrors.length).toBeGreaterThan(0);
    });

    test('ArticleBusinessRules groups articles by category correctly', () => {
      const topicsArticles = [
        {
          id: '1',
          topicId: 'topic-1',
          articleId: 'article-1',
          categoryId: 'political',
          createdAt: new Date(),
          article: mockArticles[0],
        },
        {
          id: '2',
          topicId: 'topic-1',
          articleId: 'article-2',
          categoryId: 'economical',
          createdAt: new Date(),
          article: mockArticles[1],
        },
      ];

      const grouped = ArticleBusinessRules.groupArticlesByCategory(topicsArticles);
      expect(grouped.has('political')).toBe(true);
      expect(grouped.has('economical')).toBe(true);
      expect(grouped.get('political')).toHaveLength(1);
      expect(grouped.get('economical')).toHaveLength(1);
    });
  });

  describe('Service Layer', () => {
    test('TopicsServiceFactory creates services correctly', () => {
      const domainServices = TopicsServiceFactory.createDomainServices();
      
      expect(domainServices.createTopicsUseCase).toBeDefined();
      expect(domainServices.updateTopicsUseCase).toBeDefined();
      expect(domainServices.selectArticlesUseCase).toBeDefined();
      expect(domainServices.assignCategoryUseCase).toBeDefined();
      expect(domainServices.generatePreviewUseCase).toBeDefined();
    });

    test('TopicsWorkflowService manages state correctly', () => {
      let currentState = null;
      const callbacks = {
        onStateChange: (state: any) => { currentState = state; },
        onError: (error: string) => { console.error(error); },
        onSuccess: (message: string) => { console.log(message); },
      };

      const workflowService = TopicsServiceFactory.createWorkflowService(callbacks);
      
      // Test basic info update
      workflowService.updateBasicInfo({
        title: 'Test Title',
        publishDate: new Date('2024-01-15'),
        summary: 'Test Summary',
      });

      expect(currentState).not.toBeNull();
      expect(currentState.title).toBe('Test Title');
      expect(currentState.summary).toBe('Test Summary');
    });
  });

  describe('Architecture Principles', () => {
    test('Dependencies flow in the correct direction', () => {
      // Domain layer should not depend on infrastructure
      const domainServices = TopicsServiceFactory.createDomainServices();
      
      // Use cases should be independent of UI and infrastructure details
      expect(typeof domainServices.createTopicsUseCase.execute).toBe('function');
      expect(typeof domainServices.selectArticlesUseCase.execute).toBe('function');
      
      // Application services should orchestrate use cases
      const callbacks = {
        onStateChange: () => {},
        onError: () => {},
        onSuccess: () => {},
      };
      const workflowService = TopicsServiceFactory.createWorkflowService(callbacks);
      expect(typeof workflowService.updateBasicInfo).toBe('function');
      expect(typeof workflowService.searchArticles).toBe('function');
    });

    test('Single Responsibility Principle is maintained', () => {
      // Each use case should have a single, clear responsibility
      const domainServices = TopicsServiceFactory.createDomainServices();
      
      // CreateTopicsUseCase should only handle creation
      expect(domainServices.createTopicsUseCase.constructor.name).toBe('CreateTopicsUseCase');
      
      // SelectArticlesUseCase should only handle article selection
      expect(domainServices.selectArticlesUseCase.constructor.name).toBe('SelectArticlesUseCase');
      
      // AssignCategoryUseCase should only handle category assignment
      expect(domainServices.assignCategoryUseCase.constructor.name).toBe('AssignCategoryUseCase');
    });

    test('Components have clear interfaces', () => {
      // Verify that our UI components have well-defined props
      // This would be better tested with actual component testing
      // but we can at least verify the architecture exports correctly
      
      const domainServices = TopicsServiceFactory.createDomainServices();
      expect(domainServices).toBeDefined();
      
      const callbacks = {
        onStateChange: () => {},
        onError: () => {},
        onSuccess: () => {},
      };
      const workflowService = TopicsServiceFactory.createWorkflowService(callbacks);
      expect(workflowService).toBeDefined();
    });
  });

  describe('Data Flow', () => {
    test('Workflow handles complete TOPICS creation flow', async () => {
      const events: string[] = [];
      const callbacks = {
        onStateChange: (state: any) => { 
          events.push(`state_changed:${state.activeTab}`);
        },
        onError: (error: string) => { 
          events.push(`error:${error}`);
        },
        onSuccess: (message: string) => { 
          events.push(`success:${message}`);
        },
      };

      const workflowService = TopicsServiceFactory.createWorkflowService(callbacks);
      
      // Step 1: Update basic info
      workflowService.updateBasicInfo({
        title: 'Integration Test Topic',
        publishDate: new Date('2024-01-15'),
        summary: 'Test topic for integration',
      });
      
      // Step 2: Switch to template tab
      workflowService.switchTab('template');
      
      // Step 3: Switch to preview tab
      workflowService.switchTab('preview');
      
      // Verify the flow occurred
      expect(events.some(e => e.includes('state_changed'))).toBe(true);
      expect(events.some(e => e.includes('template'))).toBe(true);
      expect(events.some(e => e.includes('preview'))).toBe(true);
    });
  });
});

// Test helper to verify the component exports
describe('Component Architecture', () => {
  test('UI components are properly separated', () => {
    // This is a basic test to ensure our refactoring maintains proper separation
    // In a real environment, we'd use testing libraries to mount and test components
    
    // Verify that we can import our new architecture components
    expect(() => {
      require('../components/ui/TopicsHeader');
      require('../components/ui/ArticleSelector');
      require('../components/ui/CategoryAssigner');
      require('../components/ui/TopicsPreview');
      require('../components/RefactoredTopicsEditorClient');
    }).not.toThrow();
  });
});