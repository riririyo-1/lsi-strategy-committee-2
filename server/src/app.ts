import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import { scheduleEngine } from "./services/scheduleExecutionEngine";

// ルートのインポート
import articleRoutes from "./routes/articleRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import topicRoutes from "./routes/topicRoutes";
import researchRoutes from "./routes/researchRoutes";
import scheduleRoutes from "./routes/scheduleRoutes";
import systemRoutes from "./routes/systemRoutes";

const app = express();
const port = process.env.PORT || 4000;

// ─── Middleware ──────────────────────────────
app.use(cors());
// JSONボディサイズの制限を50MBに増加（大量の記事データに対応）
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ─── Swagger Setup ───────────────────────────
app.use(
  "/api-docs",
  ...(process.env.NODE_ENV !== "production"
    ? [
        (req: Request, _res: Response, next: NextFunction) => {
          console.log(`[Swagger] ${req.method} ${req.originalUrl}`);
          next();
        },
      ]
    : []),
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { explorer: true })
);

console.log(
  `[Swagger] API docs available at http://localhost:${port}/api-docs`
);

// ─── Routes ───────────────────────────────────
app.use("/api/articles", articleRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/research", researchRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api", systemRoutes);

// ─── Error Handler ───────────────────────────
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).json({ 
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

// ─── Server Start ───────────────────────────
app.listen(port, async () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📚 API Docs: http://localhost:${port}/api-docs`);
  console.log(`🏗️  Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Schedule Engine の開始
  try {
    await scheduleEngine.start();
    console.log(`⏰ Schedule Engine started with ${scheduleEngine.getActiveTaskCount()} active tasks`);
  } catch (error) {
    console.error('❌ Failed to start Schedule Engine:', error);
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT. Graceful shutdown...');
  await scheduleEngine.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM. Graceful shutdown...');
  await scheduleEngine.stop();
  process.exit(0);
});

export default app;