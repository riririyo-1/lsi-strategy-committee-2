from typing import List, Dict, Any, Optional
from datetime import datetime

from entities.article import Article
from adapters.db_adapter import db_adapter
from adapters.llm_adapter import llm_adapter


class CategorizeService:
    """カテゴリ自動分類サービス"""
    
    def __init__(self):
        self.db = db_adapter
        self.llm = llm_adapter
        
        # 事前定義されたカテゴリ（新4カテゴリシステム）
        self.predefined_categories = [
            "政治",
            "経済",
            "社会",
            "技術"
        ]
    
    def categorize_articles(self, article_ids: Optional[List[str]] = None, limit: int = 50) -> Dict[str, Any]:
        """記事の自動カテゴリ分類"""
        try:
            if article_ids:
                articles = []
                for article_id in article_ids:
                    # 特定記事を取得（実装は省略）
                    pass
            else:
                # 最新記事を取得
                articles = self.db.get_latest_articles(limit)
            
            processed = 0
            errors = 0
            categorization_results = []
            
            for article in articles:
                try:
                    content = article.get("content", "") or article.get("title", "")
                    if not content.strip():
                        continue
                    
                    # LLMでカテゴリを推論
                    predicted_categories = self.llm.generate_categories(content)
                    
                    # 事前定義カテゴリにマッピング
                    mapped_categories = self._map_to_predefined_categories(predicted_categories)
                    
                    result = {
                        "article_id": article["id"],
                        "title": article["title"][:100],
                        "predicted_categories": predicted_categories,
                        "mapped_categories": mapped_categories
                    }
                    categorization_results.append(result)
                    
                    # データベース更新（実装は省略）
                    # self.db.update_article_categories(article["id"], mapped_categories)
                    
                    processed += 1
                    print(f"[INFO] Categorized: {article['title'][:50]}... -> {mapped_categories}")
                    
                except Exception as e:
                    print(f"[ERROR] Failed to categorize article {article.get('id')}: {e}")
                    errors += 1
            
            return {
                "message": "Categorization completed",
                "processed": processed,
                "errors": errors,
                "results": categorization_results
            }
            
        except Exception as e:
            print(f"[ERROR] Categorize service error: {e}")
            return {"error": str(e), "processed": 0}
    
    def _map_to_predefined_categories(self, predicted_categories: List[str]) -> List[str]:
        """予測されたカテゴリを事前定義カテゴリにマッピング"""
        mapped = []
        
        for pred_cat in predicted_categories:
            pred_cat_lower = pred_cat.lower()
            
            # 完全一致チェック
            if pred_cat in self.predefined_categories:
                mapped.append(pred_cat)
                continue
            
            # 部分一致でマッピング（新4カテゴリシステム）
            if any(keyword in pred_cat_lower for keyword in ["技術", "テクノロジー", "イノベーション", "技術動向", "先端技術", "生産技術", "研究開発", "サプライチェーン", "環境"]):
                mapped.append("技術")
            elif any(keyword in pred_cat_lower for keyword in ["市場", "マーケット", "需要", "価格", "企業", "会社", "業績", "決算", "市場動向", "企業動向", "投資", "買収", "m&a", "資金調達"]):
                mapped.append("経済")
            elif any(keyword in pred_cat_lower for keyword in ["政策", "規制", "法律", "政府", "政治", "国の取り組み"]):
                mapped.append("政治")
            elif any(keyword in pred_cat_lower for keyword in ["人材", "採用", "組織", "人事", "社会", "世の中の動き", "人材・組織"]):
                mapped.append("社会")
            else:
                mapped.append("技術")  # デフォルトは技術カテゴリ
        
        # 重複除去（1つのカテゴリのみ選択）
        return [mapped[0]] if mapped else ["技術"]
    
    def get_category_statistics(self) -> Dict[str, Any]:
        """カテゴリ別統計情報を取得"""
        try:
            # 実装は省略（データベースからカテゴリ統計を取得）
            return {
                "total_articles": 0,
                "category_counts": {cat: 0 for cat in self.predefined_categories},
                "uncategorized": 0
            }
        except Exception as e:
            print(f"[ERROR] Failed to get category statistics: {e}")
            return {"error": str(e)}
    
    def suggest_new_categories(self, min_frequency: int = 5) -> List[str]:
        """新しいカテゴリの提案"""
        try:
            # 実装は省略（頻出するラベルから新カテゴリを提案）
            return []
        except Exception as e:
            print(f"[ERROR] Failed to suggest new categories: {e}")
            return []


# グローバルインスタンス
categorize_service = CategorizeService()
