import { useI18n } from "@/features/i18n/hooks/useI18n";

interface TopicsActionButtonsProps {
  mode: "create" | "edit";
  saving: boolean;
  title: string;
  onSave: () => void;
  onCancel: () => void;
}

export default function TopicsActionButtons({
  mode,
  saving,
  title,
  onSave,
  onCancel,
}: TopicsActionButtonsProps) {
  const { t } = useI18n();

  return (
    <div className="flex gap-4">
      <button
        onClick={onSave}
        disabled={saving || !title.trim()}
        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors"
      >
        {saving
          ? t("common.saving")
          : mode === "create"
          ? t("common.create")
          : t("common.update")}
      </button>
      <button
        onClick={onCancel}
        className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
      >
        {t("common.cancel")}
      </button>
    </div>
  );
}
