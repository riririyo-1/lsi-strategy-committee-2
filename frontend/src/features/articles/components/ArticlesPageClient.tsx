"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/features/i18n/hooks/useI18n";
import SearchBar from "./SearchBar";
import ViewToggle from "./ViewToggle";
import ArticleTable from "./ArticleTable";
import ArticleCardGrid from "./ArticleCardGrid";
import { Article } from "@/types/article";

export default function ArticlesPageClient() {
  const { t } = useI18n();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "card">("card");
  const [searchQuery, setSearchQuery] = useState("");

  // モックデータの取得（実際の実装ではAPIから取得）
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        // モックデータ
        const mockArticles: Article[] = [
          {
            id: "1",
            title: "次世代半導体：3nmプロセスの量産化が始まる",
            source: "EE Times Japan",
            publishedAt: "2025-05-15",
            summary:
              "台湾のTSMCが3nmプロセスの量産を開始。次世代チップの省電力化と高性能化に期待が高まっています。",
            labels: ["製造プロセス", "TSMC", "微細化"],
            thumbnailUrl: "https://placehold.co/600x400?text=3nm+Process",
            articleUrl: "https://example.com/article1",
            createdAt: "2025-05-15",
            updatedAt: "2025-05-15",
          },
          {
            id: "2",
            title: "車載半導体市場：2025年は過去最高を記録へ",
            source: "日経エレクトロニクス",
            publishedAt: "2025-05-10",
            summary:
              "自動運転技術とEV化の進展により、車載半導体の市場規模が拡大。2025年は過去最高の出荷額を記録する見込み。",
            labels: ["市場動向", "車載", "EV"],
            thumbnailUrl:
              "https://placehold.co/600x400?text=Auto+Semiconductor",
            articleUrl: "https://example.com/article2",
            createdAt: "2025-05-10T14:30:00Z",
            updatedAt: "2025-05-10T14:30:00Z",
          },
          {
            id: "3",
            title: "量子コンピューティング向けLSI開発の最新動向",
            source: "IT Media",
            publishedAt: "2025-05-08T00:00:00Z",
            summary:
              "量子ビットの制御に特化したLSIの開発が進行中。従来のCMOSプロセスとの互換性を維持しつつ、低温動作に対応。",
            labels: ["量子コンピューティング", "研究開発"],
            thumbnailUrl: "https://placehold.co/600x400?text=Quantum+LSI",
            articleUrl: "https://example.com/article3",
            createdAt: "2025-05-08T09:15:00Z",
            updatedAt: "2025-05-08T09:15:00Z",
          },
          {
            id: "4",
            title: "サステナブル半導体製造：カーボンニュートラルへの取り組み",
            source: "マイナビニュース",
            publishedAt: "2025-05-05T00:00:00Z",
            summary:
              "半導体大手が製造プロセスのカーボンニュートラル化を加速。再生可能エネルギーの活用と製造効率の改善に注力。",
            labels: ["サステナビリティ", "環境", "製造"],
            thumbnailUrl:
              "https://placehold.co/600x400?text=Green+Semiconductor",
            articleUrl: "https://example.com/article4",
            createdAt: "2025-05-05T16:20:00Z",
            updatedAt: "2025-05-05T16:20:00Z",
          },
          {
            id: "5",
            title: "EUVリソグラフィ：次世代技術の課題と展望",
            source: "NHK",
            publishedAt: "2025-05-01T00:00:00Z",
            summary:
              "最先端のEUVリソグラフィ技術の現状と課題を解説。半導体の微細化限界への挑戦と将来展望を専門家が語る。",
            labels: ["リソグラフィ", "技術動向", "EUV"],
            thumbnailUrl: "https://placehold.co/600x400?text=EUV+Lithography",
            articleUrl: "https://example.com/article5",
            createdAt: "2025-05-01T11:00:00Z",
            updatedAt: "2025-05-01T11:00:00Z",
          },
        ];

        // 実際のAPIコール（コメントアウト）
        // const response = await fetch('/api/articles');
        // const articles = await response.json();

        setArticles(mockArticles);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch articles:", err);
        setError(t("articles.loadError"));
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [t]);

  // 検索とフィルタリング
  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      !searchQuery ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.labels.some((label) =>
        label.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      article.source.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // 検索ハンドラ
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // 表示モード切替ハンドラ
  const handleViewModeChange = (mode: "table" | "card") => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        setViewMode(mode);
      });
    } else {
      setViewMode(mode);
    }
  };

  return (
    <div
      className="min-h-screen bg-gray-100 dark:bg-[#181e29] py-20 md:py-40 px-4"
      suppressHydrationWarning
    >
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center text-gray-800 dark:text-white">
          {t("articles.title")}
        </h1>
        <p className="text-xl text-center text-gray-600 dark:text-gray-300 mb-4">
          {t("articles.description")}
        </p>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-10">
          {filteredArticles.length}{" "}
          {t(
            filteredArticles.length === 1
              ? "articles.article"
              : "articles.articles"
          )}
        </p>

        <div className="bg-white dark:bg-[#232b39] rounded-2xl shadow p-6 mb-10">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-6">
            <SearchBar onSearch={handleSearch} />
            <ViewToggle viewMode={viewMode} onChange={handleViewModeChange} />
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                読み込み中...
              </p>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 dark:bg-red-500/20 border border-red-500 text-red-800 dark:text-white px-4 py-3 rounded">
              {error}
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-20 text-gray-500 dark:text-gray-400">
              {t("articles.noResults")}
            </div>
          ) : viewMode === "table" ? (
            <ArticleTable articles={filteredArticles} />
          ) : (
            <ArticleCardGrid articles={filteredArticles} />
          )}
        </div>
      </div>
    </div>
  );
}
