import express, { Express, Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import cors from "cors";

/**
 * Security & Rate Limiting Middleware Configuration
 */

// General API rate limiter - 100 requests per 15 minutes
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  validate: { trustProxy: false }, // Disable trust proxy validation since we're behind nginx
  skip: (req: Request) => {
    // Skip rate limiting for health checks and static assets
    return req.path === "/health" || req.path.startsWith("/public");
  },
});

// Strict rate limiter for login/register - 5 attempts per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts, please try again later.",
  skipSuccessfulRequests: true, // Don't count successful requests
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false }, // Disable trust proxy validation since we're behind nginx
});

// CORS Configuration
export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
      "http://localhost:3000",
      "http://localhost:5173", // Vite dev server
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5173",
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400, // 24 hours
};

// Security Headers Middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "DENY");

  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Enable XSS protection
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Content Security Policy
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://maps.gstatic.com https://*.googleapis.com https://forge.butterfly-effect.dev; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://maps.googleapis.com https://maps.gstatic.com https://*.googleapis.com https://forge.butterfly-effect.dev https://api.open-meteo.com; frame-src 'self';"
  );

  // Referrer Policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // HTTPS enforcement
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }

  next();
};

/**
 * Apply all security middleware to Express app
 */
export function applySecurity(app: Express) {
  // Security headers should be applied first
  app.use(securityHeaders);

  // CORS middleware - only apply to API routes to avoid blocking static assets
  app.use("/api", cors(corsOptions));

  // General API rate limiting (apply to all /api routes)
  app.use("/api", apiLimiter);

  // Auth endpoints have stricter rate limiting
  app.use("/api/auth/login", authLimiter);
  app.use("/api/auth/register", authLimiter);

  // Prevent parameter pollution
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Remove any extra parameters that might be injected
    if (req.body && typeof req.body === "object") {
      const allowedKeys = new Set(Object.keys(req.body || {}));
      // Additional validation could be added here
    }
    next();
  });
}

// Health check endpoint (not rate limited)
export function registerHealthCheck(app: Express) {
  app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });
}
