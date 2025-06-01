# メモ

## 1. リポジトリのクローン

```bash
git clone https://github.com/riririyo-1/lsi-strategy-committee
cd lsi-strategy-committee
```

## 2. セットアップ手順

1. 環境変数の設定

```bash
cp .env.example .env
```

2. Docker Compose を使用してコンテナを起動

```bash
docker compose up -d
```

これで以下のサービスが起動します:

- フロントエンド (Next.js): `http://localhost:3000`
- データベース (PostgreSQL): ポート 5434

3. データベースのセットアップ (初回のみ)

```bash
# Prismaマイグレーションの実行
docker compose exec frontend npx prisma migrate deploy

# シードデータの投入
docker compose exec frontend npx prisma db seed
```

4. アプリケーションへのアクセス

ブラウザで `http://localhost:3000` にアクセスすると、アプリケーションが表示されます。

## 3. ローカル環境での開発 (Docker 不使用)

### セットアップ手順

1. 依存パッケージのインストール

```bash
npm install --legacy-peer-deps
```

2. 環境変数の設定

```bash
cp .env.example .env
# .envファイルを編集し、DATABASE_URLなどの設定を変更
```

3. データベースの設定

```bash
# PostgreSQLが起動していることを確認
# データベース作成
createdb lsi_strategy

# Prismaマイグレーションの実行
npx prisma migrate deploy
# または開発環境用
npx prisma migrate dev

# Prismaクライアントの生成
npx prisma generate

# シードデータの投入
npx prisma db seed
```

4. 開発サーバーの起動

```bash
npm run dev
```

5. アプリケーションへのアクセス

ブラウザで `http://localhost:3000` にアクセスすると、アプリケーションが表示されます。

## 追加したいものしたいもの

- [ ] メンバー紹介欄の作成
- [ ] ファブのキャパシティ推測などの管理
- [ ] ログの収集

---
