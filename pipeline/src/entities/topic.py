from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional
from dataclasses import field

@dataclass
class Topic:
    """
    TOPICSデータを表すエンティティ

    :param title: TOPICS タイトル
    :param content: TOPICS 本文
    :param published_date: 配信日
    :param article_ids: 紐づく記事IDのリスト
    :param categories: カテゴリリスト
    :param template: 使用テンプレート名
    """
    title: str
    content: str
    published_date: datetime
    article_ids: List[str] = field(default_factory=list)
    categories: List[str] = field(default_factory=list)
    template: str = "default"
    id: Optional[str] = None
