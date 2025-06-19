"use client";
import React from "react";
import type { Topic, TopicCategory } from "@/types/topic";
import { CategorySection } from "./CategorySection";
import { useI18n } from "@/features/i18n/hooks/useI18n";
import { useViewTransition } from "@/hooks/useViewTransition";

interface TopicDetailProps {
  topic: Topic;
}

export const TopicDetail: React.FC<TopicDetailProps> = ({ topic }) => {
  const { t } = useI18n();
  const { navigate } = useViewTransition();

  const handleBackNavigation = async () => {
    try {
      await navigate("/topics", {
        onBeforeTransition: () => {
          console.log("Navigating back to topics");
        },
        onError: (error) => {
          console.error("Back navigation failed:", error);
        }
      });
    } catch (error) {
      console.error("Navigation failed:", error);
    }
  };
  return (
    <div className="topic-detail-page max-w-4xl mx-auto bg-white/80 dark:bg-gray-900/90 rounded-xl p-8 shadow-lg text-gray-900 dark:text-gray-100">
      <div className="mb-6 flex justify-end">
        <button
          onClick={handleBackNavigation}
          className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-4 py-2 rounded transition"
        >
          {t("common.back")}
        </button>
      </div>
      <h1 className="text-4xl font-bold text-yellow-300 mb-2">{topic.title}</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-2">
        {t("topics.publishDate", { 
          date: topic.publishDate?.substring(0, 10) || t("common.notSet", "未設定")
        })}
      </p>
      <p className="mb-6 text-gray-700 dark:text-gray-200">{topic.summary}</p>
      <div>
        {topic.categories.map((cat: TopicCategory) => (
          <CategorySection key={cat.id} category={cat} />
        ))}
      </div>
    </div>
  );
};
