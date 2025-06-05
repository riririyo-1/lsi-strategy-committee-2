from typing import List, Dict, Any
from datetime import datetime

from entities.article import Article
from adapters.db_adapter import db_adapter
from adapters.llm_adapter import llm_adapter


class SummarizeService:
    """記事要約・ラベル付けサービス"""
    
    def __init__(self):
        self.db = db_adapter
        self.llm = llm_adapter
    
    def summarize_articles(self, limit: int = 50, include_labeling: bool = True, model_name: str = "claude-3-haiku-20240307") -> Dict[str, Any]:
        """要約されていない記事を処理"""
        try:
            # 要約されていない記事を取得
            articles = self.db.get_articles_without_summary(limit)
            
            if not articles:
                return {"message": "No articles to summarize", "processed": 0}
            
            processed = 0
            errors = 0
            
            for article in articles:
                try:
                    # 記事本文から要約とラベルを生成
                    content = article.get("content", "") or article.get("title", "")
                    if not content.strip():
                        continue
                    
                    summary, labels = self.llm.generate_summary_and_labels(content)
                    
                    # データベースを更新
                    self.db.update_article_summary_and_labels(
                        article["id"], 
                        summary, 
                        labels
                    )
                    
                    processed += 1
                    print(f"[INFO] Processed article: {article['title'][:50]}...")
                    
                except Exception as e:
                    print(f"[ERROR] Failed to process article {article.get('id')}: {e}")
                    errors += 1
            
            return {
                "message": f"Summarization completed",
                "processed": processed,
                "errors": errors,
                "total_found": len(articles)
            }
            
        except Exception as e:
            print(f"[ERROR] Summarize service error: {e}")
            return {"error": str(e), "processed": 0}
    
    def summarize_specific_articles(self, article_ids: List[str], include_labeling: bool = True, model_name: str = "claude-3-haiku-20240307") -> Dict[str, Any]:
        """特定の記事を要約処理"""
        processed = 0
        errors = 0
        
        for article_id in article_ids:
            try:
                # 記事詳細を取得
                article = self.db.get_article_by_id(article_id)
                if not article:
                    print(f"[WARN] Article not found: {article_id}")
                    errors += 1
                    continue
                
                # 記事本文から要約とラベルを生成
                content = article.get("content", "") or article.get("title", "")
                if not content.strip():
                    print(f"[WARN] No content for article: {article_id}")
                    errors += 1
                    continue
                
                # 要約処理を実行
                if include_labeling:
                    summary, labels = self.llm.generate_summary_and_labels(content, model_name=model_name)
                    self.db.update_article_summary_and_labels(article_id, summary, labels)
                else:
                    summary = self.llm.generate_summary(content, model_name=model_name)
                    self.db.update_article_summary(article_id, summary)
                
                processed += 1
                print(f"[INFO] Processed article: {article.get('title', 'No title')[:50]}...")
                
            except Exception as e:
                print(f"[ERROR] Failed to process article {article_id}: {e}")
                errors += 1
        
        return {
            "message": "Specific article summarization completed",
            "processed": processed,
            "errors": errors
        }
    
    def batch_categorize_articles(self, limit: int = 50) -> Dict[str, Any]:
        """記事の自動カテゴリ分類"""
        try:
            # カテゴリ分類されていない記事を取得
            articles = self.db.get_latest_articles(limit)
            
            processed = 0
            errors = 0
            
            for article in articles:
                try:
                    content = article.get("content", "") or article.get("title", "")
                    if not content.strip():
                        continue
                    
                    # カテゴリを生成
                    categories = self.llm.generate_categories(content)
                    
                    # データベースを更新（categoriesカラムが存在する場合）
                    # self.db.update_article_categories(article["id"], categories)
                    
                    processed += 1
                    print(f"[INFO] Categorized article: {article['title'][:50]}... -> {categories}")
                    
                except Exception as e:
                    print(f"[ERROR] Failed to categorize article {article.get('id')}: {e}")
                    errors += 1
            
            return {
                "message": "Categorization completed",
                "processed": processed,
                "errors": errors
            }
            
        except Exception as e:
            print(f"[ERROR] Categorize service error: {e}")
            return {"error": str(e), "processed": 0}


# グローバルインスタンス
summarize_service = SummarizeService()
