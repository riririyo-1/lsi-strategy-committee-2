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

## コマンド

```bash
# 各サービスをバックグラウンドで起動
docker compose up --build -d db
docker compose up --build -d server
docker compose up --build -d frontend
docker compose up --build -d pipeline
```

## 使いたいライブラリ

- [ ] [three.js](https://threejs.org/): 3D グラフィックスライブラリ
- [ ] [View Transitions API](https://developer.mozilla.org/ja/docs/Web/API/View_Transitions_API): ページ遷移のアニメーションを実現

## 追加したいものしたいもの

- [ ] メンバー紹介欄の作成
- [ ] ファブのキャパシティ推測などの統計
- [ ] ログの収集

---
