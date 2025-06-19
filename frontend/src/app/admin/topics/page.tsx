import { TopicsAdminClient } from "@/features/admin/topics/components/TopicsAdminClient";
import PageWithBackground from "@/components/layouts/PageWithBackground";

// TOPICSの管理画面

export default function TopicsAdminPage() {
  return (
    <PageWithBackground>
      <TopicsAdminClient />
    </PageWithBackground>
  );
}
