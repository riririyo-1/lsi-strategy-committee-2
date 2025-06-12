import os
import re
from datetime import datetime, date, timedelta
from typing import List, Optional
import yaml

import feedparser
import httpx
from bs4 import BeautifulSoup
from dateutil import parser as date_parser

from entities.article import Article


class CrawlService:
    """RSS収集サービス"""
    
    def __init__(self):
        self.timeout = 10.0
        self.rss_feeds_config = self._load_rss_feeds()
    
    def _load_rss_feeds(self) -> dict:
        """RSS feeds設定をロード"""
        try:
            with open("rss_feeds.yaml", "r", encoding="utf-8") as f:
                return yaml.safe_load(f)
        except Exception as e:
            print(f"[ERROR] Failed to load rss_feeds.yaml: {e}")
            return {"feeds": []}
    
    def fetch_articles_from_period(self, start_date: date, end_date: date, sources: Optional[List[str]] = None) -> List[Article]:
        """指定期間のRSS記事を収集"""
        all_articles = []
        
        # サービス名をキーとしたYAML構造に対応
        for service_name, feeds in self.rss_feeds_config.items():
            if not isinstance(feeds, list):
                continue
                
            for feed_config in feeds:
                feed_url = feed_config.get("url")
                source_name = feed_config.get("name", service_name)
                
                if not feed_url:
                    continue
                
                # ソースフィルタリング
                if sources and source_name not in sources:
                    print(f"[INFO] Skipping {source_name} (not in requested sources: {sources})")
                    continue
                
                try:
                    articles = self._fetch_articles_from_feed(feed_url, source_name, start_date, end_date)
                    all_articles.extend(articles)
                    print(f"[INFO] Fetched {len(articles)} articles from {source_name}")
                except Exception as e:
                    print(f"[ERROR] Failed to fetch from {source_name}: {e}")
        
        return all_articles
    
    def _fetch_articles_from_feed(self, feed_url: str, source_name: str, start_date: date, end_date: date) -> List[Article]:
        """単一RSSフィードから記事を取得"""
        try:
            feed = feedparser.parse(feed_url)
            articles = []
            
            for entry in feed.entries:
                published_date = self._parse_published_date(entry)
                
                # 期間フィルタリング
                if published_date and start_date <= published_date.date() <= end_date:
                    article = Article(
                        title=entry.get("title", ""),
                        url=entry.get("link", ""),
                        source=source_name,
                        published=published_date,
                        content=self._fetch_article_content(entry.get("link", "")),
                        thumbnail_url=self._fetch_thumbnail_url(entry.get("link", ""))
                    )
                    articles.append(article)
            
            return articles
            
        except Exception as e:
            print(f"[ERROR] Failed to parse RSS feed {feed_url}: {e}")
            return []
    
    def _parse_published_date(self, entry) -> Optional[datetime]:
        """RSS エントリから公開日時をパース"""
        for date_field in ["published", "updated", "pubDate"]:
            if hasattr(entry, date_field):
                try:
                    date_str = getattr(entry, date_field)
                    return date_parser.parse(date_str)
                except:
                    continue
        
        # published_parsed を試す
        if hasattr(entry, "published_parsed") and entry.published_parsed:
            try:
                import time
                return datetime.fromtimestamp(time.mktime(entry.published_parsed))
            except:
                pass
        
        return None
    
    def _fetch_article_content(self, url: str) -> str:
        """記事URLから本文を取得"""
        if not url:
            return ""
        
        try:
            with httpx.Client(timeout=self.timeout) as client:
                response = client.get(url)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.content, "html.parser")
                
                # article タグを優先的に探す
                article_tag = soup.find("article")
                if article_tag:
                    text = article_tag.get_text(separator=" ", strip=True)
                else:
                    # article タグがない場合は全体から抽出
                    # 不要なタグを除去
                    for tag in soup(["script", "style", "nav", "header", "footer", "aside"]):
                        tag.decompose()
                    text = soup.get_text(separator=" ", strip=True)
                
                # 改行・タブの正規化
                return re.sub(r"[\n\t\r]+", " ", text).strip()
                
        except Exception as e:
            print(f"[ERROR] Failed to fetch content from {url}: {e}")
            return ""
    
    def _fetch_thumbnail_url(self, url: str) -> str:
        """記事URLからOGP画像を取得"""
        if not url:
            return ""
        
        try:
            with httpx.Client(timeout=self.timeout) as client:
                response = client.get(url)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.content, "html.parser")
                
                # OGP画像を探す
                og_image = soup.find('meta', property='og:image')
                if og_image and og_image.get('content'):
                    return og_image['content']
                
                # Twitter画像を探す
                twitter_image = soup.find('meta', name='twitter:image')
                if twitter_image and twitter_image.get('content'):
                    return twitter_image['content']
                
                return ""
                
        except Exception as e:
            print(f"[ERROR] Failed to fetch thumbnail from {url}: {e}")
            return ""
    
    def fetch_latest_articles(self, days: int = 7, sources: Optional[List[str]] = None) -> List[Article]:
        """最新N日間の記事を取得"""
        end_date = date.today()
        start_date = end_date - timedelta(days=days)
        return self.fetch_articles_from_period(start_date, end_date, sources)


# グローバルインスタンス
crawl_service = CrawlService()
