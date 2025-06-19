import ArticlesCollectPageClient from "@/features/admin/articles/collect/components/ArticlesCollectPageClient";
import PageWithBackground from "@/components/layouts/PageWithBackground";

// 記事の収集画面

export default function ArticlesCollectPage() {
  return (
    <PageWithBackground>
      <ArticlesCollectPageClient />
    </PageWithBackground>
  );
}
