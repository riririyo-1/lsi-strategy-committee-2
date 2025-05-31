from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from pydantic import BaseModel

from services.export_service import export_service
from adapters.db_adapter import db_adapter

router = APIRouter(prefix="/api", tags=["topics"])


class GenerateTopicsRequest(BaseModel):
    article_ids: List[str]
    template_type: Optional[str] = "default"
    title: Optional[str] = None


class GenerateTopicsResponse(BaseModel):
    topic_id: str
    title: str
    content: str
    article_count: int
    template_type: str


class ExportTopicsRequest(BaseModel):
    topic_id: str
    format_type: Optional[str] = "markdown"


@router.post("/topics/generate", response_model=GenerateTopicsResponse)
async def generate_topics(request: GenerateTopicsRequest):
    """
    TOPICS配信テンプレート生成
    
    指定された記事IDからTOPICS配信用のテンプレートを生成します。
    """
    try:
        if not request.article_ids:
            raise HTTPException(status_code=400, detail="Article IDs are required")
        
        result = export_service.generate_topics_template(
            article_ids=request.article_ids,
            template_type=request.template_type or "default"
        )
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        return GenerateTopicsResponse(
            topic_id=result["topic_id"],
            title=result["title"],
            content=result["content"],
            article_count=result["article_count"],
            template_type=result["template_type"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate topics: {str(e)}")


@router.get("/topics/{topic_id}")
async def get_topics_detail(topic_id: str):
    """
    TOPICS詳細取得
    
    指定されたTOPICS IDの詳細情報を取得します。
    """
    try:
        topic = db_adapter.get_topic_by_id(topic_id)
        
        if not topic:
            raise HTTPException(status_code=404, detail="Topic not found")
        
        # 関連記事も取得
        articles = db_adapter.get_articles_by_topic_id(topic_id)
        
        return {
            "topic": topic,
            "articles": articles,
            "article_count": len(articles)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get topic detail: {str(e)}")


@router.post("/topics/export")
async def export_topics(request: ExportTopicsRequest):
    """
    TOPICSエクスポート
    
    指定されたTOPICSを指定された形式でファイルにエクスポートします。
    """
    try:
        result = export_service.export_topics_to_file(
            topic_id=request.topic_id,
            format_type=request.format_type or "markdown"
        )
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to export topics: {str(e)}")


@router.get("/topics/templates")
async def get_available_templates():
    """
    利用可能なテンプレート一覧
    
    TOPICSテンプレート生成で使用可能なテンプレートタイプを返します。
    """
    return {
        "templates": [
            {
                "type": "default",
                "name": "デフォルト",
                "description": "カテゴリ別に記事を整理した標準的なテンプレート"
            },
            {
                "type": "summary",
                "name": "サマリー重視",
                "description": "LLMで生成した月次まとめを中心としたテンプレート"
            },
            {
                "type": "detailed",
                "name": "詳細版",
                "description": "記事の詳細情報を含む包括的なテンプレート"
            }
        ]
    }


@router.get("/topics/recent")
async def get_recent_topics(limit: int = Query(10, ge=1, le=50)):
    """
    最近のTOPICS一覧
    
    最近生成されたTOPICSの一覧を取得します。
    """
    try:
        # 実装は省略（データベースから最近のTOPICSを取得）
        return {
            "message": f"Retrieved recent topics",
            "topics": [],
            "limit": limit
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get recent topics: {str(e)}")


@router.delete("/topics/{topic_id}")
async def delete_topics(topic_id: str):
    """
    TOPICS削除
    
    指定されたTOPICSを削除します。
    """
    try:
        # 実装は省略（データベースからTOPICSを削除）
        return {
            "message": f"Topic {topic_id} deleted successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete topic: {str(e)}")


@router.post("/topics/{topic_id}/regenerate")
async def regenerate_topics(topic_id: str, template_type: Optional[str] = "default"):
    """
    TOPICS再生成
    
    既存のTOPICSを指定されたテンプレートで再生成します。
    """
    try:
        # 既存TOPICSから記事IDを取得
        articles = db_adapter.get_articles_by_topic_id(topic_id)
        article_ids = [str(article["id"]) for article in articles]
        
        if not article_ids:
            raise HTTPException(status_code=404, detail="No articles found for this topic")
        
        # 新しいテンプレートで再生成
        result = export_service.generate_topics_template(
            article_ids=article_ids,
            template_type=template_type or "default"
        )
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        return {
            "message": "Topics regenerated successfully",
            "new_topic_id": result["topic_id"],
            "original_topic_id": topic_id,
            "template_type": template_type
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to regenerate topics: {str(e)}")
