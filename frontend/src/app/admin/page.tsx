import AdminDashboardClient from "@/features/admin/components/AdminDashboardClient";
import PageWithBackground from "@/components/layouts/PageWithBackground";

// 管理画面

export default function AdminDashboard() {
  return (
    <PageWithBackground>
      <AdminDashboardClient />
    </PageWithBackground>
  );
}
