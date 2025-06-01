import type { Article } from "@/types/article";

// ダミー記事データ
const dummyArticles: Article[] = [
  {
    id: "a1",
    title: "量子コンピューティング向けLSIの最新開発状況",
    source: "TechNews",
    publishedAt: "2025/05/10",
    summary:
      "量子ビットの安定性と集積度向上に向けた新しいアーキテクチャが提案され、実用化への期待が高まっています。",
    labels: ["量子", "LSI", "新技術"],
    articleUrl: "#",
    createdAt: "2025-05-10T00:00:00Z",
    updatedAt: "2025-05-10T00:00:00Z",
  },
  {
    id: "a2",
    title: "EUVリソグラフィ技術の進展と課題",
    source: "Semicon Journal",
    publishedAt: "2025/05/08",
    summary:
      "次世代EUV光源の開発が進み、更なる微細化への道が開かれつつありますが、コストとスループットの課題は依然として残ります。",
    labels: ["EUV", "リソグラフィ", "製造プロセス"],
    articleUrl: "#",
    createdAt: "2025-05-08T00:00:00Z",
    updatedAt: "2025-05-08T00:00:00Z",
  },
  {
    id: "a3",
    title: "サステナブルな半導体製造への取り組み",
    source: "EcoBiz Online",
    publishedAt: "2025/05/05",
    summary:
      "主要メーカー各社が、使用資源の削減やリサイクル材の活用など、環境負荷低減に向けた具体的な目標と計画を発表しています。",
    labels: ["サステナブル", "製造", "CSR"],
    articleUrl: "#",
    createdAt: "2025-05-05T00:00:00Z",
    updatedAt: "2025-05-05T00:00:00Z",
  },
];

// topicId, categoryIdで該当カテゴリの全記事詳細を返す
export async function getDummyArticlesByTopicAndCategory(
  topicId: string,
  categoryId: string
): Promise<Article[]> {
  // topicsのダミーデータと連携する場合は、GetTopicByIdUseCaseからimportして参照してもよい
  // 今回はa1,a2,a3のみ
  if (topicId === "topic-001" && categoryId === "cat-1") {
    return dummyArticles.filter((a) => a.id === "a1" || a.id === "a2");
  }
  if (topicId === "topic-001" && categoryId === "cat-2") {
    return dummyArticles.filter((a) => a.id === "a3");
  }
  return [];
}
