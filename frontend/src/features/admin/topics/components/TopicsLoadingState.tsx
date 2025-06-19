import { useI18n } from "@/features/i18n/hooks/useI18n";
import { PageLayout } from "@/components/layouts/PageLayout";

interface TopicsLoadingStateProps {
  mode: "create" | "edit";
  actions: React.ReactNode;
}

export default function TopicsLoadingState({
  mode,
  actions,
}: TopicsLoadingStateProps) {
  const { t } = useI18n();

  return (
    <PageLayout
      title={
        mode === "create" ? t("admin.topics.createNew") : t("admin.topics.edit")
      }
      description="TOPICS配信の編集・作成を行います"
      actions={actions}
      showActionBar={true}
    >
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {t("common.loading")}
        </p>
      </div>
    </PageLayout>
  );
}
