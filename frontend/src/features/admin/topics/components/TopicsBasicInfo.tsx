import { useI18n } from "@/features/i18n/hooks/useI18n";
import DatePicker from "@/components/ui/DatePicker";

interface TopicsBasicInfoProps {
  title: string;
  publishDate: string;
  onTitleChange: (title: string) => void;
  onPublishDateChange: (date: string) => void;
}

export default function TopicsBasicInfo({
  title,
  publishDate,
  onTitleChange,
  onPublishDateChange,
}: TopicsBasicInfoProps) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col md:flex-row gap-6 mb-6">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t("admin.topics.title")} *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder={t("admin.topics.titlePlaceholder")}
          className="w-full px-4 py-2 bg-white dark:bg-[#2d3646] text-gray-900 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors"
        />
      </div>
      <div className="w-full md:w-64">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t("admin.topics.publishDate")}
        </label>
        <DatePicker
          selected={publishDate ? new Date(publishDate) : undefined}
          onSelect={(date) =>
            onPublishDateChange(date.toISOString().split("T")[0])
          }
          placeholder={t("admin.topics.selectPublishDate")}
          className="w-full"
        />
      </div>
    </div>
  );
}
