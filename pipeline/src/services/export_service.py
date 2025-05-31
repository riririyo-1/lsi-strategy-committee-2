from typing import List, Dict, Any, Optional
from datetime import datetime, date
import json
from pathlib import Path

from entities.topic import Topic
from entities.article import Article
from adapters.db_adapter import db_adapter
from adapters.llm_adapter import llm_adapter


class ExportService:
    """テンプレート出力サービス"""
    
    def __init__(self):
        self.db = db_adapter
        self.llm = llm_adapter
        self.templates_dir = Path("templates")
        self.templates_dir.mkdir(exist_ok=True)
    
    def generate_topics_template(self, article_ids: List[str], template_type: str = "default") -> Dict[str, Any]:
        """記事群からTOPICS配信テンプレートを生成"""
        try:
            # 記事データを取得
            articles_data = []
            for article_id in article_ids:
                # 実際の実装では、db_adapter.get_article_by_id() などを使用
                articles = self.db.get_latest_articles(100)  # 暫定的な実装
                article = next((a for a in articles if str(a["id"]) == str(article_id)), None)
                if article:
                    articles_data.append(article)
            
            if not articles_data:
                return {"error": "No articles found for the given IDs"}
            
            # テンプレート生成
            template_content = self._generate_template_content(articles_data, template_type)
            
            # TOPICSエンティティ作成
            topic = Topic(
                title=f"半導体TOPICS配信 - {datetime.now().strftime('%Y年%m月%d日')}",
                content=template_content,
                published_date=datetime.now(),
                article_ids=article_ids,
                template=template_type
            )
            
            # データベースに保存
            topic_id = self.db.save_topic(topic)
            
            return {
                "topic_id": topic_id,
                "title": topic.title,
                "content": template_content,
                "article_count": len(articles_data),
                "template_type": template_type
            }
            
        except Exception as e:
            print(f"[ERROR] Failed to generate topics template: {e}")
            return {"error": str(e)}
    
    def _generate_template_content(self, articles: List[Dict], template_type: str) -> str:
        """テンプレートコンテンツを生成"""
        if template_type == "default":
            return self._generate_default_template(articles)
        elif template_type == "summary":
            return self._generate_summary_template(articles)
        elif template_type == "detailed":
            return self._generate_detailed_template(articles)
        else:
            return self._generate_default_template(articles)
    
    def _generate_default_template(self, articles: List[Dict]) -> str:
        """デフォルトテンプレート生成"""
        content_parts = [
            f"# 半導体TOPICS配信 - {datetime.now().strftime('%Y年%m月%d日')}",
            "",
            "## 今週のハイライト",
            ""
        ]
        
        # カテゴリ別に記事を整理
        categorized_articles = self._categorize_articles_for_template(articles)
        
        for category, cat_articles in categorized_articles.items():
            if not cat_articles:
                continue
                
            content_parts.append(f"### {category}")
            content_parts.append("")
            
            for article in cat_articles:
                title = article.get("title", "")
                summary = article.get("summary", "")
                url = article.get("url", "")
                
                content_parts.append(f"**{title}**")
                if summary:
                    content_parts.append(f"{summary}")
                content_parts.append(f"[詳細を読む]({url})")
                content_parts.append("")
        
        return "\n".join(content_parts)
    
    def _generate_summary_template(self, articles: List[Dict]) -> str:
        """要約中心テンプレート生成"""
        try:
            # LLMで月次まとめを生成
            article_texts = [
                f"{article.get('title', '')}: {article.get('summary', '')}"
                for article in articles
            ]
            
            monthly_summary = self.llm.generate_monthly_summary(article_texts)
            
            content_parts = [
                f"# 半導体業界 月次サマリー - {datetime.now().strftime('%Y年%m月')}",
                "",
                "## 概要",
                monthly_summary,
                "",
                "## 注目記事",
                ""
            ]
            
            # 上位5記事を表示
            for article in articles[:5]:
                title = article.get("title", "")
                url = article.get("url", "")
                content_parts.append(f"- [{title}]({url})")
            
            return "\n".join(content_parts)
            
        except Exception as e:
            print(f"[ERROR] Failed to generate summary template: {e}")
            return self._generate_default_template(articles)
    
    def _generate_detailed_template(self, articles: List[Dict]) -> str:
        """詳細版テンプレート生成"""
        content_parts = [
            f"# 半導体TOPICS配信（詳細版） - {datetime.now().strftime('%Y年%m月%d日')}",
            "",
            "## 目次",
            ""
        ]
        
        # 目次生成
        categorized_articles = self._categorize_articles_for_template(articles)
        for i, (category, cat_articles) in enumerate(categorized_articles.items(), 1):
            if cat_articles:
                content_parts.append(f"{i}. {category} ({len(cat_articles)}件)")
        
        content_parts.extend(["", "---", ""])
        
        # 詳細コンテンツ
        for category, cat_articles in categorized_articles.items():
            if not cat_articles:
                continue
                
            content_parts.append(f"## {category}")
            content_parts.append("")
            
            for article in cat_articles:
                title = article.get("title", "")
                summary = article.get("summary", "")
                url = article.get("url", "")
                source = article.get("source", "")
                published = article.get("published", "")
                
                content_parts.append(f"### {title}")
                content_parts.append(f"**出典:** {source}")
                if published:
                    content_parts.append(f"**公開日:** {published}")
                content_parts.append("")
                if summary:
                    content_parts.append(f"{summary}")
                    content_parts.append("")
                content_parts.append(f"[元記事を読む]({url})")
                content_parts.append("")
                content_parts.append("---")
                content_parts.append("")
        
        return "\n".join(content_parts)
    
    def _categorize_articles_for_template(self, articles: List[Dict]) -> Dict[str, List[Dict]]:
        """テンプレート用に記事をカテゴリ分け"""
        categories = {
            "技術動向": [],
            "市場動向": [],
            "企業動向": [],
            "政策・規制": [],
            "その他": []
        }
        
        for article in articles:
            labels = article.get("labels", [])
            if isinstance(labels, str):
                try:
                    labels = json.loads(labels)
                except:
                    labels = []
            
            # ラベルからカテゴリを推定
            categorized = False
            for label in labels:
                label_lower = label.lower()
                if any(keyword in label_lower for keyword in ["技術", "ai", "半導体", "チップ"]):
                    categories["技術動向"].append(article)
                    categorized = True
                    break
                elif any(keyword in label_lower for keyword in ["市場", "売上", "収益", "需要"]):
                    categories["市場動向"].append(article)
                    categorized = True
                    break
                elif any(keyword in label_lower for keyword in ["企業", "会社", "買収", "合併"]):
                    categories["企業動向"].append(article)
                    categorized = True
                    break
                elif any(keyword in label_lower for keyword in ["政策", "規制", "政府", "法律"]):
                    categories["政策・規制"].append(article)
                    categorized = True
                    break
            
            if not categorized:
                categories["その他"].append(article)
        
        return categories
    
    def export_topics_to_file(self, topic_id: str, format_type: str = "markdown") -> Dict[str, Any]:
        """TOPICSをファイルにエクスポート"""
        try:
            topic = self.db.get_topic_by_id(topic_id)
            if not topic:
                return {"error": "Topic not found"}
            
            filename = f"topics_{topic_id}_{datetime.now().strftime('%Y%m%d')}.{format_type}"
            file_path = self.templates_dir / filename
            
            with open(file_path, "w", encoding="utf-8") as f:
                if format_type == "markdown":
                    f.write(topic["content"])
                elif format_type == "html":
                    # Markdownを HTMLに変換（実装は省略）
                    f.write(f"<html><body>{topic['content']}</body></html>")
                else:
                    f.write(topic["content"])
            
            return {
                "message": "Export completed",
                "file_path": str(file_path),
                "format": format_type
            }
            
        except Exception as e:
            print(f"[ERROR] Failed to export topics: {e}")
            return {"error": str(e)}


# グローバルインスタンス
export_service = ExportService()
