#!/usr/bin/env python3
"""
RSS収集フローのテストスクリプト
実際のRSSフィードからの記事収集、スクレイピング、LLM処理をテスト
"""

import asyncio
import os
import sys
from datetime import datetime, timedelta

# 環境変数設定（ダミーLLMを使用）
os.environ["LLM_ADAPTER"] = "dummy"

# パス設定
sys.path.append(os.path.dirname(__file__))

from main import collect_from_source

async def test_rss_collection():
    """RSS収集フローのテスト"""
    print("=== RSS収集フローテスト開始 ===")
    
    # テスト設定
    source_name = "ITmedia"
    rss_url = "https://www.itmedia.co.jp/news/rss/1.0/news_technology.xml"
    
    # 過去1週間の記事を取得
    end_date = datetime.now()
    start_date = end_date - timedelta(days=7)
    
    print(f"ソース: {source_name}")
    print(f"RSS URL: {rss_url}")
    print(f"日付範囲: {start_date.strftime('%Y-%m-%d')} 〜 {end_date.strftime('%Y-%m-%d')}")
    print()
    
    try:
        # RSS収集実行
        articles = await collect_from_source(
            source_name,
            rss_url,
            start_date.isoformat(),
            end_date.isoformat()
        )
        
        print(f"✓ 収集完了: {len(articles)}件の記事")
        
        # 結果の詳細表示
        for i, article in enumerate(articles[:3], 1):  # 最初の3件のみ表示
            print(f"\n--- 記事 {i} ---")
            print(f"タイトル: {article['title']}")
            print(f"URL: {article['articleUrl']}")
            print(f"ソース: {article['source']}")
            print(f"公開日: {article['publishedAt']}")
            print(f"要約: {article['summary'][:100]}...")
            print(f"ラベル: {article['labels']}")
            print(f"画像: {article['thumbnailUrl'] or 'なし'}")
        
        if len(articles) > 3:
            print(f"\n... 他 {len(articles) - 3}件")
            
        print("\n=== テスト完了 ===")
        return articles
        
    except Exception as e:
        print(f"✗ テスト失敗: {e}")
        import traceback
        traceback.print_exc()
        return []

if __name__ == "__main__":
    results = asyncio.run(test_rss_collection())
    print(f"\n最終結果: {len(results)}件の記事を処理")