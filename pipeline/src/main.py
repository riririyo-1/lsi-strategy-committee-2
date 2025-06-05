from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from contextlib import asynccontextmanager
from pydantic import BaseModel
from typing import List, Optional
import asyncio
import aiohttp
import feedparser
from datetime import datetime, timedelta
import requests
import yaml
from pathlib import Path

# ルーターのインポート
from routers.crawl_router import router as crawl_router
from routers.summarize_router import router as summarize_router
from routers.topics_router import router as topics_router
from routers.llm_router import router as llm_router

# サービスのインポート
from services.scraping_service import scraping_service
from adapters.llm_adapter import llm_adapter


@asynccontextmanager
async def lifespan(app: FastAPI):
    """アプリケーションのライフサイクル管理"""
    # 起動時の処理
    print("[INFO] Pipeline API starting up...")
    
    # Ollamaモデルの自動プル（オプション）
    try:
        from adapters.llm_adapter import llm_adapter
        if hasattr(llm_adapter, 'model') and 'ollama' in str(type(llm_adapter)):
            print("[INFO] Checking Ollama model availability...")
            # モデルの確認処理（実装は省略）
    except Exception as e:
        print(f"[WARN] Ollama model check failed: {e}")
    
    # 環境変数の確認
    required_env_vars = ["POSTGRES_HOST", "POSTGRES_DB", "POSTGRES_USER", "POSTGRES_PASSWORD"]
    missing_vars = [var for var in required_env_vars if not os.environ.get(var)]
    if missing_vars:
        print(f"[WARN] Missing environment variables: {missing_vars}")
    
    print("[INFO] Pipeline API startup completed")
    
    yield
    
    # 終了時の処理
    print("[INFO] Pipeline API shutting down...")


# FastAPIアプリケーションの作成
app = FastAPI(
    title="LSI戦略コミッティ Pipeline API",
    description="""
    半導体業界のRSS記事収集・要約・TOPICS配信生成を行うパイプラインAPI
    
    ## 主な機能
    
    - **記事収集**: RSS フィードから記事を自動収集
    - **要約・ラベリング**: LLM を使用した記事の要約と自動ラベル付け
    - **カテゴリ分類**: 記事内容に基づく自動カテゴリ分類
    - **TOPICS生成**: 記事群から配信用テンプレートを生成
    
    ## エンドポイント
    
    - `/api/crawl`: RSS記事収集関連
    - `/api/summarize`: 記事要約・分類関連  
    - `/api/topics`: TOPICS配信生成関連
    """,
    version="2.0.0",
    lifespan=lifespan
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 本番環境では適切に制限する
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーターの登録
app.include_router(crawl_router)
app.include_router(summarize_router)
app.include_router(topics_router)
app.include_router(llm_router)


@app.get("/")
async def root():
    """ルートエンドポイント"""
    return {
        "message": "LSI戦略コミッティ Pipeline API",
        "version": "2.0.0",
        "status": "running",
        "docs": "/docs",
        "endpoints": {
            "crawl": "/api/crawl",
            "summarize": "/api/summarize", 
            "topics": "/api/topics",
            "llm": "/api/llm"
        }
    }


@app.get("/health")
async def health_check():
    """ヘルスチェックエンドポイント"""
    try:
        # データベース接続確認
        from adapters.db_adapter import db_adapter
        with db_adapter.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1")
                db_status = "healthy"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    # LLM接続確認
    try:
        from adapters.llm_adapter import llm_adapter
        # 簡単なテストクエリ
        llm_adapter.generate_summary_and_labels("test")
        llm_status = "healthy"
    except Exception as e:
        llm_status = f"error: {str(e)}"
    
    return {
        "status": "healthy",
        "database": db_status,
        "llm": llm_status,
        "environment": {
            "postgres_host": os.environ.get("POSTGRES_HOST", "not set"),
            "llm_adapter": os.environ.get("LLM_ADAPTER", "openai")
        }
    }


@app.get("/api/status")
async def api_status():
    """API ステータス情報"""
    return {
        "api_version": "2.0.0",
        "available_endpoints": [
            {"path": "/api/crawl", "methods": ["POST"], "description": "RSS記事収集（本文取得のみ）"},
            {"path": "/api/crawl/latest", "methods": ["GET"], "description": "最新記事取得"},
            {"path": "/api/llm/summarize", "methods": ["POST"], "description": "LLM要約・ラベル付け"},
            {"path": "/api/llm/categorize", "methods": ["POST"], "description": "LLMカテゴリ自動分類"},
            {"path": "/api/llm/topics/categorize", "methods": ["POST"], "description": "TOPICS記事カテゴリ分類支援"},
            {"path": "/api/llm/topics/summary", "methods": ["POST"], "description": "TOPICS全体サマリ生成支援"},
            {"path": "/api/llm/status", "methods": ["GET"], "description": "LLMサービスステータス"},
            {"path": "/api/topics/{topic_id}", "methods": ["GET"], "description": "TOPICS詳細"},
        ],
        "template_types": ["default", "summary", "detailed"],
        "supported_formats": ["markdown", "html"]
    }


# RSS収集用のモデル
class RSSCollectRequest(BaseModel):
    sources: List[str]
    startDate: str
    endDate: str

class ArticleData(BaseModel):
    title: str
    articleUrl: str
    source: str
    publishedAt: str
    summary: Optional[str] = ""
    labels: Optional[List[str]] = []
    thumbnailUrl: Optional[str] = None

@app.post("/collect-rss")
async def collect_rss(request: RSSCollectRequest):
    """RSS収集エンドポイント - Express API経由でDB保存"""
    print(f"RSS収集開始: {request.sources}")
    
    # rss_feeds.yamlからURL情報を読み込み
    feeds_file = Path(__file__).parent / "rss_feeds.yaml"
    with open(feeds_file, 'r', encoding='utf-8') as f:
        feeds_config = yaml.safe_load(f)
    
    # ソース名とURLのマッピングを構築（新しい形式に対応）
    rss_urls = {}
    
    # 各フィードカテゴリから複数URLを取得
    for category, feeds in feeds_config.items():
        if category == "eetimes":
            # EE Times Japan
            for feed in feeds:
                rss_urls["EE Times Japan"] = feed["url"]
                break  # 最初の1つを使用
        elif category == "itmedia":
            # ITmedia
            for feed in feeds:
                rss_urls["ITmedia"] = feed["url"]
                break  # 最初の1つを使用
        elif category == "nhk":
            # NHK (複数フィードを統合)
            nhk_urls = [feed["url"] for feed in feeds]
            # 最初のNHKフィードをメインとして使用（複数フィード対応は後で実装）
            rss_urls["NHK"] = nhk_urls[0]
        elif category == "mynavi_techplus":
            # マイナビ（複数フィードを統合）
            mynavi_urls = [feed["url"] for feed in feeds]
            # 最初のマイナビフィードをメインとして使用（複数フィード対応は後で実装）
            rss_urls["マイナビ"] = mynavi_urls[0]
    
    print(f"RSS URLマッピング: {rss_urls}")
    
    collected_articles = []
    
    # 各ソースから並列収集
    tasks = []
    for source in request.sources:
        if source in rss_urls:
            task = collect_from_source(
                source, 
                rss_urls[source], 
                request.startDate, 
                request.endDate
            )
            tasks.append(task)
    
    # 並列実行
    try:
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        for result in results:
            if isinstance(result, list):
                collected_articles.extend(result)
            else:
                print(f"収集エラー: {result}")
        
        print(f"RSS収集完了: {len(collected_articles)}件")
        
        # Express APIのバッチ作成エンドポイントに送信
        if collected_articles:
            try:
                # 大量データの場合、小分けして送信（20件ずつ）
                batch_size = 20
                total_inserted = 0
                total_skipped = 0
                total_invalid = 0
                
                for i in range(0, len(collected_articles), batch_size):
                    batch_articles = collected_articles[i:i + batch_size]
                    print(f"バッチ送信 {i//batch_size + 1}/{(len(collected_articles) + batch_size - 1)//batch_size}: {len(batch_articles)}件")
                    
                    batch_response = requests.post(
                        "http://server:4000/api/articles/batch_create",
                        json={"articles": batch_articles},
                        headers={"Content-Type": "application/json"},
                        timeout=30
                    )
                    
                    if batch_response.status_code == 200:
                        batch_result = batch_response.json()
                        total_inserted += batch_result.get('insertedCount', 0)
                        total_skipped += batch_result.get('skippedCount', 0)
                        total_invalid += batch_result.get('invalidCount', 0)
                        print(f"  バッチ保存完了: inserted={batch_result.get('insertedCount', 0)}, skipped={batch_result.get('skippedCount', 0)}")
                    else:
                        print(f"  バッチ保存エラー: {batch_response.status_code} {batch_response.text[:200]}")
                        total_invalid += len(batch_articles)
                
                print(f"全バッチ処理完了: total_inserted={total_inserted}, total_skipped={total_skipped}, total_invalid={total_invalid}")
                return {
                    "success": True,
                    "insertedCount": total_inserted,
                    "skippedCount": total_skipped,
                    "invalidCount": total_invalid,
                    "invalidItems": []
                }
            except Exception as e:
                print(f"Express API呼び出しエラー: {e}")
                return {
                    "success": False,
                    "error": "サーバー通信エラー",
                    "insertedCount": 0,
                    "skippedCount": 0,
                    "invalidCount": len(collected_articles),
                    "invalidItems": []
                }
        else:
            return {
                "success": True,
                "insertedCount": 0,
                "skippedCount": 0,
                "invalidCount": 0,
                "invalidItems": []
            }
            
    except Exception as e:
        print(f"RSS収集処理エラー: {e}")
        raise HTTPException(status_code=500, detail=f"RSS収集処理に失敗しました: {str(e)}")

async def collect_from_source(source_name: str, rss_url: str, start_date: str, end_date: str):
    """単一ソースからの記事収集"""
    try:
        print(f"{source_name}: RSS取得開始 - {rss_url}")
        timeout = aiohttp.ClientTimeout(total=15)
        async with aiohttp.ClientSession(timeout=timeout) as session:
            async with session.get(rss_url) as response:
                if response.status != 200:
                    print(f"{source_name}: HTTP {response.status}")
                    return []
                rss_content = await response.text()
        
        feed = feedparser.parse(rss_content)
        print(f"{source_name}: フィード解析完了 - {len(feed.entries)}件のエントリー")
        
        if not feed.entries:
            print(f"{source_name}: フィードが空です")
            return []
            
        articles = []
        
        try:
            start_dt = datetime.fromisoformat(start_date)
            end_dt = datetime.fromisoformat(end_date) + timedelta(days=1)  # 終了日を含める
        except ValueError:
            print(f"日付形式エラー: {start_date}, {end_date}")
            return []
        
        print(f"{source_name}: 日付範囲 {start_dt} 〜 {end_dt}")
        
        # デバッグ用：最初の5件の記事情報を表示
        for i, entry in enumerate(feed.entries[:5]):
            print(f"{source_name} エントリー{i+1}: {getattr(entry, 'title', 'タイトルなし')}")
            if hasattr(entry, 'published'):
                print(f"  公開日: {entry.published}")
        
        for entry in feed.entries:
            try:
                # 日付解析（複数形式に対応）
                published_dt = None
                if hasattr(entry, 'published_parsed') and entry.published_parsed:
                    published_dt = datetime(*entry.published_parsed[:6])
                elif hasattr(entry, 'published'):
                    try:
                        published_dt = datetime.fromisoformat(entry.published.replace('Z', '+00:00'))
                    except:
                        # 他の日付形式も試行
                        from dateutil import parser
                        published_dt = parser.parse(entry.published)
                
                if not published_dt:
                    print(f"  警告: 日付解析失敗 - {getattr(entry, 'title', 'タイトルなし')[:50]}")
                    # 日付が解析できない場合は現在日時を使用
                    published_dt = datetime.now()
                
                # 日付フィルタリング（デバッグ情報付き）
                if start_dt <= published_dt <= end_dt:
                    print(f"  ✓ 日付範囲内: {published_dt} - {getattr(entry, 'title', 'タイトルなし')[:50]}")
                else:
                    # デバッグ用：日付範囲外の記事も最初の3件は表示
                    if len(articles) < 3:
                        print(f"  ✗ 日付範囲外: {published_dt} - {getattr(entry, 'title', 'タイトルなし')[:50]}")
                
                # 日付フィルタリング（元に戻す）
                if start_dt <= published_dt <= end_dt:
                    article_url = entry.link if hasattr(entry, 'link') else ""
                    article_title = entry.title.strip() if hasattr(entry, 'title') else "タイトル不明"
                    
                    # 記事本文とOGP画像をスクレイピング
                    article_content = ""
                    og_image = extract_thumbnail(entry)  # RSSから取得できない場合の初期値
                    
                    if article_url:
                        try:
                            print(f"  記事スクレイピング開始: {article_title[:50]}")
                            content, scraped_image = await scraping_service.fetch_article_content(article_url)
                            if content:
                                article_content = content
                                print(f"  ✓ 本文取得成功: {len(article_content)}文字")
                            if scraped_image:
                                og_image = scraped_image
                                print(f"  ✓ 画像取得成功: {scraped_image[:50]}...")
                        except Exception as scrape_error:
                            print(f"  ✗ スクレイピング失敗: {scrape_error}")
                    
                    # RSS収集時はLLM処理をスキップ（別APIで実行）
                    summary = entry.get("summary", "")[:500] if hasattr(entry, "summary") else ""
                    
                    article = {
                        "title": article_title,
                        "articleUrl": article_url,
                        "source": source_name,
                        "publishedAt": published_dt.isoformat(),
                        "summary": summary,  # RSS要約のみ
                        "labels": [],  # 空配列（LLM処理は別途）
                        "thumbnailUrl": og_image,
                        "content": article_content  # 本文を保存
                    }
                    
                    # 必須フィールドチェック
                    if article["title"] and article["articleUrl"]:
                        articles.append(article)
                        print(f"  ✓ 記事追加完了: {article_title[:50]}")
            
            except Exception as entry_error:
                print(f"{source_name}のエントリ処理エラー: {entry_error}")
                continue
        
        print(f"{source_name}から{len(articles)}件収集")
        return articles
        
    except Exception as e:
        print(f"{source_name}の収集でエラー: {e}")
        return []

def extract_thumbnail(entry):
    """エントリからサムネイル画像を抽出"""
    try:
        # media:content チェック
        if hasattr(entry, 'media_content'):
            for media in entry.media_content:
                if media.get('type', '').startswith('image/'):
                    return media.get('url')
        
        # enclosure チェック
        if hasattr(entry, 'enclosures'):
            for enclosure in entry.enclosures:
                if enclosure.get('type', '').startswith('image/'):
                    return enclosure.get('href')
                    
        # summary内の画像タグをチェック
        if hasattr(entry, 'summary'):
            import re
            img_match = re.search(r'<img[^>]+src="([^"]+)"', entry.summary)
            if img_match:
                return img_match.group(1)
                
    except Exception:
        pass
    
    return None

# ...existing code...
