import swaggerJSDoc from "swagger-jsdoc";
import path from "path";

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
        url: "http://localhost:4000",
        description: "Development server",
      },
    ],
  },
  apis: [
    path.join(__dirname, "../routes/*.ts"),
    path.join(__dirname, "../controllers/*.ts"),
    path.join(__dirname, "../app.ts"),
  ],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);