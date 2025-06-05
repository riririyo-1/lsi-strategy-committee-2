import { Router, RequestHandler } from "express";
import {
  getSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  activateSchedule,
  deactivateSchedule,
  executeScheduleNow,
  getScheduleExecutions,
  getLatestExecution,
} from "../controllers/scheduleController";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Schedule:
 *       type: object
 *       required:
 *         - name
 *         - scheduleType
 *         - taskType
 *         - taskConfig
 *       properties:
 *         id:
 *           type: string
 *           description: スケジュールID
 *         name:
 *           type: string
 *           description: スケジュール名
 *         description:
 *           type: string
 *           description: スケジュールの説明
 *         scheduleType:
 *           type: string
 *           enum: [daily, weekly, monthly, custom]
 *           description: スケジュールタイプ
 *         cronExpression:
 *           type: string
 *           description: Cron式（カスタムスケジュール用）
 *         time:
 *           type: string
 *           description: 実行時刻（HH:MM形式）
 *         dayOfWeek:
 *           type: integer
 *           minimum: 0
 *           maximum: 6
 *           description: 曜日（0=日曜日）
 *         dayOfMonth:
 *           type: integer
 *           minimum: 1
 *           maximum: 31
 *           description: 実行日
 *         taskType:
 *           type: string
 *           enum: [rss_collection, labeling, summarization, categorization, batch_process]
 *           description: タスクタイプ
 *         taskConfig:
 *           type: object
 *           description: タスク設定
 *         isActive:
 *           type: boolean
 *           description: 有効フラグ
 *         lastRun:
 *           type: string
 *           format: date-time
 *           description: 最終実行時刻
 *         nextRun:
 *           type: string
 *           format: date-time
 *           description: 次回実行時刻
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 作成日時
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新日時
 *
 *     ScheduleExecution:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: 実行ID
 *         scheduleId:
 *           type: string
 *           description: スケジュールID
 *         status:
 *           type: string
 *           enum: [pending, running, completed, failed]
 *           description: 実行状態
 *         startedAt:
 *           type: string
 *           format: date-time
 *           description: 開始時刻
 *         completedAt:
 *           type: string
 *           format: date-time
 *           description: 完了時刻
 *         result:
 *           type: object
 *           description: 実行結果
 *         errorMessage:
 *           type: string
 *           description: エラーメッセージ
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 作成日時
 */

/**
 * @swagger
 * /api/schedules:
 *   get:
 *     summary: スケジュール一覧取得
 *     tags: [Schedules]
 *     responses:
 *       200:
 *         description: スケジュール一覧
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Schedule'
 *   post:
 *     summary: 新規スケジュール作成
 *     tags: [Schedules]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Schedule'
 *     responses:
 *       201:
 *         description: 作成されたスケジュール
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Schedule'
 */
router.get("/", getSchedules as RequestHandler);
router.post("/", createSchedule as RequestHandler);

/**
 * @swagger
 * /api/schedules/{id}:
 *   get:
 *     summary: スケジュール詳細取得
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: スケジュールID
 *     responses:
 *       200:
 *         description: スケジュール詳細
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Schedule'
 *       404:
 *         description: スケジュールが見つかりません
 *   put:
 *     summary: スケジュール更新
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: スケジュールID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Schedule'
 *     responses:
 *       200:
 *         description: 更新されたスケジュール
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Schedule'
 *   delete:
 *     summary: スケジュール削除
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: スケジュールID
 *     responses:
 *       204:
 *         description: 削除完了
 */
router.get("/:id", getScheduleById as RequestHandler);
router.put("/:id", updateSchedule as RequestHandler);
router.delete("/:id", deleteSchedule as RequestHandler);

/**
 * @swagger
 * /api/schedules/{id}/activate:
 *   post:
 *     summary: スケジュール有効化
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: スケジュールID
 *     responses:
 *       200:
 *         description: 有効化完了
 */
router.post("/:id/activate", activateSchedule as RequestHandler);

/**
 * @swagger
 * /api/schedules/{id}/deactivate:
 *   post:
 *     summary: スケジュール無効化
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: スケジュールID
 *     responses:
 *       200:
 *         description: 無効化完了
 */
router.post("/:id/deactivate", deactivateSchedule as RequestHandler);

/**
 * @swagger
 * /api/schedules/{id}/execute:
 *   post:
 *     summary: スケジュール即時実行
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: スケジュールID
 *     responses:
 *       200:
 *         description: 実行開始
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ScheduleExecution'
 */
router.post("/:id/execute", executeScheduleNow as RequestHandler);

/**
 * @swagger
 * /api/schedules/{id}/executions:
 *   get:
 *     summary: スケジュール実行履歴取得
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: スケジュールID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 取得件数制限
 *     responses:
 *       200:
 *         description: 実行履歴
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ScheduleExecution'
 */
router.get("/:id/executions", getScheduleExecutions as RequestHandler);

/**
 * @swagger
 * /api/schedules/{id}/executions/latest:
 *   get:
 *     summary: 最新実行取得
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: スケジュールID
 *     responses:
 *       200:
 *         description: 最新実行
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ScheduleExecution'
 *       404:
 *         description: 実行履歴が見つかりません
 */
router.get("/:id/executions/latest", getLatestExecution as RequestHandler);

export default router;