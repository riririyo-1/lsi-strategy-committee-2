import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Topic } from "@/types/topic.d";
import { Article } from "@/types/article.d";
import { topicsApi } from "@/lib/apiClient";
import { ArticleWithCategory } from "../components/TemplateGenerationTab";

interface UseTopicsEditorProps {
  mode: "create" | "edit";
  topicId?: string;
}

export interface TopicsEditorState {
  // 基本情報
  title: string;
  publishDate: string;
  monthlySummary: string;

  // 記事関連
  selectedArticles: Article[];
  articlesWithCategories: ArticleWithCategory[];

  // UI状態
  activeTab: "articles" | "template" | "preview";
  loading: boolean;
  saving: boolean;

  // データ
  topic: Topic | null;
}

export interface TopicsEditorActions {
  // 基本情報更新
  setTitle: (title: string) => void;
  setPublishDate: (date: string) => void;
  setMonthlySummary: (summary: string) => void;

  // 記事関連
  setSelectedArticles: (articles: Article[]) => Promise<void>;
  setArticlesWithCategories: (articles: ArticleWithCategory[]) => void;

  // UI操作
  setActiveTab: (tab: "articles" | "template" | "preview") => void;

  // ビジネスロジック
  handleSave: () => Promise<void>;
  handleCancel: () => void;
  loadTopic: () => Promise<void>;
  saveMonthlySummary: (summary: string) => Promise<void>;
  
  // IDs
  effectiveTopicId?: string;
}

export function useTopicsEditor({ mode, topicId }: UseTopicsEditorProps) {
  const router = useRouter();
  
  // 新規作成時の仮トピックIDを生成（既存のtopicIdがない場合）
  const [draftTopicId, setDraftTopicId] = useState<string | null>(null);
  const effectiveTopicId = topicId || draftTopicId;

  // State
  const [state, setState] = useState<TopicsEditorState>({
    title: "",
    publishDate: new Date().toISOString().split("T")[0],
    monthlySummary: "",
    selectedArticles: [],
    articlesWithCategories: [],
    activeTab: "articles",
    loading: false,
    saving: false,
    topic: null,
  });

  // 状態更新のヘルパー
  const updateState = useCallback((updates: Partial<TopicsEditorState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  // アクション定義
  const actions: TopicsEditorActions = {
    setTitle: useCallback(
      (title: string) => {
        updateState({ title });
      },
      [updateState]
    ),

    setPublishDate: useCallback(
      (publishDate: string) => {
        updateState({ publishDate });
      },
      [updateState]
    ),

    setMonthlySummary: useCallback(
      (monthlySummary: string) => {
        updateState({ monthlySummary });
      },
      [updateState]
    ),

    setSelectedArticles: useCallback(
      async (selectedArticles: Article[]) => {
        updateState({ selectedArticles });
        
        let currentTopicId = topicId || draftTopicId;
        
        // 新規作成時で初回の記事選択の場合、仮トピックを作成
        if (mode === "create" && !currentTopicId && selectedArticles.length > 0) {
          try {
            console.log("Creating draft topic for first article selection");
            const response = await topicsApi.create({
              title: state.title || "下書き",
              publishDate: state.publishDate,
              summary: "",
              articles: selectedArticles.map(a => a.id),
              status: "draft"
            });
            const newTopicId = response.data.id;
            setDraftTopicId(newTopicId);
            currentTopicId = newTopicId;
            console.log("Draft topic created:", newTopicId);
          } catch (error) {
            console.error("Failed to create draft topic:", error);
            return;
          }
        }
        
        // トピックIDがある場合は記事を更新
        if (currentTopicId) {
          try {
            console.log("Updating articles for topic:", currentTopicId, selectedArticles.map(a => a.id));
            await topicsApi.updateArticles(currentTopicId, {
              articles: selectedArticles.map(a => a.id)
            });
            console.log("Articles updated successfully");
          } catch (error) {
            console.error("Failed to update articles:", error);
          }
        }
      },
      [updateState, mode, topicId, draftTopicId, state.title, state.publishDate]
    ),

    setArticlesWithCategories: useCallback(
      (articlesWithCategories: ArticleWithCategory[]) => {
        updateState({ articlesWithCategories });
      },
      [updateState]
    ),

    setActiveTab: useCallback(
      (activeTab: "articles" | "template" | "preview") => {
        updateState({ activeTab });
      },
      [updateState]
    ),

    loadTopic: useCallback(async () => {
      if (!topicId || mode !== "edit") return;

      try {
        updateState({ loading: true });
        const response = await topicsApi.getById(topicId);
        const topicData = response.data;

        updateState({
          topic: topicData,
          title: topicData.title || "",
          publishDate: topicData.publishDate
            ? topicData.publishDate.split("T")[0]
            : new Date().toISOString().split("T")[0],
          monthlySummary: topicData.summary || "",
        });

        // 関連記事を設定
        if (topicData.articles && topicData.articles.length > 0) {
          const articlesWithCats = topicData.articles.map((article: any) => ({
            ...article,
            mainCategory: article.category || undefined,
          }));

          updateState({
            selectedArticles: topicData.articles,
            articlesWithCategories: articlesWithCats,
          });
        }
      } catch (error) {
        console.error("Failed to load topic:", error);
        alert("TOPICSの読み込みに失敗しました");
      } finally {
        updateState({ loading: false });
      }
    }, [topicId, mode, updateState]),

    handleSave: useCallback(async () => {
      if (!state.title.trim()) {
        alert("タイトルを入力してください");
        return;
      }

      try {
        updateState({ saving: true });

        // カテゴリ情報をオブジェクト形式に変換
        const categories: { [articleId: string]: { main: string } } = {};
        if (state.articlesWithCategories.length > 0) {
          state.articlesWithCategories.forEach((article) => {
            if (article.mainCategory) {
              categories[article.id] = { main: article.mainCategory };
            }
          });
        }

        const topicData = {
          title: state.title.trim(),
          publishDate: state.publishDate,
          summary: state.monthlySummary,
          articles: state.selectedArticles.map((article) => article.id),
          categories:
            Object.keys(categories).length > 0 ? categories : undefined,
        };

        if (mode === "create") {
          const response = await topicsApi.create(topicData);
          alert("TOPICSを作成しました");
          router.push(`/admin/topics/edit/${response.data.id}`);
        } else if (mode === "edit" && topicId) {
          await topicsApi.update(topicId, topicData);
          alert("TOPICSを更新しました");
        }
      } catch (error) {
        console.error("Failed to save topic:", error);
        alert("TOPICSの保存に失敗しました");
      } finally {
        updateState({ saving: false });
      }
    }, [state, mode, topicId, router, updateState]),

    handleCancel: useCallback(() => {
      if (confirm("変更内容が失われます。よろしいですか？")) {
        router.push("/admin/topics");
      }
    }, [router]),

    saveMonthlySummary: useCallback(async (summary: string) => {
      const currentTopicId = topicId || draftTopicId;
      if (!currentTopicId) {
        throw new Error("TOPICSが保存されていません");
      }

      try {
        await topicsApi.update(currentTopicId, {
          summary: summary
        });
        updateState({ monthlySummary: summary });
      } catch (error) {
        console.error("Failed to save monthly summary:", error);
        throw new Error("月次まとめの保存に失敗しました");
      }
    }, [topicId, draftTopicId, updateState]),
  };

  // 編集モードの場合、初期化時にTOPICSデータを取得
  useEffect(() => {
    if (mode === "edit" && topicId) {
      actions.loadTopic();
    }
  }, [mode, topicId, actions.loadTopic]);

  // effectiveTopicIdをactionsに追加
  const actionsWithId = {
    ...actions,
    effectiveTopicId
  };

  return { state, actions: actionsWithId };
}
