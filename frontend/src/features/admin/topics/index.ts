// リポジトリのエクスポート
export { ApiTopicsRepository } from "./infrastructure/ApiTopicsRepository";

// インターフェースのエクスポート
export type {
  ITopicsRepository,
  GetTopicsParams,
  GetTopicsResult,
} from "./ports/ITopicsRepository";

// ユースケースのエクスポート
export {
  GetTopicsUseCase,
  GetTopicByIdUseCase,
  CreateTopicUseCase,
  UpdateTopicUseCase,
  DeleteTopicUseCase,
} from "./use-cases/TopicsUseCases";

// フックのエクスポート
export { useTopics } from "./hooks/useTopics";
export type { UseTopicsResult } from "./hooks/useTopics";

// コンポーネントのエクスポート
export { TopicsAdminClient } from "./components/TopicsAdminClient";
export { TopicCard } from "./components/TopicCard";
