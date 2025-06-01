"use client";

import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";
import { useEffect, useState } from "react";

// SwaggerUIコンポーネントを動的インポート（SSRを無効化）
const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export default function ApiDocsPage() {
  const [isClient, setIsClient] = useState(false);

  // hydration errorを避けるためにクライアントサイドレンダリングを確認
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">API ドキュメント</h1>
      {isClient ? (
        <div className="swagger-ui-container border rounded-lg overflow-hidden">
          <SwaggerUI url="/openapi.yaml" />
        </div>
      ) : (
        <p>APIドキュメントを読み込み中...</p>
      )}
    </div>
  );
}
