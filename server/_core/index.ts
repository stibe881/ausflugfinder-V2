import "dotenv/config";
import express, { Express, Request, Response, NextFunction } from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerLocalAuthRoutes } from "./localAuth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { applySecurity, registerHealthCheck } from "./middleware";
import { setupWebSocketServer } from "./websocket";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Trust proxy - required when running behind nginx reverse proxy
  app.set('trust proxy', true);

  // Apply security middleware first (headers, CORS, rate limiting)
  applySecurity(app);

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // OPTIMIZATION #8: Initialize local storage and serve uploaded files
  try {
    const { initializeLocalStorage } = await import("../storage");
    await initializeLocalStorage();
    // Serve uploaded images statically
    app.use("/uploads/images", express.static(process.env.UPLOAD_DIR || "uploads/images"));
    // Also serve uploads from root for imported images
    app.use("/uploads", express.static("uploads"));
  } catch (error) {
    console.warn("[Storage] Failed to initialize local storage:", error);
  }

  // Health check endpoint
  registerHealthCheck(app);

  // Local auth routes (login/register)
  registerLocalAuthRoutes(app);
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // Setup WebSocket server for real-time notifications
  setupWebSocketServer(server);

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Global error handler - must be last middleware
  // Only catch errors that weren't already handled by tRPC
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    // Skip if response already sent
    if (res.headersSent) {
      console.error('[Error Handler] Response already sent, skipping:', err.message);
      return;
    }

    // Only handle non-tRPC errors (tRPC handles its own errors)
    if (!req.path.includes('/api/trpc')) {
      console.error('[Error Handler] Unhandled error:', err);
      const statusCode = err.status || err.statusCode || 500;
      res.status(statusCode).json({
        code: err.code || 'INTERNAL_SERVER_ERROR',
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
      });
    }
  });

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
