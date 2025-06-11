"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/features/i18n/hooks/useI18n";
import { Article } from "@/types/article";
import { GetArticleByIdUseCase } from "../use-cases/GetArticleByIdUseCase";

const getArticleUseCase = new GetArticleByIdUseCase();

interface ArticleDetailProps {
  articleId: string;
}

export default function ArticleDetail({ articleId }: ArticleDetailProps) {
  const { t } = useI18n();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 記事取得関数をuseCallbackでメモ化
  const fetchArticle = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const fetchedArticle = await getArticleUseCase.execute(articleId);
      setArticle(fetchedArticle);
    } catch (err) {
      console.error("Failed to fetch article:", err);
      setError(
        err instanceof Error ? err.message : "記事の読み込みに失敗しました"
      );
      setArticle(null);
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

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
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-2 text-gray-400">読み込み中...</p>
      </div>
    );
  }

  if (error || !article) {
    return (
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
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/articles" className="text-blue-400 hover:underline">
          ← {t("articles.detail.backToList")}
        </Link>
      </div>

      <div className="bg-[#232b39] rounded-2xl shadow p-8">
        {/* 画像エリア（常に表示） */}
        <div className="relative h-64 w-full mb-6 rounded-xl overflow-hidden">
          {article.thumbnailUrl ? (
            <Image
              src={article.thumbnailUrl}
              alt={article.title}
              fill
              className="object-cover"
            />
          ) : (
            // No Image プレースホルダー
            <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
              <div className="text-center">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400 mb-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-lg text-gray-400 font-medium">No Image</p>
              </div>
            </div>
          )}
        </div>

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

        {article.fullText && article.fullText.trim() && (
          <div className="prose prose-invert prose-blue max-w-none">
            <h2 className="text-xl font-semibold text-gray-100 mb-3">本文</h2>
            <div className="bg-[#1d2433] p-6 rounded-lg">
              <div
                className="text-gray-300 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: renderMarkdown(article.fullText),
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
