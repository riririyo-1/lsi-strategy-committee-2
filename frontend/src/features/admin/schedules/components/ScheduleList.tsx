"use client";

import { useState } from "react";
import { useI18n } from "@/features/i18n/hooks/useI18n";
import { Schedule, ScheduleExecution } from "@/types/schedule";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { ThemeText, ThemeCard, ThemeStatus } from "@/features/theme";

interface ScheduleListProps {
  schedules: Schedule[];
  onEdit: (schedule: Schedule) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, activate: boolean) => void;
  onExecuteNow: (id: string) => void;
  onViewExecutions: (scheduleId: string) => void;
}

export default function ScheduleList({
  schedules,
  onEdit,
  onDelete,
  onToggle,
  onExecuteNow,
  onViewExecutions,
}: ScheduleListProps) {
  const { t } = useI18n();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getScheduleTypeLabel = (schedule: Schedule): string => {
    switch (schedule.scheduleType) {
      case "daily":
        return `毎日 ${schedule.time}`;
      case "weekly":
        const dayNames = ["日", "月", "火", "水", "木", "金", "土"];
        return `毎週${dayNames[schedule.dayOfWeek || 0]}曜日 ${schedule.time}`;
      case "monthly":
        return `毎月${schedule.dayOfMonth}日 ${schedule.time}`;
      case "custom":
        return `カスタム: ${schedule.cronExpression}`;
      default:
        return "不明";
    }
  };

  const getTaskTypeLabel = (taskType: string): string => {
    const labels: Record<string, string> = {
      rss_collection: "RSS収集",
      labeling: "ラベル付与",
      summarization: "要約作成",
      categorization: "カテゴリ分類",
      batch_process: "バッチ処理",
    };
    return labels[taskType] || taskType;
  };

  const getStatusColor = (isActive: boolean): string => {
    return isActive
      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  };

  const handleToggleClick = (schedule: Schedule) => {
    onToggle(schedule.id, !schedule.isActive);
  };

  const handleDeleteClick = (schedule: Schedule) => {
    if (confirm(`「${schedule.name}」を削除しますか？この操作は取り消せません。`)) {
      onDelete(schedule.id);
    }
  };

  return (
    <div className="space-y-4">
      {schedules.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            スケジュールが設定されていません
          </p>
        </div>
      ) : (
        schedules.map(schedule => (
          <div
            key={schedule.id}
            className="border border-white/20 rounded-lg hover:border-white/40 transition-colors"
          >
            {/* メインコンテンツ */}
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {schedule.name}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                        schedule.isActive
                      )}`}
                    >
                      {schedule.isActive ? "有効" : "無効"}
                    </span>
                  </div>
                  
                  {schedule.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                      {schedule.description}
                    </p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">スケジュール:</span>
                      <span className="ml-2 text-gray-700 dark:text-gray-300">
                        {getScheduleTypeLabel(schedule)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">タスク:</span>
                      <span className="ml-2 text-gray-700 dark:text-gray-300">
                        {getTaskTypeLabel(schedule.taskType)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">次回実行:</span>
                      <span className="ml-2 text-gray-700 dark:text-gray-300">
                        {schedule.nextRun
                          ? formatDistanceToNow(new Date(schedule.nextRun), {
                              addSuffix: true,
                              locale: ja,
                            })
                          : "-"}
                      </span>
                    </div>
                  </div>

                  {schedule.lastRun && (
                    <div className="mt-2 text-sm">
                      <span className="text-white/60">最終実行:</span>
                      <span className="ml-2 text-white/80">
                        {formatDistanceToNow(new Date(schedule.lastRun), {
                          addSuffix: true,
                          locale: ja,
                        })}
                      </span>
                    </div>
                  )}
                </div>

                {/* アクションボタン */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleClick(schedule)}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      schedule.isActive
                        ? "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                        : "bg-green-600 hover:bg-green-700 text-white"
                    }`}
                  >
                    {schedule.isActive ? "無効化" : "有効化"}
                  </button>
                  <button
                    onClick={() => onExecuteNow(schedule.id)}
                    disabled={!schedule.isActive}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm rounded transition-colors"
                  >
                    今すぐ実行
                  </button>
                  <button
                    onClick={() => onEdit(schedule)}
                    className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteClick(schedule)}
                    className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* タスク詳細 */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() =>
                    setExpandedId(expandedId === schedule.id ? null : schedule.id)
                  }
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <span>{expandedId === schedule.id ? "詳細を隠す" : "詳細を表示"}</span>
                  <svg
                    className={`w-4 h-4 ml-1 transform transition-transform ${
                      expandedId === schedule.id ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {expandedId === schedule.id && (
                  <div className="mt-4 space-y-3">
                    {/* タスク設定の詳細 */}
                    <div className="bg-gray-50 dark:bg-[#1d2433] p-4 rounded">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        タスク設定
                      </h4>
                      <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">
                        {JSON.stringify(schedule.taskConfig, null, 2)}
                      </pre>
                    </div>

                    {/* 実行履歴を表示するボタン */}
                    <button
                      onClick={() => onViewExecutions(schedule.id)}
                      className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      実行履歴を表示 →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}