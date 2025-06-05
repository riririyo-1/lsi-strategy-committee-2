#!/usr/bin/env python3
"""
モックデータを使用したRSS処理フローのテスト
"""

import asyncio
import os
import sys

# 環境変数設定
os.environ["LLM_ADAPTER"] = "dummy"

# パス設定
sys.path.append(os.path.dirname(__file__))

from services.scraping_service import scraping_service
from adapters.llm_adapter import llm_adapter

async def test_mock_processing():
    """モックデータでの処理テスト"""
    print("=== モックデータ処理テスト ===")
    
    # モック記事データ
    mock_article = {
        "title": "半導体市場の最新動向について",
        "url": "https://example.com/semiconductor-news",
        "content": """
        半導体業界において、最新のプロセッサー技術の開発が進んでいます。
        3nmプロセスノードの量産が開始され、性能向上と消費電力削減が実現されています。
        また、AI専用チップの需要が急激に増加しており、各社が競って開発を進めています。
        市場調査によると、今年の半導体市場は前年比15%の成長が見込まれています。
        特にモバイル向けプロセッサーとデータセンター向けチップの需要が高まっています。
        """
    }
    
    print(f"タイトル: {mock_article['title']}")
    print(f"URL: {mock_article['url']}")
    print(f"コンテンツ: {len(mock_article['content'])}文字")
    print()
    
    # LLM処理テスト
    print("=== LLM処理テスト ===")
    try:
        summary, labels = llm_adapter.generate_summary_and_labels(mock_article['content'])
        print(f"✓ LLM処理成功")
        print(f"要約: {summary}")
        print(f"ラベル: {labels}")
        print()
    except Exception as e:
        print(f"✗ LLM処理失敗: {e}")
        return
    
    # カテゴリ分類テスト
    print("=== カテゴリ分類テスト ===")
    try:
        categories = llm_adapter.generate_categories(mock_article['content'])
        print(f"✓ カテゴリ分類成功")
        print(f"カテゴリ: {categories}")
        print()
    except Exception as e:
        print(f"✗ カテゴリ分類失敗: {e}")
        return
    
    # 月次まとめテスト
    print("=== 月次まとめテスト ===")
    try:
        monthly_summary = llm_adapter.generate_monthly_summary([mock_article['content']])
        print(f"✓ 月次まとめ成功")
        print(f"月次まとめ: {monthly_summary}")
        print()
    except Exception as e:
        print(f"✗ 月次まとめ失敗: {e}")
        return
    
    # 完全な記事データ構築テスト
    print("=== 完全な記事データ構築 ===")
    complete_article = {
        "title": mock_article['title'],
        "articleUrl": mock_article['url'],
        "source": "テストソース",
        "publishedAt": "2025-06-04T10:00:00",
        "summary": summary,
        "labels": labels,
        "categories": categories,
        "thumbnailUrl": "https://example.com/image.jpg"
    }
    
    print("✓ 完全な記事データ:")
    for key, value in complete_article.items():
        print(f"  {key}: {value}")
    
    print("\\n=== テスト完了 ===")
    print("✓ すべての処理が正常に動作しました")

if __name__ == "__main__":
    asyncio.run(test_mock_processing())