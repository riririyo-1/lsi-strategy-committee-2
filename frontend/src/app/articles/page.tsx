import ArticlesPageClient from "@/features/articles/components/ArticlesPageClient";
import PageWithBackground from "@/components/layouts/PageWithBackground";

// 記事一覧

export default function ArticlesPage() {
  return (
    <PageWithBackground>
      <ArticlesPageClient />
    </PageWithBackground>
  );
}
