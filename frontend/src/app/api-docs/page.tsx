import ApiDocsClient from "@/features/api-docs/components/ApiDocsClient";
import PageWithBackground from "@/components/layouts/PageWithBackground";

// APIドキュメント

export default function ApiDocsPage() {
  return (
    <PageWithBackground>
      <ApiDocsClient />
    </PageWithBackground>
  );
}
