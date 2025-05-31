from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import date, datetime, timedelta
from pydantic import BaseModel

from services.crawl_service import crawl_service
from adapters.db_adapter import db_adapter

router = APIRouter(prefix="/api", tags=["crawl"])


class CrawlRequest(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    days: Optional[int] = 7


class CrawlResponse(BaseModel):
    message: str
    articles_found: int
    articles_saved: int
    articles_skipped: int
    start_date: str
    end_date: str


@router.post("/crawl", response_model=CrawlResponse)
async def crawl_articles(request: CrawlRequest):
    """
    RSS記事収集バッチ実行
    
    指定された期間のRSS記事を収集してデータベースに保存します。
    """
    try:
        # 期間の設定
        if request.start_date and request.end_date:
            start_date = request.start_date
            end_date = request.end_date
        else:
            days = request.days or 7
            end_date = date.today()
            start_date = end_date - timedelta(days=days)
        
        # RSS記事を収集
        articles = crawl_service.fetch_articles_from_period(start_date, end_date)
        
        if not articles:
            return CrawlResponse(
                message="No articles found for the specified period",
                articles_found=0,
                articles_saved=0,
                articles_skipped=0,
                start_date=str(start_date),
                end_date=str(end_date)
            )
        
        # データベースに保存
        save_result = db_adapter.save_articles(articles)
        
        return CrawlResponse(
            message="Crawl completed successfully",
            articles_found=len(articles),
            articles_saved=save_result["inserted"],
            articles_skipped=save_result["skipped"],
            start_date=str(start_date),
            end_date=str(end_date)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Crawl failed: {str(e)}")


@router.get("/crawl/latest")
async def get_latest_articles(limit: int = Query(10, ge=1, le=100)):
    """
    最新記事を取得
    
    データベースから最新の記事を指定件数取得します。
    """
    try:
        articles = db_adapter.get_latest_articles(limit)
        
        return {
            "message": f"Retrieved {len(articles)} latest articles",
            "articles": articles
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get latest articles: {str(e)}")


@router.post("/crawl/manual")
async def manual_crawl():
    """
    手動クロール実行

    記事を手動で収集します。
    """
    try:
        articles = crawl_service.fetch_latest_articles(days=7)
        save_result = db_adapter.save_articles(articles)
        
        return {
            "message": "Manual crawl completed",
            "articles_found": len(articles),
            "articles_saved": save_result["inserted"],
            "articles_skipped": save_result["skipped"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Manual crawl failed: {str(e)}")
