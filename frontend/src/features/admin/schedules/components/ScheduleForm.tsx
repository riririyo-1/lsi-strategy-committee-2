"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/features/i18n/hooks/useI18n";
import { ScheduleFormData, ScheduleType, TaskType, TaskConfig } from "@/types/schedule";

interface ScheduleFormProps {
  initialData?: ScheduleFormData;
  onSubmit: (data: ScheduleFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ScheduleForm({ initialData, onSubmit, onCancel, isLoading }: ScheduleFormProps) {
  const { t } = useI18n();
  
  const [formData, setFormData] = useState<ScheduleFormData>({
    name: "",
    description: "",
    scheduleType: "daily",
    time: "09:00",
    taskType: "rss_collection",
    taskConfig: {
      sources: ["ITmedia", "NHK", "EE Times Japan", "マイナビ"],
      daysToCollect: 1,
    },
    isActive: true,
    ...initialData,
  });

  const taskTypes: { value: TaskType; label: string }[] = [
    { value: "rss_collection", label: "RSS収集" },
    { value: "labeling", label: "ラベル付与" },
    { value: "summarization", label: "要約作成" },
    { value: "categorization", label: "カテゴリ分類" },
    { value: "batch_process", label: "バッチ処理（全工程）" },
  ];

  const scheduleTypes: { value: ScheduleType; label: string }[] = [
    { value: "daily", label: "毎日" },
    { value: "weekly", label: "毎週" },
    { value: "monthly", label: "毎月" },
    { value: "custom", label: "カスタム（Cron）" },
  ];

  const dayOfWeekOptions = [
    { value: 0, label: "日曜日" },
    { value: 1, label: "月曜日" },
    { value: 2, label: "火曜日" },
    { value: 3, label: "水曜日" },
    { value: 4, label: "木曜日" },
    { value: 5, label: "金曜日" },
    { value: 6, label: "土曜日" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateTaskConfig = (updates: Partial<TaskConfig>) => {
    setFormData(prev => ({
      ...prev,
      taskConfig: {
        ...prev.taskConfig,
        ...updates,
      },
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 基本情報 */}
      <div className="bg-white dark:bg-[#232b39] rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          基本情報
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              スケジュール名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#1d2433] text-gray-900 dark:text-gray-100"
              placeholder="例：毎朝のRSS収集"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              説明
            </label>
            <textarea
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#1d2433] text-gray-900 dark:text-gray-100"
              placeholder="このスケジュールの目的や詳細を記述"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              有効化
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="mr-2 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                このスケジュールを有効にする
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* スケジュール設定 */}
      <div className="bg-white dark:bg-[#232b39] rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          スケジュール設定
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              実行タイミング <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.scheduleType}
              onChange={(e) => setFormData({ ...formData, scheduleType: e.target.value as ScheduleType })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#1d2433] text-gray-900 dark:text-gray-100"
            >
              {scheduleTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {formData.scheduleType === "daily" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                実行時刻 <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={formData.time || "09:00"}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#1d2433] text-gray-900 dark:text-gray-100"
              />
            </div>
          )}

          {formData.scheduleType === "weekly" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  曜日 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.dayOfWeek || 1}
                  onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#1d2433] text-gray-900 dark:text-gray-100"
                >
                  {dayOfWeekOptions.map(day => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  実行時刻 <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={formData.time || "09:00"}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#1d2433] text-gray-900 dark:text-gray-100"
                />
              </div>
            </>
          )}

          {formData.scheduleType === "monthly" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  日付 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.dayOfMonth || 1}
                  onChange={(e) => setFormData({ ...formData, dayOfMonth: parseInt(e.target.value) })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#1d2433] text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  実行時刻 <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={formData.time || "09:00"}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#1d2433] text-gray-900 dark:text-gray-100"
                />
              </div>
            </>
          )}

          {formData.scheduleType === "custom" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cron式 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.cronExpression || ""}
                onChange={(e) => setFormData({ ...formData, cronExpression: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#1d2433] text-gray-900 dark:text-gray-100"
                placeholder="例: 0 9 * * * (毎日9時)"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                分 時 日 月 曜日 の形式で指定
              </p>
            </div>
          )}
        </div>
      </div>

      {/* タスク設定 */}
      <div className="bg-white dark:bg-[#232b39] rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          タスク設定
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              実行タスク <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.taskType}
              onChange={(e) => setFormData({ ...formData, taskType: e.target.value as TaskType })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#1d2433] text-gray-900 dark:text-gray-100"
            >
              {taskTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* RSS収集の設定 */}
          {formData.taskType === "rss_collection" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  収集ソース
                </label>
                <div className="space-y-2">
                  {["ITmedia", "NHK", "EE Times Japan", "マイナビ"].map(source => (
                    <label key={source} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.taskConfig.sources?.includes(source) || false}
                        onChange={(e) => {
                          const sources = formData.taskConfig.sources || [];
                          if (e.target.checked) {
                            updateTaskConfig({ sources: [...sources, source] });
                          } else {
                            updateTaskConfig({ sources: sources.filter(s => s !== source) });
                          }
                        }}
                        className="mr-2 rounded"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{source}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  収集日数
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={formData.taskConfig.daysToCollect || 1}
                  onChange={(e) => updateTaskConfig({ daysToCollect: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#1d2433] text-gray-900 dark:text-gray-100"
                />
              </div>
            </>
          )}

          {/* ラベル付与・要約の設定 */}
          {(formData.taskType === "labeling" || formData.taskType === "summarization") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                対象記事フィルター
              </label>
              <div className="space-y-2">
                {formData.taskType === "labeling" && (
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.taskConfig.articleFilter?.onlyWithoutLabels || false}
                      onChange={(e) => updateTaskConfig({
                        articleFilter: {
                          ...formData.taskConfig.articleFilter,
                          onlyWithoutLabels: e.target.checked,
                        },
                      })}
                      className="mr-2 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      ラベルがない記事のみ
                    </span>
                  </label>
                )}
                {formData.taskType === "summarization" && (
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.taskConfig.articleFilter?.onlyWithoutSummary || false}
                      onChange={(e) => updateTaskConfig({
                        articleFilter: {
                          ...formData.taskConfig.articleFilter,
                          onlyWithoutSummary: e.target.checked,
                        },
                      })}
                      className="mr-2 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      要約がない記事のみ
                    </span>
                  </label>
                )}
              </div>
            </div>
          )}

          {/* バッチ処理の設定 */}
          {formData.taskType === "batch_process" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  処理内容
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.taskConfig.includeLabeling !== false}
                      onChange={(e) => updateTaskConfig({ includeLabeling: e.target.checked })}
                      className="mr-2 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      ラベル付与を含む
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.taskConfig.includeSummarization !== false}
                      onChange={(e) => updateTaskConfig({ includeSummarization: e.target.checked })}
                      className="mr-2 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      要約作成を含む
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.taskConfig.includeCategorization || false}
                      onChange={(e) => updateTaskConfig({ includeCategorization: e.target.checked })}
                      className="mr-2 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      カテゴリ分類を含む
                    </span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  バッチサイズ
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.taskConfig.batchSize || 50}
                  onChange={(e) => updateTaskConfig({ batchSize: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#1d2433] text-gray-900 dark:text-gray-100"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md transition-colors"
        >
          {isLoading ? "保存中..." : initialData ? "更新" : "作成"}
        </button>
      </div>
    </form>
  );
}