import swaggerJSDoc from "swagger-jsdoc";
import path from "path";

// 本番環境ではソースファイルを、開発環境ではコンパイル済みファイルを参照
const isProduction = process.env.NODE_ENV === "production";
const fileExtension = isProduction ? "ts" : "js";
const baseDir = isProduction ? path.join(__dirname, "../../src") : __dirname;

const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Semicon API",
      version: "1.0.0",
      description: "LSI戦略コミッティのバックエンドAPI",
    },
    servers: [
      {
        url: isProduction ? "/api" : "http://localhost:4100",
        description: isProduction ? "Production server" : "Development server",
      },
    ],
  },
  apis: [
    path.join(baseDir, `routes/*.${fileExtension}`),
    path.join(baseDir, `controllers/*.${fileExtension}`),
    path.join(baseDir, `app.${fileExtension}`),
  ],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);