"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/features/i18n/hooks/useI18n";
import { Article } from "@/types/article";

interface ArticleDetailProps {
  articleId: string;
}

export default function ArticleDetail({ articleId }: ArticleDetailProps) {
  const { t } = useI18n();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      try {
        // 実際の実装では、APIからデータを取得する
        // 以下はモックデータ
        await new Promise((resolve) => setTimeout(resolve, 500)); // APIリクエストをシミュレート

        // モックデータとしてハードコードした記事を返す
        // 実際の実装では、APIから特定のIDの記事を取得する
        const mockArticle: Article = {
          id: articleId,
          title: "次世代半導体：3nmプロセスの量産化が始まる",
          source: "EE Times Japan",
          publishedAt: "2025-05-15",
          summary:
            "台湾のTSMCが3nmプロセスの量産を開始。次世代チップの省電力化と高性能化に期待が高まっています。",
          labels: ["製造プロセス", "TSMC", "微細化"],
          thumbnailUrl: "https://placehold.co/600x400?text=3nm+Process",
          articleUrl: "https://example.com/article1",
          fullText: `
            半導体製造大手のTSMCは、最先端の3nmプロセス技術を用いたチップの量産を開始しました。
            
            ## 微細化の進展
            
            3nmプロセス技術は、従来の5nmプロセスと比較して性能が15～20%向上し、消費電力が25～30%削減されると言われています。これにより、スマートフォンやデータセンターなどの電力効率が大幅に改善される見込みです。
            
            TSMCの最高技術責任者（CTO）によると、「3nmプロセスの量産開始は、ムーアの法則の継続的な実現を示すマイルストーンとなる」と述べています。
            
            ## 顧客と市場
            
            主要顧客として、Apple、AMD、NVIDIAなどが3nmプロセスを採用する見込みです。特にAppleは、次世代のiPhoneやMacに搭載するチップに3nmプロセスを採用すると見られています。
            
            市場調査会社のIDCによると、3nmプロセス技術を用いたチップの市場規模は2026年までに500億ドルに達すると予測されています。
            
            ## 今後の展望
            
            TSMCはすでに次世代の2nmプロセス技術の開発を進めており、2027年の量産開始を目指しています。半導体の微細化競争は今後も続くことが予想されます。
          `,
          createdAt: "2025-05-15T10:00:00Z",
          updatedAt: "2025-05-15T10:00:00Z",
        };

        setArticle(mockArticle);
      } catch (err) {
        console.error("Failed to fetch article:", err);
        setError("記事の読み込みに失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [articleId]);

  // 静的な日付フォーマット（サーバーとクライアント間で一貫性を持たせるため）
  const formatDate = (dateString: string) => {
    // ISOのYYYY-MM-DD部分のみを抽出（ブラウザ非依存）
    return dateString.split("T")[0];
  };

  // マークダウン風の文字列をHTMLに変換する簡易関数
  // 実際の実装では、マークダウンパーサーを使用するべき
  const renderMarkdown = (text: string) => {
    if (!text) return "";

    return text
      .split("\n\n")
      .map((paragraph) => {
        if (paragraph.startsWith("## ")) {
          return `<h2 class="text-xl font-bold mt-6 mb-3 text-blue-300">${paragraph.substring(
            3
          )}</h2>`;
        }
        return `<p class="mb-4">${paragraph}</p>`;
      })
      .join("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#181e29] py-20 px-4 flex justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-400">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-[#181e29] py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-500/20 border border-red-500 text-white px-4 py-3 rounded">
            {error || "記事が見つかりません"}
          </div>
          <div className="mt-4">
            <Link href="/articles" className="text-blue-400 hover:underline">
              ← {t("articles.detail.backToList")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181e29] py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/articles" className="text-blue-400 hover:underline">
            ← {t("articles.detail.backToList")}
          </Link>
        </div>

        <div className="bg-[#232b39] rounded-2xl shadow p-8">
          {article.thumbnailUrl && (
            <div className="relative h-64 w-full mb-6 rounded-xl overflow-hidden">
              <Image
                src={article.thumbnailUrl}
                alt={article.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          <h1 className="text-2xl md:text-3xl font-bold text-gray-100 mb-4">
            {article.title}
          </h1>

          <div className="flex flex-wrap gap-2 mb-6">
            {article.labels.map((label) => (
              <span
                key={label}
                className="text-sm bg-blue-900/50 text-blue-200 px-3 py-1 rounded-full"
              >
                {label}
              </span>
            ))}
          </div>

          <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-700">
            <div>
              <p className="text-gray-300">
                <span className="font-medium">
                  {t("articles.detail.source")}:
                </span>{" "}
                {article.source}
              </p>
              <p className="text-gray-300">
                <span className="font-medium">
                  {t("articles.detail.publishDate")}:
                </span>{" "}
                {formatDate(article.publishedAt)}
              </p>
            </div>

            <a
              href={article.articleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-blue-600/80 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              <span>{t("articles.originalArticle")}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>

          <div className="mb-10">
            <h2 className="text-xl font-semibold text-gray-100 mb-3">
              {t("articles.detail.summary")}
            </h2>
            <p className="text-gray-300 bg-[#1d2433] p-4 rounded-lg italic">
              {article.summary}
            </p>
          </div>

          {article.fullText && (
            <div className="prose prose-invert prose-blue max-w-none">
              <h2 className="text-xl font-semibold text-gray-100 mb-3">
                {t("articles.detail.content")}
              </h2>
              <div
                className="text-gray-300 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: renderMarkdown(article.fullText),
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
