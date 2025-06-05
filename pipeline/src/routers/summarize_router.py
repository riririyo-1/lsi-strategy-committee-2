from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from pydantic import BaseModel

from services.summarize_service import summarize_service
from services.categorize_service import categorize_service

router = APIRouter(prefix="/api", tags=["summarize"])


class SummarizeRequest(BaseModel):
    article_ids: Optional[List[str]] = None
    limit: Optional[int] = 50
    include_labeling: Optional[bool] = True
    model_name: Optional[str] = "claude-3-haiku-20240307"


class SummarizeResponse(BaseModel):
    message: str
    processed: int
    errors: int
    total_found: Optional[int] = None


class CategorizeRequest(BaseModel):
    article_ids: Optional[List[str]] = None
    limit: Optional[int] = 50


@router.post("/summarize", response_model=SummarizeResponse)
async def summarize_articles(request: SummarizeRequest):
    """
    記事要約・ラベル付けバッチ実行
    
    要約されていない記事を自動的に要約し、関連するラベルを付けます。
    特定の記事IDが指定された場合は、それらの記事のみを処理します。
    """
    try:
        if request.article_ids:
            # 特定の記事を処理
            result = summarize_service.summarize_specific_articles(
                article_ids=request.article_ids,
                include_labeling=request.include_labeling,
                model_name=request.model_name
            )
        else:
            # 要約されていない記事を一括処理
            result = summarize_service.summarize_articles(
                limit=request.limit or 50,
                include_labeling=request.include_labeling,
                model_name=request.model_name
            )
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        return SummarizeResponse(
            message=result["message"],
            processed=result["processed"],
            errors=result.get("errors", 0),
            total_found=result.get("total_found")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Summarization failed: {str(e)}")


@router.post("/categorize")
async def categorize_articles(request: CategorizeRequest):
    """
    記事カテゴリ自動分類
    
    記事の内容に基づいて自動的にカテゴリを分類します。
    """
    try:
        result = categorize_service.categorize_articles(
            article_ids=request.article_ids,
            limit=request.limit or 50
        )
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Categorization failed: {str(e)}")


@router.get("/categories/stats")
async def get_category_statistics():
    """
    カテゴリ別統計情報を取得
    
    各カテゴリに属する記事数の統計を返します。
    """
    try:
        stats = categorize_service.get_category_statistics()
        
        if "error" in stats:
            raise HTTPException(status_code=500, detail=stats["error"])
        
        return stats
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get category statistics: {str(e)}")


@router.get("/categories/suggestions")
async def suggest_new_categories(min_frequency: int = Query(5, ge=1)):
    """
    新しいカテゴリの提案
    
    頻出するラベルから新しいカテゴリを提案します。
    """
    try:
        suggestions = categorize_service.suggest_new_categories(min_frequency)
        
        return {
            "message": f"Found {len(suggestions)} category suggestions",
            "suggestions": suggestions,
            "min_frequency": min_frequency
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to suggest categories: {str(e)}")


@router.post("/summarize/batch")
async def batch_process_articles(
    limit: int = Query(50, ge=1, le=200),
    include_categorization: bool = Query(True)
):
    """
    記事一括処理
    
    要約とカテゴリ分類を一括で実行します。
    """
    try:
        results = []
        
        # 要約処理
        summarize_result = summarize_service.summarize_articles(limit)
        results.append({
            "step": "summarization",
            "result": summarize_result
        })
        
        # カテゴリ分類処理（オプション）
        if include_categorization:
            categorize_result = categorize_service.categorize_articles(limit=limit)
            results.append({
                "step": "categorization", 
                "result": categorize_result
            })
        
        return {
            "message": "Batch processing completed",
            "steps": results
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch processing failed: {str(e)}")
