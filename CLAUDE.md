# LSI 戦略コミッティ システム - Claude Code ガイド

## 🎯 プロジェクト概要

半導体・LSI 技術の最新動向を収集・分析し、戦略的な情報配信を行うプラットフォームを提供します。

### 主要機能

- **動向調査(Research)**: 半導体技術に関する講演・調査レポートの管理・配信
- **TOPICS 配信**: 自動収集した記事の分析・カテゴリ分類によるトピックス配信
- **分析機能**: アクセス解析とデータ可視化
- **管理機能**: 記事・トピックス・research の管理
- **多言語対応**: 日本語・英語サポート

## 🏗️ システム構成

### アーキテクチャ

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Frontend     │    │     Server      │    │    Pipeline     │
│   (Next.js)     │◄──►│  (Express.js)   │◄──►│   (FastAPI)     │
│   Port: 3100    │    │   Port: 4100    │    │   Port: 8100    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Database      │
                       │  (PostgreSQL)   │
                       │   Port: 5434    │
                       └─────────────────┘
```

### 技術スタック

#### Frontend (Next.js 15 + TypeScript)

- **フレームワーク**: Next.js 15.1.8 (App Router)
- **UI/スタイリング**: Tailwind CSS, Lucide React Icons
- **3D/グラフィック**: Three.js (@react-three/fiber, @react-three/drei)
- **状態管理**: React Hooks
- **多言語化**: next-intl
- **テーマ**: next-themes (ダークモード対応)
- **HTTP 通信**: Axios

#### Backend Server (Express.js + TypeScript)

- **フレームワーク**: Express.js 5.1.0
- **ORM**: Prisma 6.8.2
- **データベース**: PostgreSQL
- **バリデーション**: express-validator
- **API 文書**: Swagger (swagger-jsdoc, swagger-ui-express)
- **CORS 対応**: cors

#### Pipeline (FastAPI + Python)

- **フレームワーク**: FastAPI 0.110.2
- **Web サーバー**: Uvicorn
- **HTTP 通信**: httpx, aiohttp, requests
- **RSS 解析**: feedparser
- **HTML 解析**: BeautifulSoup4
- **AI/LLM**: OpenAI API
- **設定管理**: PyYAML, python-dotenv
- **データ処理**: python-dateutil
- **テンプレート**: Jinja2

#### Infrastructure

- **コンテナ化**: Docker + Docker Compose
- **データベース**: PostgreSQL 15-alpine
- **開発環境**: TypeScript, ESLint, Prettier

## 📁 プロジェクト構造

クリーンアーキテクチャを意識したフォルダ構成を採用すること。

```
lsi-strategy-committee-2/
├── docker-compose.yml          # Docker構成
├── README.md                   # セットアップガイド
├── CLAUDE.md                   # このファイル
├── docs/                       # ドキュメント
│   ├── API設計.md
│   ├── DB設計.md
│   ├── サイトマップ.md
│   └── フォルダ構成.md
├── frontend/                   # Next.js フロントエンド
│   ├── src/
│   │   ├── app/               # App Router
│   │   │   ├── layout.tsx     # 共通レイアウト
│   │   │   ├── page.tsx       # ホームページ
│   │   │   ├── research/      # 動向調査
│   │   │   ├── topics/        # TOPICS配信
│   │   │   ├── analysis/      # 分析
│   │   │   ├── contact/       # お問い合わせ
│   │   │   ├── admin/         # 管理画面
│   │   │   └── api/           # API Routes
│   │   ├── components/        # 共通コンポーネント
│   │   ├── features/          # 機能別コンポーネント
│   │   ├── lib/               # ユーティリティ
│   │   │   └── apiClient.ts   # API通信クライアント
│   │   └── types/             # TypeScript型定義
│   ├── public/                # 静的ファイル
│   └── package.json
├── server/                     # Express.js バックエンド
│   ├── src/
│   │   └── index.ts           # サーバーエントリーポイント
│   ├── prisma/
│   │   ├── schema.prisma      # データベーススキーマ
│   │   ├── seed.ts            # 初期データ
│   │   └── migrations/        # マイグレーション
│   └── package.json
└── pipeline/                   # FastAPI パイプライン
    ├── src/
    │   ├── main.py            # FastAPIエントリーポイント
    │   ├── rss_feeds.yaml     # RSS設定
    │   ├── adapters/          # 外部システム接続
    │   ├── entities/          # データモデル
    │   ├── routers/           # APIルーター
    │   └── services/          # ビジネスロジック
    └── requirements.txt
```

## 🚀 開発環境セットアップ

### 前提条件

- Docker & Docker Compose
- Node.js 18+ (フロントエンド/サーバー開発用)
- Python 3.9+ (パイプライン開発用)

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd lsi-strategy-committee-2
```

### 2. 依存関係のインストール

#### フロントエンド

```bash
cd frontend
npm install
# バージョン競合がある場合
npm install --legacy-peer-deps
```

#### サーバー

```bash
cd ../server
npm install
```

#### パイプライン

```bash
cd ../pipeline
pip install -r requirements.txt
```

### 3. Docker 環境の起動

```bash
cd ..
docker-compose up --build
```

### アクセス URL

- **フロントエンド**: http://localhost:3100
- **サーバー API**: http://localhost:4100
- **パイプライン API**: http://localhost:8100
- **データベース**: localhost:5434

## 🔧 開発ワークフロー

### 日常的な開発コマンド

#### フロントエンド開発

```bash
cd frontend
npm run dev          # 開発サーバー起動
npm run build        # プロダクションビルド
npm run lint         # ESLintチェック
```

#### サーバー開発

```bash
cd server
npm run dev          # 開発サーバー起動（ts-node）
npm run watch        # ファイル監視モード
npm run build        # TypeScriptビルド
```

#### パイプライン開発

```bash
cd pipeline
# FastAPI開発サーバー
uvicorn src.main:app --reload --port 8000
```

### データベース操作

#### Prisma コマンド

```bash
cd server
npx prisma generate     # クライアント生成
npx prisma db push      # スキーマをDBに反映
npx prisma migrate dev  # マイグレーション作成・実行
npx prisma studio       # Prisma Studio起動
npx prisma db seed      # シードデータ投入
```

## 📡 API 設計

### Server API (Express.js - Port 4100)

- **記事管理**: `/api/articles/*`
- **動向調査**: `/api/research/*`
- **TOPICS**: `/api/topics/*`
- **カテゴリ**: `/api/categories/*`
- **ヘルスチェック**: `/api/health`

### Pipeline API (FastAPI - Port 8100)

- **記事収集**: `/api/crawl/*`
- **要約・分類**: `/api/summarize/*`
- **TOPICS 生成**: `/api/topics/*`
- **ヘルスチェック**: `/health`

### API Client 使用例

```typescript
import { articlesApi, topicsApi, crawlApi } from "@/lib/apiClient";

// 記事一覧取得
const articles = await articlesApi.getAll();

// TOPICS生成
const topic = await topicsApi.create(data);

// RSS記事収集
const crawlResult = await crawlApi.crawl({
  start_date: "2025-01-01",
  end_date: "2025-01-31",
});
```

## 🗄️ データベース設計

### 主要テーブル

- **Research**: 動向調査レポート
- **Article**: 収集記事
- **Topic**: 生成された TOPICS
- **Category**: 記事カテゴリ
- **AgendaItem**: 調査アジェンダ

詳細は `docs/DB設計.md` を参照。

## 🔄 データフロー

### 記事収集・処理フロー

```
RSS Feed → Pipeline (収集) → Database (保存) →
Pipeline (要約・分類) → Database (更新) →
Pipeline (TOPICS生成) → Frontend (表示)
```

## 🚨 トラブルシューティング

### よくある問題

#### 1. Docker 起動エラー

```bash
# ポート競合の確認
docker-compose down
lsof -i :3100 -i :4100 -i :5434 -i :8100

# 完全リセット
docker-compose down -v
docker-compose up --build
```

#### 2. フロントエンド依存関係エラー

```bash
# peer依存関係の競合
npm install --legacy-peer-deps

# node_modules完全削除
rm -rf node_modules package-lock.json
npm install
```

#### 3. データベース接続エラー

```bash
# Prisma再生成
npx prisma generate
npx prisma db push
```

## 🔐 環境変数

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:4100
NEXT_PUBLIC_PIPELINE_URL=http://localhost:8100
```

### Server (.env)

```
DATABASE_URL=postgresql://semicon_topics:semiconpass@localhost:5434/semicon_topics
PORT=4000
```

### Pipeline (.env)

```
DATABASE_URL=postgresql://semicon_topics:semiconpass@localhost:5434/semicon_topics
OPENAI_API_KEY=your_openai_api_key
---

このプロジェクトは継続的に進化しています。質問や提案があれば、チームメンバーと共有してください。
```
