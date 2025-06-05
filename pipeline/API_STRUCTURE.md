# Pipeline API 構成

## フロントエンド用の個別API

フロントエンドから各機能を個別に呼び出すための API 構成です。

### 1. 記事収集API
**エンドポイント**: `POST /api/crawl`

```json
{
  "sources": ["EE Times Japan", "ITmedia"],
  "startDate": "2025-06-01",
  "endDate": "2025-06-04"
}
```

**機能**: 
- RSS フィード収集
- 記事本文スクレイピング
- タイトル・URL・日付・本文・出典の取得
- **LLM処理なし**（純粋なデータ収集のみ）

---

### 2. LLM処理API（3パターン提供）

#### 2-1. 要約＋ラベル同時生成 【推奨・効率重視】
**エンドポイント**: `POST /api/llm/summarize`

```json
{
  "article_ids": ["article_1", "article_2"],
  "limit": 50
}
```

**機能**:
- 1回のLLM呼び出しで要約とラベルを同時生成（コスト効率最良）
- 初回処理や一括処理に最適

#### 2-2. 要約のみ生成 【部分的再処理用】
**エンドポイント**: `POST /api/llm/summarize-only`

```json
{
  "article_ids": ["article_1", "article_2"]
}
```

**機能**:
- 要約のみ再生成（ラベルは維持）
- 要約結果の微調整時に使用

#### 2-3. ラベルのみ生成 【部分的再処理用】
**エンドポイント**: `POST /api/llm/labels-only`

```json
{
  "article_ids": ["article_1", "article_2"]
}
```

**機能**:
- ラベルのみ再生成（要約は維持）
- ラベル結果の微調整時に使用

---

### 3. カテゴリ分類API
**エンドポイント**: `POST /api/llm/categorize`

```json
{
  "article_ids": ["article_1", "article_2"],
  "limit": 50
}
```

**機能**:
- 既存記事をカテゴリに自動分類
- カテゴリ: 技術動向、市場動向、企業動向、政策・規制、投資・M&A、人材・組織、その他

---

### 4. TOPICS作成支援API（2つの支援ツール）

#### 4-1. 記事カテゴリ分類支援
**エンドポイント**: `POST /api/llm/topics/categorize`

```json
{
  "article_ids": ["article_1", "article_2", "article_3"],
  "categorization_type": "hierarchical"
}
```

**機能**:
- TOPICS選択記事を大カテゴリ・小カテゴリに自動分類
- 階層的分類（技術動向→プロセッサー技術など）
- TOPICS構成の提案
- **用途**: TOPICS編集中のカテゴリ分け作業支援

#### 4-2. TOPICS全体サマリ生成
**エンドポイント**: `POST /api/llm/topics/summary`

```json
{
  "article_ids": ["article_1", "article_2", "article_3"],
  "topics_context": "今月の業界動向まとめ",
  "summary_style": "overview"
}
```

**機能**:
- TOPICS選択記事群から全体サマリ生成
- 3つのスタイル（overview/detailed/executive）
- TOPICS冒頭文・導入文として使用
- **用途**: TOPICS作成中の概要文章生成支援

---

## フロントエンドUI構成イメージ

### 管理画面での操作フロー

1. **記事収集ボタン**
   - RSS収集期間設定
   - `/api/crawl` を呼び出し
   - 結果: 記事一覧表示（要約・ラベルなし）

2. **LLM要約・ラベル付与ボタン**
   - 記事選択（チェックボックス）
   - `/api/llm/summarize` を呼び出し
   - 結果: 要約とラベルが記事に追加

3. **カテゴリ分類ボタン**
   - 記事選択（チェックボックス）
   - `/api/llm/categorize` を呼び出し
   - 結果: カテゴリが記事に割り当て

4. **TOPICS作成支援ボタン（2つの支援機能）**
   - **[カテゴリ分類支援]** ← TOPICS編集中
     - 記事選択（複数）
     - `/api/llm/topics/categorize` を呼び出し
     - 結果: 大カテゴリ・小カテゴリ分類提案
   
   - **[全体サマリ生成]** ← TOPICS編集中
     - 記事選択（複数）
     - サマリスタイル選択
     - `/api/llm/topics/summary` を呼び出し
     - 結果: TOPICS冒頭文・導入文生成

---

## API ステータス確認
**エンドポイント**: `GET /api/llm/status`

LLMサービスの動作確認とアダプター情報を取得

---

## 処理の流れ

```
1. ユーザーが記事収集実行
   ↓
2. Pipeline: RSS + スクレイピング実行
   ↓
3. Server: 記事をDBに保存
   ↓
4. ユーザーが記事一覧を確認
   ↓
5. ユーザーが要約・ラベル付与実行（選択記事）
   ↓
6. Pipeline: LLM処理実行
   ↓
7. Server: 要約・ラベルをDBに更新
   ↓
8. ユーザーがカテゴリ分類実行（選択記事）
   ↓
9. Pipeline: LLMカテゴリ分類実行
   ↓
10. Server: カテゴリをDBに更新
    ↓
11. ユーザーがTOPICS作成開始（フロントエンド）
    ↓
12. ユーザーがカテゴリ分類支援実行（選択記事群）
    ↓
13. Pipeline: LLM記事分類処理
    ↓
14. フロントエンド: カテゴリ分類結果を参考にTOPICS構成
    ↓
15. ユーザーが全体サマリ生成実行（選択記事群）
    ↓
16. Pipeline: LLM全体サマリ生成
    ↓
17. フロントエンド: サマリを参考にTOPICS導入文作成
    ↓
18. Server: 完成したTOPICS配信データ保存
```

各ステップが独立したAPIになっているため、フロントエンドから柔軟に操作可能です。