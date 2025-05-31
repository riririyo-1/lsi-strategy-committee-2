import os
import psycopg
from psycopg.rows import dict_row
from typing import List, Optional
import json
from datetime import datetime

from entities.article import Article
from entities.topic import Topic


class DatabaseAdapter:
    """データベースアクセス用アダプター（Prisma経由のDBアクセス）"""
    
    def __init__(self):
        self.host = os.environ.get("POSTGRES_HOST", "localhost")
        self.dbname = os.environ.get("POSTGRES_DB", "semicon_topics")
        self.user = os.environ.get("POSTGRES_USER", "semicon_topics")
        self.password = os.environ.get("POSTGRES_PASSWORD", "semiconpass")
    
    def get_connection(self):
        """DB接続を取得"""
        return psycopg.connect(
            host=self.host,
            dbname=self.dbname,
            user=self.user,
            password=self.password,
            autocommit=True,
            row_factory=dict_row
        )
    
    def save_articles(self, articles: List[Article]) -> dict:
        """記事をデータベースに保存"""
        inserted, skipped = 0, 0
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                for art in articles:
                    try:
                        # 重複チェック
                        cur.execute(
                            "SELECT 1 FROM \"Article\" WHERE title=%s AND \"articleUrl\"=%s AND source=%s",
                            (art.title, art.url, art.source)
                        )
                        if cur.fetchone():
                            skipped += 1
                            continue
                        
                        # 記事を挿入
                        cur.execute(
                            """
                            INSERT INTO "Article" (title, "articleUrl", source, summary, labels, "thumbnailUrl", "publishedAt", "fullText")
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                            """,
                            (
                                art.title,
                                art.url,
                                art.source,
                                art.summary,
                                art.labels if art.labels else [],
                                art.thumbnail_url or "",
                                art.published,
                                art.content
                            )
                        )
                        inserted += 1
                    except Exception as e:
                        print(f"[ERROR] save_articles: {e} (title={art.title})")
        
        return {"inserted": inserted, "skipped": skipped}
    
    def get_articles_without_summary(self, limit: int = 100) -> List[dict]:
        """要約されていない記事を取得"""
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT id, title, "articleUrl" as url, source, "fullText" as content, "publishedAt" as published
                    FROM "Article" 
                    WHERE summary IS NULL OR summary = '' 
                    ORDER BY "publishedAt" DESC 
                    LIMIT %s
                    """,
                    (limit,)
                )
                return cur.fetchall()
    
    def update_article_summary_and_labels(self, article_id: str, summary: str, labels: List[str]) -> None:
        """記事の要約とラベルを更新"""
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "UPDATE \"Article\" SET summary=%s, labels=%s WHERE id=%s",
                    (summary, labels, article_id)
                )
    
    def get_latest_articles(self, limit: int = 10) -> List[dict]:
        """最新記事を取得"""
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT id, title, "articleUrl" as url, source, summary, labels, "thumbnailUrl" as thumbnail_url, "publishedAt" as published, "fullText" as content
                    FROM "Article"
                    ORDER BY "publishedAt" DESC NULLS LAST, "createdAt" DESC
                    LIMIT %s
                    """,
                    (limit,)
                )
                return cur.fetchall()
    
    def save_topic(self, topic: Topic) -> str:
        """TOPICSを保存"""
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO "Topic" (title, content, "publishDate")
                    VALUES (%s, %s, %s)
                    RETURNING id
                    """,
                    (topic.title, topic.content, topic.published_date)
                )
                topic_id = cur.fetchone()["id"]
                
                # 記事とTOPICSの関連を保存
                for article_id in topic.article_ids:
                    cur.execute(
                        """
                        INSERT INTO "TopicsArticle" ("topicId", "articleId")
                        VALUES (%s, %s)
                        """,
                        (topic_id, article_id)
                    )
                
                return str(topic_id)
    
    def get_topic_by_id(self, topic_id: str) -> Optional[dict]:
        """TOPICS詳細を取得"""
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT id, title, content, "publishDate", "createdAt"
                    FROM "Topic"
                    WHERE id = %s
                    """,
                    (topic_id,)
                )
                return cur.fetchone()
    
    def get_articles_by_topic_id(self, topic_id: str) -> List[dict]:
        """TOPICS に紐づく記事を取得"""
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT a.id, a.title, a."articleUrl" as url, a.source, a.summary, a.labels, a."thumbnailUrl" as thumbnail_url, a."publishedAt" as published, a."fullText" as content
                    FROM "TopicsArticle" ta
                    JOIN "Article" a ON ta."articleId" = a.id
                    WHERE ta."topicId" = %s
                    ORDER BY a."publishedAt" DESC NULLS LAST, a."createdAt" DESC
                    """,
                    (topic_id,)
                )
                return cur.fetchall()


# グローバルインスタンス
db_adapter = DatabaseAdapter()
