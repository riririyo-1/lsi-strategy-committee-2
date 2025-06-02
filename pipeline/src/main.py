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

# ルーターのインポート
from routers.crawl_router import router as crawl_router
from routers.summarize_router import router as summarize_router
from routers.topics_router import router as topics_router


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
            "topics": "/api/topics"
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
            {"path": "/api/crawl", "methods": ["POST"], "description": "RSS記事収集"},
            {"path": "/api/crawl/latest", "methods": ["GET"], "description": "最新記事取得"},
            {"path": "/api/summarize", "methods": ["POST"], "description": "記事要約・ラベル付け"},
            {"path": "/api/categorize", "methods": ["POST"], "description": "カテゴリ自動分類"},
            {"path": "/api/topics/generate", "methods": ["POST"], "description": "TOPICS生成"},
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
    
    # RSS URLマッピング（デモ用）
    rss_urls = {
        "ITmedia": "https://rss.itmedia.co.jp/rss/2.0/news_bursts.xml",
        "NHK": "https://www3.nhk.or.jp/rss/news/cat0.xml",
        "EE Times Japan": "https://eetimes.itmedia.co.jp/ee/rss/news.xml",
        "マイナビ": "https://news.mynavi.jp/rss"
    }
    
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
                batch_response = requests.post(
                    "http://server:4000/api/articles/batch_create",
                    json={"articles": collected_articles},
                    headers={"Content-Type": "application/json"},
                    timeout=30
                )
                
                if batch_response.status_code == 200:
                    batch_result = batch_response.json()
                    print(f"DB保存完了: inserted={batch_result['insertedCount']}, skipped={batch_result['skippedCount']}")
                    return batch_result
                else:
                    print(f"DB保存エラー: {batch_response.status_code} {batch_response.text}")
                    return {
                        "success": False,
                        "error": "データベース保存に失敗しました",
                        "insertedCount": 0,
                        "skippedCount": 0,
                        "invalidCount": len(collected_articles),
                        "invalidItems": collected_articles
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
        timeout = aiohttp.ClientTimeout(total=15)
        async with aiohttp.ClientSession(timeout=timeout) as session:
            async with session.get(rss_url) as response:
                if response.status != 200:
                    print(f"{source_name}: HTTP {response.status}")
                    return []
                rss_content = await response.text()
        
        feed = feedparser.parse(rss_content)
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
                    continue
                
                # 日付フィルタリング
                if start_dt <= published_dt <= end_dt:
                    article = {
                        "title": entry.title.strip() if hasattr(entry, 'title') else "タイトル不明",
                        "articleUrl": entry.link if hasattr(entry, 'link') else "",
                        "source": source_name,
                        "publishedAt": published_dt.isoformat(),
                        "summary": entry.get("summary", "")[:500],  # 500文字制限
                        "thumbnailUrl": extract_thumbnail(entry)
                    }
                    
                    # 必須フィールドチェック
                    if article["title"] and article["articleUrl"]:
                        articles.append(article)
            
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
