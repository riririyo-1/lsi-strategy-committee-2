"""
記事本文スクレイピングサービス
RSSフィードから取得したURLから記事本文とOGP画像を取得
"""
import re
import httpx
from bs4 import BeautifulSoup
from typing import Optional, Tuple
from tenacity import retry, stop_after_attempt, wait_fixed


class ScrapingService:
    """記事コンテンツスクレイピングサービス"""
    
    def __init__(self):
        self.timeout = httpx.Timeout(10.0, connect=5.0)
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    
    @retry(stop=stop_after_attempt(3), wait=wait_fixed(2))
    async def fetch_article_content(self, url: str) -> Tuple[str, Optional[str]]:
        """
        記事URLから本文とOGP画像を取得
        
        Returns:
            Tuple[str, Optional[str]]: (記事本文, OGP画像URL)
        """
        content = ""
        og_image = None
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url, headers=self.headers)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.content, "html.parser")
                
                # 記事本文の抽出
                content = self._extract_article_text(soup)
                
                # OGP画像の取得
                og_image = self._extract_og_image(soup)
                
        except Exception as e:
            print(f"[ERROR] スクレイピング失敗 ({url}): {e}")
        
        return content, og_image
    
    def _extract_article_text(self, soup: BeautifulSoup) -> str:
        """記事本文を抽出"""
        # 不要な要素を削除
        for element in soup.find_all(['script', 'style', 'header', 'footer', 'nav']):
            element.decompose()
        
        # 優先的に探すタグ
        content_tags = [
            'article',
            ('div', {'class': re.compile(r'(content|article|main|post)')}),
            ('div', {'id': re.compile(r'(content|article|main|post)')}),
            'main'
        ]
        
        text = ""
        for tag in content_tags:
            if isinstance(tag, tuple):
                element = soup.find(tag[0], tag[1])
            else:
                element = soup.find(tag)
            
            if element:
                text = element.get_text(separator=" ", strip=True)
                break
        
        # 見つからない場合は全体のテキストを取得
        if not text:
            text = soup.get_text(separator=" ", strip=True)
        
        # 改行や余分な空白を正規化
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'[\n\t\r]+', ' ', text)
        
        # 長すぎる場合は最初の部分のみ
        if len(text) > 5000:
            text = text[:5000] + "..."
        
        return text.strip()
    
    def _extract_og_image(self, soup: BeautifulSoup) -> Optional[str]:
        """OGP画像URLを抽出"""
        # OGP画像を探す
        og_image = soup.find("meta", property="og:image")
        if og_image and og_image.get("content"):
            return og_image["content"]
        
        # Twitter Card画像を探す
        twitter_image = soup.find("meta", attrs={"name": "twitter:image"})
        if twitter_image and twitter_image.get("content"):
            return twitter_image["content"]
        
        # 通常の画像タグから最初の画像を取得
        img_tag = soup.find("img", src=True)
        if img_tag and img_tag["src"]:
            src = img_tag["src"]
            # 相対URLの場合は処理をスキップ（簡易実装）
            if src.startswith("http"):
                return src
        
        return None


# シングルトンインスタンス
scraping_service = ScrapingService()