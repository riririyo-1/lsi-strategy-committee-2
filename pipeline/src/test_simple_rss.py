#!/usr/bin/env python3
"""
単純なRSS収集テスト（FastAPI非依存）
"""

import asyncio
import os
import sys
import aiohttp
import feedparser
from datetime import datetime, timedelta
from pathlib import Path

# 環境変数設定
os.environ["LLM_ADAPTER"] = "dummy"

# パス設定
sys.path.append(os.path.dirname(__file__))

from services.scraping_service import scraping_service
from adapters.llm_adapter import llm_adapter

async def simple_rss_test():
    """シンプルなRSS収集テスト"""
    print("=== シンプルRSS収集テスト ===")
    
    # テスト設定
    rss_url = "https://rss.cnn.com/rss/cnn_latest.rss"
    
    print(f"RSS URL: {rss_url}")
    
    try:
        # RSS取得
        print("RSS取得中...")
        timeout = aiohttp.ClientTimeout(total=15)
        async with aiohttp.ClientSession(timeout=timeout) as session:
            async with session.get(rss_url) as response:
                if response.status == 200:
                    rss_content = await response.text()
                    print(f"✓ RSS取得成功: {len(rss_content)}文字")
                else:
                    print(f"✗ RSS取得失敗: HTTP {response.status}")
                    return
        
        # RSS解析
        print("RSS解析中...")
        feed = feedparser.parse(rss_content)
        print(f"✓ RSS解析成功: {len(feed.entries)}件のエントリー")
        
        if not feed.entries:
            print("エントリーがありません")
            return
        
        # 最初の記事を処理
        entry = feed.entries[0]
        article_title = entry.title if hasattr(entry, 'title') else "タイトル不明"
        article_url = entry.link if hasattr(entry, 'link') else ""
        
        print(f"\\n=== 最初の記事をテスト ===")
        print(f"タイトル: {article_title}")
        print(f"URL: {article_url}")
        
        if article_url:
            # スクレイピングテスト
            print("\\n記事スクレイピング中...")
            try:
                content, image = await scraping_service.fetch_article_content(article_url)
                if content:
                    print(f"✓ 記事本文取得成功: {len(content)}文字")
                    print(f"本文プレビュー: {content[:200]}...")
                else:
                    print("✗ 記事本文取得失敗")
                
                if image:
                    print(f"✓ 画像取得成功: {image}")
                else:
                    print("✗ 画像取得失敗")
                
                # LLM処理テスト
                if content:
                    print("\\nLLM処理中...")
                    try:
                        summary, labels = llm_adapter.generate_summary_and_labels(content)
                        print(f"✓ LLM処理成功")
                        print(f"要約: {summary}")
                        print(f"ラベル: {labels}")
                    except Exception as llm_error:
                        print(f"✗ LLM処理失敗: {llm_error}")
                        
            except Exception as scrape_error:
                print(f"✗ スクレイピング失敗: {scrape_error}")
        
        print("\\n=== テスト完了 ===")
        
    except Exception as e:
        print(f"✗ テスト失敗: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(simple_rss_test())