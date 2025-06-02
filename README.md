# lsi-strategy-committee-2

このプロジェクトは、LSI 戦略コミッティのためのアプリケーションです。以下の手順に従って、環境をセットアップしてください。

## セットアップ手順

1. **フロントエンドの依存関係をインストールします。**

   - `frontend`ディレクトリに移動し、以下のコマンドを実行します。
     ```
     cd frontend
     npm install
     ```

2. **サーバーの依存関係をインストールします。**

   - `server`ディレクトリに移動し、以下のコマンドを実行します。
     ```
     cd ../server
     npm install
     ```

3. **パイプラインの依存関係をインストールします。**

   - `pipeline`ディレクトリに移動し、以下のコマンドを実行します。
     ```
     cd ../pipeline
     pip install -r requirements.txt
     ```

4. **Docker コンテナをビルドして起動します。**
   - プロジェクトのルートディレクトリに戻り、以下のコマンドを実行します。
     ```
     cd ..
     docker-compose up --build
     ```

## バージョン違いがある場合

react のバージョンが異なる場合、以下の手順を実行してください。
（peer 依存関係の競合を無視してインストールします）

```
npm install XXX --legacy-peer-deps
```
