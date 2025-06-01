import { Metadata } from "next";
import ArticleDetail from "@/features/articles/components/ArticleDetail";
import PageWithBackground from "@/components/common/PageWithBackground";
import { notFound } from "next/navigation";

interface ArticleDetailPageProps {
  params: { id: string } | Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const generateMetadata = async ({
  params,
}: ArticleDetailPageProps): Promise<Metadata> => {
  // 実際の実装では記事情報をAPIから取得し、メタデータを生成する
  const resolvedParams = await params;
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
