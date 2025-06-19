# Server API 一覧

## 記事管理 (Articles) - `/api/articles`

### 基本操作
- `GET /api/articles` - 記事一覧取得
  - パラメータ: page, limit, search
- `POST /api/articles` - 記事作成
- `DELETE /api/articles` - 複数記事削除
  - リクエスト: { ids: string[] }
- `GET /api/articles/:id` - 単一記事取得
- `DELETE /api/articles/:id` - 単一記事削除

### 特殊操作
- `GET /api/articles/labels` - 記事ラベル一覧取得
- `POST /api/articles/batch_create` - 記事バッチ作成
- `POST /api/articles/rss-collect` - RSS記事収集
  - リクエスト: { sources: { url: string, name: string }[] }

## カテゴリ管理 (Categories) - `/api/categories`

- `GET /api/categories` - カテゴリ一覧取得
- `POST /api/categories` - カテゴリ作成
- `PUT /api/categories/:id` - カテゴリ更新
- `DELETE /api/categories/:id` - カテゴリ削除

## トピック管理 (Topics) - `/api/topics`

### 基本操作
- `GET /api/topics` - トピック一覧取得
  - パラメータ: year, month, status
- `POST /api/topics` - トピック作成
- `GET /api/topics/:id` - 単一トピック取得
- `PUT /api/topics/:id` - トピック更新
- `DELETE /api/topics/:id` - トピック削除

### トピック関連操作
- `PATCH /api/topics/:id/article/:article_id/category` - 記事カテゴリ更新
- `POST /api/topics/:id/categorize` - LLM自動分類
- `POST /api/topics/:id/generate-summary` - 月次サマリ生成
- `POST /api/topics/:id/export` - HTMLテンプレート出力
  - リクエスト: { format?: "html" | "pdf" }

## 研究レポート (Research) - `/api/research`

- `GET /api/research` - 研究レポート一覧取得
  - パラメータ: status, author, page, limit
- `POST /api/research` - 研究レポート作成
- `GET /api/research/:id` - 単一研究レポート取得
- `PUT /api/research/:id` - 研究レポート更新
- `DELETE /api/research/:id` - 研究レポート削除

## スケジュール管理 (Schedules) - `/api/schedules`

### 基本操作
- `GET /api/schedules` - スケジュール一覧取得
- `POST /api/schedules` - 新規スケジュール作成
- `GET /api/schedules/:id` - スケジュール詳細取得
- `PUT /api/schedules/:id` - スケジュール更新
- `DELETE /api/schedules/:id` - スケジュール削除

### スケジュール制御
- `POST /api/schedules/:id/activate` - スケジュール有効化
- `POST /api/schedules/:id/deactivate` - スケジュール無効化
- `POST /api/schedules/:id/execute` - スケジュール即時実行

### 実行履歴
- `GET /api/schedules/:id/executions` - スケジュール実行履歴取得
  - パラメータ: limit (デフォルト: 10)
- `GET /api/schedules/:id/executions/latest` - 最新実行取得

## システム管理 (System) - `/api`

- `GET /api/health` - システムヘルスチェック
- `POST /api/crawl` - 記事収集バッチ実行
  - リクエスト: { sources?: { url: string, name: string }[], limit?: number }
- `POST /api/summarize` - 記事要約バッチ実行
  - リクエスト: { articleIds?: string[], batchSize?: number }

## データモデル

### Article
```typescript
{
  id: string
  title: string
  url: string
  description?: string
  content?: string
  summary?: string
  publishedAt?: Date
  sourceName?: string
  sourceUrl?: string
  labels?: string[]
  category?: string
  createdAt: Date
  updatedAt: Date
}
```

### Category
```typescript
{
  id: string
  name: string
  description?: string
  color?: string
  isDefault?: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Topic
```typescript
{
  id: string
  title: string
  description?: string
  year: number
  month: number
  status: "draft" | "published" | "archived"
  articles?: Article[]
  summary?: string
  createdAt: Date
  updatedAt: Date
}
```

### Research
```typescript
{
  id: string
  title: string
  content: string
  summary?: string
  status: "draft" | "published" | "archived"
  tags?: string[]
  author?: string
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
}
```

### Schedule
```typescript
{
  id: string
  name: string
  description?: string
  scheduleType: "daily" | "weekly" | "monthly" | "custom"
  cronExpression?: string
  time?: string // HH:MM形式
  dayOfWeek?: number // 0-6 (0=日曜日)
  dayOfMonth?: number // 1-31
  taskType: "rss_collection" | "labeling" | "summarization" | "categorization" | "batch_process"
  taskConfig: object
  isActive: boolean
  lastRun?: Date
  nextRun?: Date
  createdAt: Date
  updatedAt: Date
}
```

### ScheduleExecution
```typescript
{
  id: string
  scheduleId: string
  status: "pending" | "running" | "completed" | "failed"
  startedAt: Date
  completedAt?: Date
  result?: object
  errorMessage?: string
  createdAt: Date
}
```

## 注意事項

1. すべてのAPIエンドポイントは`/api`プレフィックスを持ちます
2. 認証・認可は現在実装されていません
3. エラーレスポンスは統一フォーマット: `{ error: string, message?: string }`
4. 日付はISO 8601形式で返されます
5. ページネーションは`page`と`limit`パラメータで制御されます