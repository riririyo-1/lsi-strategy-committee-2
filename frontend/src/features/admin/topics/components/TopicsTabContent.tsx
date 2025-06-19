import { Article } from "@/types/article.d";
import ArticleSelectionTab from "./ArticleSelectionTab";
import TemplateGenerationTab, {
  ArticleWithCategory,
} from "./TemplateGenerationTab";
import TopicsPreviewTab from "./TopicsPreviewTab";

interface TopicsTabContentProps {
  activeTab: "articles" | "template" | "preview";

  // Article Selection Tab
  selectedArticles: Article[];
  onSelectedArticlesChange: (articles: Article[]) => Promise<void>;

  // Template Generation Tab
  monthlySummary: string;
  onMonthlySummaryChange: (summary: string) => void;
  onArticlesWithCategoriesChange: (articles: ArticleWithCategory[]) => void;
  onSaveMonthlySummary?: (summary: string) => Promise<void>;
  topicId?: string;
  effectiveTopicId?: string;
  mode: "create" | "edit";
  articlesWithCategories: ArticleWithCategory[];

  // Preview Tab
  title: string;
  publishDate: string;
}

export default function TopicsTabContent({
  activeTab,
  selectedArticles,
  onSelectedArticlesChange,
  monthlySummary,
  onMonthlySummaryChange,
  onArticlesWithCategoriesChange,
  onSaveMonthlySummary,
  topicId,
  effectiveTopicId,
  mode,
  articlesWithCategories,
  title,
  publishDate,
}: TopicsTabContentProps) {
  return (
    <div className="mt-6">
      {activeTab === "articles" && (
        <ArticleSelectionTab
          selectedArticles={selectedArticles}
          onSelectedArticlesChange={onSelectedArticlesChange}
        />
      )}
      {activeTab === "template" && (
        <TemplateGenerationTab
          selectedArticles={selectedArticles}
          monthlySummary={monthlySummary}
          onMonthlySummaryChange={onMonthlySummaryChange}
          onArticlesWithCategoriesChange={onArticlesWithCategoriesChange}
          onSaveMonthlySummary={onSaveMonthlySummary}
          topicId={topicId}
          effectiveTopicId={effectiveTopicId}
          initialArticlesWithCategories={
            mode === "edit" ? articlesWithCategories : undefined
          }
        />
      )}
      {activeTab === "preview" && (
        <TopicsPreviewTab
          title={title}
          publishDate={publishDate}
          monthlySummary={monthlySummary}
          selectedArticles={selectedArticles}
        />
      )}
    </div>
  );
}
