"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/features/i18n/hooks/useI18n";
import { Schedule, ScheduleFormData } from "@/types/schedule";
import ScheduleList from "./ScheduleList";
import ScheduleForm from "./ScheduleForm";
import { ApiScheduleRepository } from "../infrastructure/ApiScheduleRepository";
import { Button } from "@/components/ui/Button";
import {
  GetSchedulesUseCase,
  CreateScheduleUseCase,
  UpdateScheduleUseCase,
  DeleteScheduleUseCase,
  ToggleScheduleUseCase,
  ExecuteScheduleNowUseCase,
} from "../use-cases/ScheduleUseCases";

export default function ScheduleSettingsTab() {
  const { t } = useI18n();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [error, setError] = useState<string | null>(null);

  // リポジトリとユースケースの初期化
  const repository = new ApiScheduleRepository();
  const getSchedulesUseCase = new GetSchedulesUseCase(repository);
  const createScheduleUseCase = new CreateScheduleUseCase(repository);
  const updateScheduleUseCase = new UpdateScheduleUseCase(repository);
  const deleteScheduleUseCase = new DeleteScheduleUseCase(repository);
  const toggleScheduleUseCase = new ToggleScheduleUseCase(repository);
  const executeScheduleNowUseCase = new ExecuteScheduleNowUseCase(repository);

  // スケジュール一覧の取得
  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const data = await getSchedulesUseCase.execute();
      setSchedules(data);
      setError(null);
    } catch (err: any) {
      console.error("Failed to fetch schedules:", err);
      setError("スケジュールの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  // スケジュール作成・更新
  const handleSubmit = async (data: ScheduleFormData) => {
    try {
      if (editingSchedule) {
        await updateScheduleUseCase.execute(editingSchedule.id, data);
        alert("スケジュールを更新しました");
      } else {
        await createScheduleUseCase.execute(data);
        alert("スケジュールを作成しました");
      }
      setShowForm(false);
      setEditingSchedule(null);
      await fetchSchedules();
    } catch (err: any) {
      console.error("Failed to save schedule:", err);
      alert(err.message || "スケジュールの保存に失敗しました");
    }
  };

  // スケジュール削除
  const handleDelete = async (id: string) => {
    try {
      await deleteScheduleUseCase.execute(id);
      alert("スケジュールを削除しました");
      await fetchSchedules();
    } catch (err: any) {
      console.error("Failed to delete schedule:", err);
      alert("スケジュールの削除に失敗しました");
    }
  };

  // スケジュール有効化・無効化
  const handleToggle = async (id: string, activate: boolean) => {
    try {
      await toggleScheduleUseCase.execute(id, activate);
      await fetchSchedules();
    } catch (err: any) {
      console.error("Failed to toggle schedule:", err);
      alert("スケジュールの状態変更に失敗しました");
    }
  };

  // 即時実行
  const handleExecuteNow = async (id: string) => {
    if (!confirm("このスケジュールを今すぐ実行しますか？")) {
      return;
    }

    try {
      const execution = await executeScheduleNowUseCase.execute(id);
      alert("スケジュールの実行を開始しました");
      await fetchSchedules();
    } catch (err: any) {
      console.error("Failed to execute schedule:", err);
      alert("スケジュールの実行に失敗しました");
    }
  };

  // 編集開始
  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setShowForm(true);
  };

  // フォームキャンセル
  const handleCancel = () => {
    setShowForm(false);
    setEditingSchedule(null);
  };

  // 実行履歴表示（今回は未実装）
  const handleViewExecutions = (scheduleId: string) => {
    alert("実行履歴機能は現在開発中です");
  };

  return (
    <>
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            定期実行設定
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              RSS収集やLLM処理などのタスクを定期的に自動実行する設定を管理します
            </p>
        </div>
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            variant="primary"
          >
            新規スケジュール作成
          </Button>
        )}
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="bg-red-500/10 dark:bg-red-500/20 border border-red-500 text-red-800 dark:text-white px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* フォームまたは一覧 */}
      {showForm ? (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              {editingSchedule ? "スケジュール編集" : "新規スケジュール作成"}
            </h3>
            <ScheduleForm
              initialData={editingSchedule ? {
                name: editingSchedule.name,
                description: editingSchedule.description,
                scheduleType: editingSchedule.scheduleType,
                time: editingSchedule.time,
                dayOfWeek: editingSchedule.dayOfWeek,
                dayOfMonth: editingSchedule.dayOfMonth,
                cronExpression: editingSchedule.cronExpression,
                taskType: editingSchedule.taskType,
                taskConfig: editingSchedule.taskConfig,
                isActive: editingSchedule.isActive,
              } : undefined}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
        </div>
      ) : (
        <>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 dark:border-blue-400"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                  読み込み中...
              </p>
            </div>
          ) : (
            <ScheduleList
              schedules={schedules}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggle={handleToggle}
              onExecuteNow={handleExecuteNow}
              onViewExecutions={handleViewExecutions}
            />
          )}
        </>
      )}
    </>
  );
}