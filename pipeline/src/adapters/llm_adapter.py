import os
from typing import Tuple, List, Protocol
from abc import ABC, abstractmethod
import json
import httpx
from openai import OpenAI
from tenacity import retry, stop_after_attempt, wait_fixed


class LLMInterface(Protocol):
    """LLMサービスのインターフェース"""
    
    def generate_summary_and_labels(self, article_text: str) -> Tuple[str, List[str]]:
        """記事本文から要約とラベルリストを生成"""
        ...

    def generate_categories(self, article_text: str) -> List[str]:
        """記事本文からカテゴリ（大カテゴリ・小カテゴリ等）を推論"""
        ...

    def generate_monthly_summary(self, articles: List[str]) -> str:
        """複数記事から月次まとめ（要約・ポイント）を生成"""
        ...


class OpenAILLMAdapter(LLMInterface):
    """OpenAI GPT APIを使用したLLMアダプター"""
    
    def __init__(self):
        self.api_key = os.environ.get('OPENAI_API_KEY')
        if not self.api_key:
            raise RuntimeError('OPENAI_API_KEY is not set')
        self.client = OpenAI(api_key=self.api_key)
        self.model = "gpt-4o-mini"
    
    @retry(stop=stop_after_attempt(3), wait=wait_fixed(2))
    def generate_summary_and_labels(self, article_text: str) -> Tuple[str, List[str]]:
        """記事要約とラベル生成"""
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "あなたは半導体業界の専門記事を要約し、関連するタグを生成するAIアシスタントです。"
                    },
                    {
                        "role": "user",
                        "content": f"""
次の記事を200字以内で要約し、関連するタグを5～10個生成してください。
記事: {article_text}

出力形式はJSON形式で以下のようにしてください：
{{
    "summary": "記事の要約",
    "labels": ["タグ1", "タグ2", "タグ3"]
}}
"""
                    }
                ],
                max_tokens=500,
                temperature=0.5
            )
            
            content = response.choices[0].message.content
            result = json.loads(content)
            summary = result.get("summary", "").strip()
            labels = result.get("labels", [])
            
            return summary, labels
            
        except Exception as e:
            print(f"[ERROR] OpenAI API error: {e}")
            return "要約生成に失敗しました", []
    
    @retry(stop=stop_after_attempt(3), wait=wait_fixed(2))
    def generate_categories(self, article_text: str) -> List[str]:
        """カテゴリ自動分類"""
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "あなたは半導体業界の記事を適切なカテゴリに分類するAIアシスタントです。"
                    },
                    {
                        "role": "user",
                        "content": f"""
次の記事を適切なカテゴリに分類してください。
記事: {article_text}

可能なカテゴリ：
- 技術動向
- 市場動向
- 企業動向
- 政策・規制
- 投資・M&A
- 人材・組織
- その他

出力形式はJSON配列で：["カテゴリ1", "カテゴリ2"]
"""
                    }
                ],
                max_tokens=100,
                temperature=0.3
            )
            
            content = response.choices[0].message.content
            categories = json.loads(content)
            
            return categories
            
        except Exception as e:
            print(f"[ERROR] OpenAI API error: {e}")
            return ["その他"]
    
    @retry(stop=stop_after_attempt(3), wait=wait_fixed(2))
    def generate_monthly_summary(self, articles: List[str]) -> str:
        """月次まとめ生成"""
        try:
            articles_text = "\n\n".join([f"記事{i+1}: {article}" for i, article in enumerate(articles)])
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "あなたは半導体業界の月次動向をまとめるアナリストです。"
                    },
                    {
                        "role": "user",
                        "content": f"""
以下の記事群から月次の業界動向をまとめてください。

{articles_text}

以下の観点でまとめてください：
1. 技術動向のハイライト
2. 市場・企業動向のポイント
3. 注目すべき今後の展望

800字程度でまとめてください。
"""
                    }
                ],
                max_tokens=1000,
                temperature=0.6
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            print(f"[ERROR] OpenAI API error: {e}")
            return "月次まとめの生成に失敗しました"


class OllamaLLMAdapter(LLMInterface):
    """Ollama（ローカルLLM）を使用したLLMアダプター"""
    
    def __init__(self, base_url: str = "http://localhost:11434", model: str = "llama3.2"):
        self.base_url = base_url
        self.model = model
    
    def _call_ollama(self, prompt: str) -> str:
        """Ollama APIを呼び出し"""
        try:
            with httpx.Client() as client:
                response = client.post(
                    f"{self.base_url}/api/generate",
                    json={
                        "model": self.model,
                        "prompt": prompt,
                        "stream": False
                    },
                    timeout=60.0
                )
                response.raise_for_status()
                return response.json()["response"]
        except Exception as e:
            print(f"[ERROR] Ollama API error: {e}")
            raise
    
    def generate_summary_and_labels(self, article_text: str) -> Tuple[str, List[str]]:
        """記事要約とラベル生成"""
        prompt = f"""
記事を200字以内で要約し、関連するタグを5～10個生成してください。

記事: {article_text}

出力形式：
要約: [ここに要約]
タグ: [タグ1,タグ2,タグ3]
"""
        try:
            response = self._call_ollama(prompt)
            lines = response.strip().split('\n')
            summary = ""
            labels = []
            
            for line in lines:
                if line.startswith("要約:"):
                    summary = line.replace("要約:", "").strip()
                elif line.startswith("タグ:"):
                    tags_text = line.replace("タグ:", "").strip()
                    labels = [tag.strip() for tag in tags_text.split(',') if tag.strip()]
            
            return summary or "要約生成に失敗", labels
            
        except Exception as e:
            print(f"[ERROR] Ollama summary generation: {e}")
            return "要約生成に失敗しました", []
    
    def generate_categories(self, article_text: str) -> List[str]:
        """カテゴリ自動分類"""
        prompt = f"""
以下の記事を適切なカテゴリに分類してください。

記事: {article_text}

可能なカテゴリ：技術動向, 市場動向, 企業動向, 政策・規制, 投資・M&A, 人材・組織, その他

カテゴリ: [選択したカテゴリをカンマ区切りで]
"""
        try:
            response = self._call_ollama(prompt)
            for line in response.strip().split('\n'):
                if line.startswith("カテゴリ:"):
                    categories_text = line.replace("カテゴリ:", "").strip()
                    return [cat.strip() for cat in categories_text.split(',') if cat.strip()]
            
            return ["その他"]
            
        except Exception as e:
            print(f"[ERROR] Ollama category generation: {e}")
            return ["その他"]
    
    def generate_monthly_summary(self, articles: List[str]) -> str:
        """月次まとめ生成"""
        articles_text = "\n\n".join([f"記事{i+1}: {article}" for i, article in enumerate(articles)])
        
        prompt = f"""
以下の記事群から半導体業界の月次動向をまとめてください：

{articles_text}

800字程度で以下の観点でまとめてください：
1. 技術動向のハイライト
2. 市場・企業動向のポイント  
3. 注目すべき今後の展望
"""
        try:
            return self._call_ollama(prompt)
        except Exception as e:
            print(f"[ERROR] Ollama monthly summary: {e}")
            return "月次まとめの生成に失敗しました"


class DummyLLMAdapter(LLMInterface):
    """テスト用ダミーLLMアダプター"""
    
    def generate_summary_and_labels(self, article_text: str) -> Tuple[str, List[str]]:
        return "ダミー要約", ["半導体", "技術", "動向"]
    
    def generate_categories(self, article_text: str) -> List[str]:
        return ["技術動向"]
    
    def generate_monthly_summary(self, articles: List[str]) -> str:
        return "ダミー月次まとめ"


# ファクトリー関数
def create_llm_adapter(adapter_type: str = "openai") -> LLMInterface:
    """LLMアダプターを作成"""
    if adapter_type == "openai":
        return OpenAILLMAdapter()
    elif adapter_type == "ollama":
        return OllamaLLMAdapter()
    elif adapter_type == "dummy":
        return DummyLLMAdapter()
    else:
        raise ValueError(f"Unknown adapter type: {adapter_type}")


# グローバルインスタンス
llm_adapter = create_llm_adapter(os.environ.get("LLM_ADAPTER", "openai"))
