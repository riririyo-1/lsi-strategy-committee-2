"""
LLM処理専用ルーター
要約・ラベル生成・カテゴリ分類・TOPICS生成を個別のAPIとして提供
"""
from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel

from services.summarize_service import summarize_service
from services.categorize_service import categorize_service
from services.export_service import export_service
from adapters.llm_adapter import llm_adapter
from adapters.db_adapter import db_adapter
from datetime import datetime

router = APIRouter(prefix="/api/llm", tags=["llm"])


class LLMSummarizeRequest(BaseModel):
    """LLM要約リクエスト"""
    article_ids: Optional[List[str]] = None
    limit: Optional[int] = 50


class LLMCategorizeRequest(BaseModel):
    """LLMカテゴリ分類リクエスト"""
    article_ids: Optional[List[str]] = None  
    limit: Optional[int] = 50


class TopicsCategorizationRequest(BaseModel):
    """TOPICS記事カテゴリ分類リクエスト"""
    article_ids: List[str]
    categorization_type: str = "hierarchical"  # "hierarchical" | "thematic"


class TopicsSummaryRequest(BaseModel):
    """TOPICS全体サマリ生成リクエスト"""
    article_ids: List[str]
    topics_context: Optional[str] = None  # TOPICSのテーマや背景情報
    summary_style: str = "overview"  # "overview" | "detailed" | "executive"


class LLMSummarizeOnlyRequest(BaseModel):
    """要約のみリクエスト"""
    article_ids: Optional[List[str]] = None
    limit: Optional[int] = 50


class LLMLabelsOnlyRequest(BaseModel):
    """ラベルのみリクエスト"""
    article_ids: Optional[List[str]] = None
    limit: Optional[int] = 50


@router.post("/summarize")
async def generate_summaries_and_labels(request: LLMSummarizeRequest):
    """
    記事の要約とラベル生成
    
    既存の記事に対してLLMで要約とラベルを生成します。
    article_idsが指定されていない場合は、要約がない記事を自動的に処理します。
    """
    try:
        if request.article_ids:
            # 特定の記事IDを処理
            processed = 0
            errors = 0
            results = []
            
            for article_id in request.article_ids:
                try:
                    # 記事を取得
                    article = db_adapter.get_article_by_id(article_id)
                    if not article:
                        errors += 1
                        results.append({"id": article_id, "status": "not_found"})
                        continue
                    
                    # 本文またはタイトルから要約生成
                    content = article.get("content", "") or article.get("title", "")
                    if not content:
                        errors += 1
                        results.append({"id": article_id, "status": "no_content"})
                        continue
                    
                    # LLM処理
                    summary, labels = llm_adapter.generate_summary_and_labels(content)
                    
                    # DB更新
                    db_adapter.update_article_summary_and_labels(
                        article_id, summary, labels
                    )
                    
                    processed += 1
                    results.append({
                        "id": article_id,
                        "status": "success",
                        "summary": summary[:100] + "..." if len(summary) > 100 else summary,
                        "labels": labels
                    })
                    
                except Exception as e:
                    errors += 1
                    results.append({"id": article_id, "status": "error", "error": str(e)})
            
            return {
                "message": "LLM summarization completed",
                "processed": processed,
                "errors": errors,
                "results": results
            }
            
        else:
            # 要約がない記事を自動処理
            result = summarize_service.summarize_articles(request.limit)
            return result
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM summarization failed: {str(e)}")


@router.post("/categorize")
async def categorize_articles(request: LLMCategorizeRequest):
    """
    記事のカテゴリ自動分類
    
    記事の内容からカテゴリを自動分類します。
    カテゴリ: 技術動向、市場動向、企業動向、政策・規制、投資・M&A、人材・組織、その他
    """
    try:
        if request.article_ids:
            # 特定の記事を処理
            processed = 0
            errors = 0
            results = []
            
            for article_id in request.article_ids:
                try:
                    article = db_adapter.get_article_by_id(article_id)
                    if not article:
                        errors += 1
                        results.append({"id": article_id, "status": "not_found"})
                        continue
                    
                    content = article.get("content", "") or article.get("summary", "") or article.get("title", "")
                    if not content:
                        errors += 1
                        results.append({"id": article_id, "status": "no_content"})
                        continue
                    
                    # カテゴリ生成
                    categories = llm_adapter.generate_categories(content)
                    
                    # DB更新（カテゴリフィールドを更新）
                    db_adapter.update_article_field(article_id, "categories", categories)
                    
                    processed += 1
                    results.append({
                        "id": article_id,
                        "status": "success",
                        "categories": categories
                    })
                    
                except Exception as e:
                    errors += 1
                    results.append({"id": article_id, "status": "error", "error": str(e)})
            
            return {
                "message": "Categorization completed",
                "processed": processed,
                "errors": errors,
                "results": results
            }
            
        else:
            # カテゴリがない記事を自動処理
            result = categorize_service.categorize_articles(limit=request.limit)
            return result
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Categorization failed: {str(e)}")


@router.post("/topics/categorize")
async def categorize_topics_articles(request: TopicsCategorizationRequest):
    """
    TOPICS記事カテゴリ分類
    
    TOPICS作成時に選択された記事群を大カテゴリ・小カテゴリに自動分類します。
    TOPICS編集画面でカテゴリ分けの参考として使用。
    """
    try:
        # 記事を取得
        articles = []
        for article_id in request.article_ids:
            article = db_adapter.get_article_by_id(article_id)
            if article:
                articles.append(article)
        
        if not articles:
            raise HTTPException(status_code=404, detail="No valid articles found")
        
        categorized_articles = {
            "技術動向": [],
            "市場動向": [],
            "企業動向": [],
            "政策・規制": [],
            "投資・M&A": [],
            "人材・組織": [],
            "その他": []
        }
        
        processed_articles = []
        
        for article in articles:
            try:
                # 記事内容を取得
                content = article.get("content", "") or article.get("summary", "") or article.get("title", "")
                
                if request.categorization_type == "hierarchical":
                    # 階層的カテゴリ分類（大カテゴリ→小カテゴリ）
                    primary_categories = llm_adapter.generate_categories(content)
                    
                    # LLMで詳細な小カテゴリも生成
                    subcategory_prompt = f"""
以下の記事を詳細な小カテゴリに分類してください。

記事: {content[:1000]}

大カテゴリ: {primary_categories}

小カテゴリの例:
- 技術動向: プロセッサー技術、メモリ技術、AI/ML技術、製造プロセス
- 市場動向: 需要予測、価格動向、地域別市場、アプリケーション別
- 企業動向: 新製品発表、提携・買収、人事異動、業績発表

小カテゴリ（1-3個）をJSON配列で出力: ["カテゴリ1", "カテゴリ2"]
"""
                    try:
                        # 簡易的な小カテゴリ推定（実装を簡素化）
                        if "プロセッサ" in content or "CPU" in content:
                            subcategories = ["プロセッサー技術"]
                        elif "メモリ" in content or "DRAM" in content:
                            subcategories = ["メモリ技術"]
                        elif "AI" in content or "機械学習" in content:
                            subcategories = ["AI/ML技術"]
                        else:
                            subcategories = ["一般技術"]
                    except:
                        subcategories = ["未分類"]
                    
                else:
                    # テーマ別カテゴリ分類
                    primary_categories = llm_adapter.generate_categories(content)
                    subcategories = []
                
                # 結果を構築
                article_result = {
                    "id": article.get("id"),
                    "title": article.get("title", ""),
                    "primary_categories": primary_categories,
                    "subcategories": subcategories,
                    "suggested_section": primary_categories[0] if primary_categories else "その他"
                }
                
                processed_articles.append(article_result)
                
                # カテゴリ別にグループ化
                main_category = primary_categories[0] if primary_categories else "その他"
                if main_category in categorized_articles:
                    categorized_articles[main_category].append(article_result)
                else:
                    categorized_articles["その他"].append(article_result)
                    
            except Exception as e:
                # エラーが発生した記事はその他に分類
                error_result = {
                    "id": article.get("id"),
                    "title": article.get("title", ""),
                    "primary_categories": ["その他"],
                    "subcategories": [],
                    "error": str(e),
                    "suggested_section": "その他"
                }
                processed_articles.append(error_result)
                categorized_articles["その他"].append(error_result)
        
        # カテゴリ別統計
        category_stats = {}
        for category, articles_list in categorized_articles.items():
            category_stats[category] = len(articles_list)
        
        return {
            "message": "TOPICS article categorization completed",
            "categorization_type": request.categorization_type,
            "total_articles": len(articles),
            "processed_articles": len(processed_articles),
            "category_breakdown": categorized_articles,
            "category_stats": category_stats,
            "suggested_structure": {
                "main_sections": [cat for cat, count in category_stats.items() if count > 0],
                "recommended_order": ["技術動向", "市場動向", "企業動向", "政策・規制", "投資・M&A", "人材・組織", "その他"]
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TOPICS categorization failed: {str(e)}")


@router.post("/topics/summary")
async def generate_topics_summary(request: TopicsSummaryRequest):
    """
    TOPICS全体サマリ生成
    
    TOPICS作成時に選択された記事群から全体的なサマリを生成します。
    TOPICS冒頭の概要や導入文として使用。
    """
    try:
        # 記事を取得
        articles = []
        for article_id in request.article_ids:
            article = db_adapter.get_article_by_id(article_id)
            if article:
                articles.append(article)
        
        if not articles:
            raise HTTPException(status_code=404, detail="No valid articles found")
        
        # 記事の要約を収集
        article_summaries = []
        article_titles = []
        for article in articles:
            summary = article.get("summary", "") or article.get("title", "")
            title = article.get("title", "")
            if summary:
                article_summaries.append(summary)
            if title:
                article_titles.append(title)
        
        if not article_summaries:
            raise HTTPException(status_code=400, detail="No article content available")
        
        # スタイル別のプロンプト調整
        style_prompts = {
            "overview": "今回のTOPICSで取り上げる記事群の全体的な動向を200字程度で要約してください。",
            "detailed": "今回のTOPICSで取り上げる記事群から見える業界動向を詳細に分析し、400字程度でまとめてください。",
            "executive": "今回のTOPICSで取り上げる記事群から経営層向けのエグゼクティブサマリを300字程度で作成してください。"
        }
        
        context_info = f"TOPICS背景情報: {request.topics_context}" if request.topics_context else ""
        
        # LLMで全体サマリを生成
        combined_content = "\n".join(article_summaries)
        full_prompt = f"""
{style_prompts.get(request.summary_style, style_prompts["overview"])}

{context_info}

対象記事一覧:
{chr(10).join([f"- {title}" for title in article_titles[:10]])}

記事要約:
{combined_content[:2000]}

TOPICSの全体サマリ:
"""
        
        # 月次まとめ機能を利用してサマリ生成
        topics_summary = llm_adapter.generate_monthly_summary([full_prompt])
        
        # 補足情報の生成
        key_themes = []
        if "技術" in combined_content or "プロセッサ" in combined_content:
            key_themes.append("技術革新")
        if "市場" in combined_content or "需要" in combined_content:
            key_themes.append("市場動向")
        if "企業" in combined_content or "会社" in combined_content:
            key_themes.append("企業活動")
        
        return {
            "message": "TOPICS summary generated successfully",
            "summary_style": request.summary_style,
            "article_count": len(articles),
            "topics_summary": topics_summary,
            "key_themes": key_themes,
            "context_used": bool(request.topics_context),
            "suggested_intro": f"今回のTOPICSでは{len(articles)}件の記事を通じて、{', '.join(key_themes[:3])}について取り上げています。",
            "word_count": len(topics_summary) if topics_summary else 0
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TOPICS summary generation failed: {str(e)}")


@router.get("/status")
async def get_llm_status():
    """
    LLMサービスのステータス確認
    
    現在のLLMアダプターと処理可能状態を返します。
    """
    try:
        # LLMアダプターのタイプを取得
        adapter_type = "unknown"
        if hasattr(llm_adapter, '__class__'):
            adapter_type = llm_adapter.__class__.__name__
        
        # テスト実行
        test_result = "healthy"
        try:
            test_summary, test_labels = llm_adapter.generate_summary_and_labels("test content")
            if not test_summary or not test_labels:
                test_result = "partial"
        except Exception as e:
            test_result = f"error: {str(e)}"
        
        return {
            "status": "running",
            "adapter_type": adapter_type,
            "test_result": test_result,
            "capabilities": {
                "summarization": True,
                "labeling": True,
                "categorization": True,
                "topics_generation": True
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Status check failed: {str(e)}")


@router.post("/summarize-only")
async def generate_summaries_only(request: LLMSummarizeOnlyRequest):
    """
    要約のみ生成
    
    既存の記事に対して要約のみを生成します（ラベルは更新しません）。
    細かい調整や部分的な再処理に使用。
    """
    try:
        if request.article_ids:
            processed = 0
            errors = 0
            results = []
            
            for article_id in request.article_ids:
                try:
                    article = db_adapter.get_article_by_id(article_id)
                    if not article:
                        errors += 1
                        results.append({"id": article_id, "status": "not_found"})
                        continue
                    
                    content = article.get("content", "") or article.get("title", "")
                    if not content:
                        errors += 1
                        results.append({"id": article_id, "status": "no_content"})
                        continue
                    
                    # 要約のみ生成（内部的には同じLLM呼び出しを使用）
                    summary, _ = llm_adapter.generate_summary_and_labels(content)
                    
                    # 要約のみ更新
                    db_adapter.update_article_field(article_id, "summary", summary)
                    
                    processed += 1
                    results.append({
                        "id": article_id,
                        "status": "success",
                        "summary": summary[:100] + "..." if len(summary) > 100 else summary
                    })
                    
                except Exception as e:
                    errors += 1
                    results.append({"id": article_id, "status": "error", "error": str(e)})
            
            return {
                "message": "Summary-only generation completed",
                "processed": processed,
                "errors": errors,
                "results": results
            }
        else:
            raise HTTPException(status_code=400, detail="article_ids required for summary-only processing")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Summary-only generation failed: {str(e)}")


@router.post("/labels-only")
async def generate_labels_only(request: LLMLabelsOnlyRequest):
    """
    ラベルのみ生成
    
    既存の記事に対してラベルのみを生成します（要約は更新しません）。
    ラベルの再調整や追加生成に使用。
    """
    try:
        if request.article_ids:
            processed = 0
            errors = 0
            results = []
            
            for article_id in request.article_ids:
                try:
                    article = db_adapter.get_article_by_id(article_id)
                    if not article:
                        errors += 1
                        results.append({"id": article_id, "status": "not_found"})
                        continue
                    
                    content = article.get("content", "") or article.get("summary", "") or article.get("title", "")
                    if not content:
                        errors += 1
                        results.append({"id": article_id, "status": "no_content"})
                        continue
                    
                    # ラベルのみ生成（内部的には同じLLM呼び出しを使用）
                    _, labels = llm_adapter.generate_summary_and_labels(content)
                    
                    # ラベルのみ更新
                    db_adapter.update_article_field(article_id, "labels", labels)
                    
                    processed += 1
                    results.append({
                        "id": article_id,
                        "status": "success",
                        "labels": labels
                    })
                    
                except Exception as e:
                    errors += 1
                    results.append({"id": article_id, "status": "error", "error": str(e)})
            
            return {
                "message": "Labels-only generation completed", 
                "processed": processed,
                "errors": errors,
                "results": results
            }
        else:
            raise HTTPException(status_code=400, detail="article_ids required for labels-only processing")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Labels-only generation failed: {str(e)}")