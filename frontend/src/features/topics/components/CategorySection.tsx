import React, { useState, useEffect, Suspense, lazy } from "react";
import type { TopicCategory } from "@/types/topic.d";
import { ArticlesList } from "./ArticlesList";
import { ViewToggle } from "@/components/ui";
import { useViewTransition } from "@/hooks/useViewTransition";

// ArticleTableを動的インポート
const ArticleTable = lazy(() => import("@/features/articles/components/ArticleTable"));

interface CategorySectionProps {
  category: TopicCategory;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  category,
}) => {
  const [viewMode, setViewMode] = useState<"table" | "card">("card");
  const [isTableLoaded, setIsTableLoaded] = useState(false);
  const { withTransition } = useViewTransition();

  // 記事を日付順にソート（新しい順）
  const sortedArticles = [...category.articles].sort((a, b) => {
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  // ArticleTableを事前ロード
  useEffect(() => {
    if (!isTableLoaded) {
      import("@/features/articles/components/ArticleTable").then(() => {
        setIsTableLoaded(true);
      });
    }
  }, [isTableLoaded]);

  const handleViewModeChange = async (mode: "table" | "card") => {
    if (viewMode === mode) return;

    try {
      await withTransition(() => {
        setViewMode(mode);
      }, {
        onError: (error) => {
          console.error("Category view mode transition failed:", error);
        }
      });
    } catch (error) {
      console.error("Category view mode change failed:", error);
      // フォールバックとして直接設定
      setViewMode(mode);
    }
  };

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-blue-300">{category.name}</h3>
        <ViewToggle viewMode={viewMode} onChange={handleViewModeChange} />
      </div>
      
      <div className="view-transition-container relative">
        {/* 両方のビューをレンダリングして、CSSで表示切り替え */}
        <div className={viewMode === "card" ? "block" : "hidden"}>
          <ArticlesList articles={sortedArticles} />
        </div>
        
        <div className={viewMode === "table" ? "block" : "hidden"}>
          <Suspense fallback={
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          }>
            <ArticleTable articles={sortedArticles} />
          </Suspense>
        </div>
      </div>
      
      <hr className="my-4 border-gray-700" />
    </section>
  );
};
