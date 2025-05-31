import httpx
from typing import Optional, Dict, Any
import asyncio


class HTTPAdapter:
    """外部HTTP API呼び出し用アダプター"""
    
    def __init__(self, timeout: float = 30.0):
        self.timeout = timeout
    
    async def get(self, url: str, headers: Optional[Dict[str, str]] = None) -> Optional[Dict[str, Any]]:
        """HTTP GET リクエスト"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url, headers=headers or {})
                response.raise_for_status()
                return response.json() if response.headers.get("content-type", "").startswith("application/json") else {"content": response.text}
        except Exception as e:
            print(f"[ERROR] HTTP GET error for {url}: {e}")
            return None
    
    async def post(self, url: str, data: Optional[Dict[str, Any]] = None, headers: Optional[Dict[str, str]] = None) -> Optional[Dict[str, Any]]:
        """HTTP POST リクエスト"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(url, json=data, headers=headers or {})
                response.raise_for_status()
                return response.json() if response.headers.get("content-type", "").startswith("application/json") else {"content": response.text}
        except Exception as e:
            print(f"[ERROR] HTTP POST error for {url}: {e}")
            return None
    
    def get_sync(self, url: str, headers: Optional[Dict[str, str]] = None) -> Optional[Dict[str, Any]]:
        """同期HTTP GET リクエスト"""
        return asyncio.run(self.get(url, headers))
    
    def post_sync(self, url: str, data: Optional[Dict[str, Any]] = None, headers: Optional[Dict[str, str]] = None) -> Optional[Dict[str, Any]]:
        """同期HTTP POST リクエスト"""
        return asyncio.run(self.post(url, data, headers))


# グローバルインスタンス
http_adapter = HTTPAdapter()
