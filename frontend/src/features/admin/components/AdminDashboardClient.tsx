"use client";

import { useI18n } from "@/features/i18n/hooks/useI18n";
import { PageLayout } from "@/components/layouts/PageLayout";
import { Card, CardAction } from "@/components/ui/Card";

interface AdminMenuItem {
  title: string;
  description: string;
  href: string;
}

const AdminDashboardClient = () => {
  const { t } = useI18n();

  const adminMenuItems: AdminMenuItem[] = [
    {
      title: t("adminDashboard.researchTitle"),
      description: t("adminDashboard.researchDesc"),
      href: "/admin/research"
    },
    {
      title: t("adminDashboard.articlesTitle"),
      description: t("adminDashboard.articlesDesc"),
      href: "/admin/articles/collect"
    },
    {
      title: t("adminDashboard.topicsTitle"),
      description: t("adminDashboard.topicsDesc"),
      href: "/admin/topics"
    }
  ];

  const actionBar = (
    <div className="w-full flex justify-center">
      <a
        href="/api-docs"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium backdrop-blur-sm border border-white/20"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
        {t("adminDashboard.swagger")}
      </a>
    </div>
  );

  return (
    <PageLayout
      title={t("adminDashboard.title")}
      description={t("adminDashboard.subtitle")}
      actions={actionBar}
      showActionBar={true}
    >
      {/* 管理メニューカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
        {adminMenuItems.map((item, index) => {
          const actions: CardAction[] = [
            {
              label: t("common.details"),
              href: item.href,
              variant: "primary"
            }
          ];

          // 各管理機能に応じた色テーマを設定
          let colorTheme: "research" | "article" | "topics" = "default" as any;
          if (item.href.includes("/research")) {
            colorTheme = "research";
          } else if (item.href.includes("/articles")) {
            colorTheme = "article";
          } else if (item.href.includes("/topics")) {
            colorTheme = "topics";
          }

          return (
            <Card
              key={index}
              title={item.title}
              summary={item.description}
              actions={actions}
              variant="admin"
              colorTheme={colorTheme}
              className="admin-card"
            />
          );
        })}
      </div>

      {/* 追加情報セクション */}
      <div className="text-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">
            {t("adminDashboard.aboutTitle")}
          </h2>
          <p className="text-white/80 leading-relaxed">
            {t("adminDashboard.aboutDescription")}
          </p>
        </div>
      </div>
    </PageLayout>
  );
};

export default AdminDashboardClient;
