import { useMemo } from "react";
// import useSWR from "swr";
// import { GetTopicsUseCase } from "../use-cases/GetTopicsUseCase";
// import { ApiTopicsRepository } from "../infrastructure/ApiTopicsRepository";
// import { GetTopicsParams } from "../ports/ITopicsRepository";

// 仮データ（API未実装のため）
const dummyTopics = [
  {
    id: "topics-202505",
    title: "2025年5月号 TOPICS",
    publishDate: "2025-05-01",
    summary:
      "半導体業界の最新トピックスをまとめました。AI、材料、サプライチェーンなど多角的に解説。",
    articleCount: 8,
    categories: [
      { id: "cat-1", name: "AI", displayOrder: 1, articles: [{ id: "a1" }] },
      {
        id: "cat-2",
        name: "材料",
        displayOrder: 2,
        articles: [{ id: "a2" }, { id: "a3" }],
      },
      {
        id: "cat-3",
        name: "サプライチェーン",
        displayOrder: 3,
        articles: [{ id: "a4" }],
      },
    ],
    createdAt: "2025-05-01T00:00:00Z",
    updatedAt: "2025-05-01T00:00:00Z",
  },
  {
    id: "topics-202504",
    title: "2025年4月号 TOPICS",
    publishDate: "2025-04-01",
    summary: "4月号は半導体材料の動向と新興企業の特集。",
    articleCount: 6,
    categories: [
      { id: "cat-1", name: "AI", displayOrder: 1, articles: [{ id: "a5" }] },
      { id: "cat-2", name: "材料", displayOrder: 2, articles: [{ id: "a6" }] },
    ],
    createdAt: "2025-04-01T00:00:00Z",
    updatedAt: "2025-04-01T00:00:00Z",
  },
];

export function useTopics(/* options: any = {} */) {
  // 本来はSWRやユースケース経由でAPI取得
  // const repository = useMemo(() => new ApiTopicsRepository(), []);
  // const getTopicsUseCase = useMemo(() => new GetTopicsUseCase(repository), [repository]);
  // const { data, error } = useSWR(["topics", options], () => getTopicsUseCase.execute(options));

  // 仮実装
  return {
    topics: dummyTopics,
    total: dummyTopics.length,
    isLoading: false,
    error: undefined,
    mutate: () => {},
  };
}
