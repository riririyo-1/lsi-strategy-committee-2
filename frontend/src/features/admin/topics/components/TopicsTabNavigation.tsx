import { useI18n } from "@/features/i18n/hooks/useI18n";

interface TopicsTabNavigationProps {
  activeTab: "articles" | "template" | "preview";
  onTabChange: (tab: "articles" | "template" | "preview") => void;
}

export default function TopicsTabNavigation({
  activeTab,
  onTabChange,
}: TopicsTabNavigationProps) {
  const { t } = useI18n();

  const tabs = [
    { id: "articles" as const, label: t("admin.topics.articleSelection") },
    { id: "template" as const, label: t("admin.topics.template") },
    { id: "preview" as const, label: t("admin.topics.preview") },
  ];

  return (
    <div className="mb-6 mt-12">
      <div className="border-b border-gray-300 dark:border-gray-600">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`py-3 px-2 border-b-2 font-medium text-base transition-colors ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 hover:border-gray-400 dark:hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
