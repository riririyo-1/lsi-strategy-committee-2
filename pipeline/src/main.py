from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from contextlib import asynccontextmanager

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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
