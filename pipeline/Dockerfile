FROM python:3.11-slim

WORKDIR /app

# システムパッケージをインストール
RUN apt-get update && apt-get install -y \
    python3-distutils \
    && rm -rf /var/lib/apt/lists/*

# 依存関係をインストール
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーションコードをコピー
COPY . .

# ワーキングディレクトリをsrcに設定
WORKDIR /app/src

EXPOSE 8000

# 新しいmain.pyを起動
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]