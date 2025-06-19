import { Metadata } from "next";
import ArticleDetail from "@/features/articles/components/ArticleDetail";
import PageWithBackground from "@/components/layouts/PageWithBackground";
import { notFound } from "next/navigation";

interface ArticleDetailPageProps {
  params: { id: string } | Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const generateMetadata = async ({
  params,
}: ArticleDetailPageProps): Promise<Metadata> => {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    // サーバーサイドでAPI呼び出し
    const apiUrl = process.env.API_URL_INTERNAL || "http://localhost:4000";
    const response = await fetch(`${apiUrl}/api/articles/${id}`);
    
    if (response.ok) {
      const article = await response.json();
      return {
        title: `${article.title} - LSI戦略コミッティ`,
        description: article.summary || "半導体業界の記事詳細を表示します",
        openGraph: {
          title: article.title,
          description: article.summary,
          images: article.thumbnailUrl ? [article.thumbnailUrl] : [],
        },
      };
    }
  } catch (error) {
    console.error("Error fetching article metadata:", error);
  }
  
  // フォールバック
  return {
    title: `記事詳細 - LSI戦略コミッティ`,
    description: "半導体業界の記事詳細を表示します",
  };
};

export default async function ArticleDetailPage({
  params,
}: ArticleDetailPageProps) {
  try {
    // paramsをawaitして安全に扱う
    const resolvedParams = await params;
    const id = resolvedParams.id;
    if (!id) return notFound();

    return (
      <PageWithBackground>
        <ArticleDetail articleId={id} />
      </PageWithBackground>
    );
  } catch (error) {
    console.error("Error loading article:", error);
    return notFound();
  }
}
