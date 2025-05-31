**DB 設計書**

```plaintext
データベース：PostgreSQL

テーブル一覧
-------------
1. articles
2. categories
3. topics
4. topics_articles (中間テーブル)
5. research
6. research_articles (中間テーブル)

───────────────────────────────────
5. research
───────────────────────────────────
- id             | UUID (PRIMARY KEY)
- title          | VARCHAR(255) NOT NULL
- summary        | TEXT         // レポートのサマリー
- publish_date   | DATE NOT NULL
- video_url      | TEXT         // 動画ファイルの保存場所または URL
- poster_url     | TEXT         // 動画ポスター画像
- pdf_url        | TEXT         // PDF リンク
- speaker        | VARCHAR(100) // 講演者名
- department     | VARCHAR(100) // 所属部署
- agenda         | TEXT[]       // アジェンダ（配列）
- content        | TEXT         // 任意でレポート本文
- view_count     | INTEGER DEFAULT 0
- last_updated   | TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()

───────────────────────────────────
6. research_articles (中間テーブル)
─────────────────────────────────── research_articles (中間テーブル)
───────────────────────────────────
- id             | UUID (PRIMARY KEY)
- research_id    | UUID REFERENCES research(id) ON DELETE CASCADE
- article_id     | UUID REFERENCES articles(id) ON DELETE CASCADE
- category_id    | UUID REFERENCES categories(id)  // 記事ごとのカテゴリ設定
- created_at     | TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()

【補足】
- 動向調査レポートに紐づく記事を管理
- research_id + article_id の複合 UNIQUE 制約を設定すると重複を防止できる
```

**ER 図（リレーション概要）**

```plaintext
articles 1───* topics_articles *───1 topics
                      │
                      └──1 categories

articles 1───* research_articles *───1 research
                         │
                         └──1 categories
```
