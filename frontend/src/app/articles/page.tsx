import { Metadata } from "next";
import ArticlesPageClient from "@/features/articles/components/ArticlesPageClient";
import PageWithBackground from "@/components/common/PageWithBackground";

export const metadata: Metadata = {
  title: "記事一覧 - LSI戦略コミッティ",
  description: "半導体業界の最新記事を掲載しています",
};

export default function ArticlesPage() {
  return (
    <PageWithBackground>
      <ArticlesPageClient />
    </PageWithBackground>
  );
}
