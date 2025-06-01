FROM node:18-alpine

# アプリケーションディレクトリの作成
WORKDIR /app

# 依存関係ファイルのコピー
COPY package.json package-lock.json* ./

# 依存関係のインストール
RUN npm ci --legacy-peer-deps

# アプリケーションのソースコードをコピー
COPY . .

# Next.js開発サーバーのポートを公開
EXPOSE 3000

# 開発サーバーの起動コマンド
CMD ["npm", "run", "dev"]
