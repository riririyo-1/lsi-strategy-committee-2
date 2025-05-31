**API 設計（OpenAPI 互換）**

```yaml
openapi: 3.1.0
info:
  title: LSI戦略コミッティ API
  version: 1.0.0
  description: |
    LSI戦略コミッティ のバックエンドAPI仕様
servers:
  - url: http://localhost:3001

paths:
  /api/health:
    get:
      tags: [System]
      summary: サーバーヘルスチェック
      responses:
        "200":
          description: OK

  /api/articles:
    get:
      tags: [Articles]
      summary: 記事一覧取得
      responses:
        "200":
          description: 記事配列を返す
    delete:
      tags: [Articles]
      summary: 複数記事を削除
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                ids:
                  type: array
                  items:
                    type: string
      responses:
        "204":
          description: 削除成功

  /api/articles/{id}:
    get:
      tags: [Articles]
      summary: 単一記事取得
      parameters:
        - in: path
          name: id
          required: true
          schema: { type: string }
      responses:
        "200":
          description: 記事オブジェクトを返す
        "404":
          description: 存在しない
    delete:
      tags: [Articles]
      summary: 単一記事削除
      parameters:
        - in: path
          name: id
          required: true
          schema: { type: string }
      responses:
        "204":
          description: 削除成功

  /api/articles/labels:
    get:
      tags: [Articles]
      summary: すべてのラベル取得
      responses:
        "200":
          description: ラベル配列を返す

  /api/summarize:
    post:
      tags: [Batch]
      summary: 記事要約・ラベル付けバッチ実行
      responses:
        "200":
          description: 実行結果

  /api/crawl:
    post:
      tags: [Batch]
      summary: 記事収集バッチ実行
      responses:
        "200":
          description: 実行結果

  /api/categories:
    get:
      tags: [Categories]
      summary: カテゴリ一覧取得
      responses:
        "200":
          description: カテゴリ配列を返す
    post:
      tags: [Categories]
      summary: 新規カテゴリ作成
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
      responses:
        "201":
          description: 作成成功

  /api/categories/{id}:
    put:
      tags: [Categories]
      summary: カテゴリ更新
      parameters:
        - in: path
          name: id
          required: true
          schema: { type: string }
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
      responses:
        "200":
          description: 更新成功
        "404":
          description: 存在しない
    delete:
      tags: [Categories]
      summary: カテゴリ削除
      parameters:
        - in: path
          name: id
          required: true
          schema: { type: string }
      responses:
        "204":
          description: 削除成功

  /api/topics:
    get:
      tags: [Topics]
      summary: TOPICS一覧取得
      responses:
        "200":
          description: TOPICS配列を返す
    post:
      tags: [Topics]
      summary: 新規TOPICS作成
      requestBody:
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/TopicsCreate"
      responses:
        "201":
          description: 作成成功

  /api/topics/{id}:
    get:
      tags: [Topics]
      summary: 単一TOPICS取得
      parameters:
        - in: path
          name: id
          required: true
          schema: { type: string }
```
