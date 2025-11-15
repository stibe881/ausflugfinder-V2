import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { getSessionCookieOptions } from "./cookies";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { SignJWT } from "jose";

export function registerLocalAuthRoutes(app: Express) {
  // Register a new user
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { email, password, name } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
      }

      if (!name) {
        res.status(400).json({ error: "Name is required" });
        return;
      }

      const db = await getDb();
      if (!db) {
        res.status(500).json({ error: "Database not available" });
        return;
      }

      // Check if user already exists by email
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingUser.length > 0) {
        res.status(400).json({ error: "Email already registered" });
        return;
      }

      // Hash password (using bcryptjs for better Alpine Docker compatibility)
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user - use a pseudo-openId for local users
      const pseudoOpenId = `local_${email}_${Date.now()}`;

      await db.insert(users).values({
        openId: pseudoOpenId,
        passwordHash,
        name,
        email,
        loginMethod: "local",
      });

      res.status(201).json({
        success: true,
        message: "User registered successfully. You can now login.",
      });
    } catch (error) {
      console.error("[Auth] Register failed:", error instanceof Error ? error.message : error);
      console.error("[Auth] Register error stack:", error instanceof Error ? error.stack : "No stack trace");
      res.status(500).json({
        error: "Registration failed",
        // Always include details for debugging this critical issue
        details: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // Login with email and password
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
      }

      const db = await getDb();
      if (!db) {
        res.status(500).json({ error: "Database not available" });
        return;
      }

      // Find user by email
      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (userResult.length === 0) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      const user = userResult[0];

      if (!user.passwordHash) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      // Verify password
      const passwordValid = await bcrypt.compare(password, user.passwordHash);

      if (!passwordValid) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      // Update last signed in (non-critical, don't fail login if this fails)
      try {
        await db
          .update(users)
          .set({ lastSignedIn: new Date().toISOString() })
          .where(eq(users.id, user.id));
      } catch (err) {
        console.warn('[Auth] Failed to update lastSignedIn:', err);
      }

      // Create JWT session token like the OAuth version
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret || jwtSecret.length < 32) {
        console.error("[Auth] JWT_SECRET is not set or too short. It must be at least 32 characters long.");
        res.status(500).json({ error: "Server configuration error: JWT_SECRET invalid" });
        return;
      }
      const secretKey = new TextEncoder().encode(jwtSecret);
      const expirationSeconds = Math.floor((Date.now() + ONE_YEAR_MS) / 1000);

      const sessionToken = await new SignJWT({
        openId: user.openId,
        appId: process.env.VITE_APP_ID || "ausflug-manager",
        name: user.name,
      })
        .setProtectedHeader({ alg: "HS256", typ: "JWT" })
        .setExpirationTime(expirationSeconds)
        .sign(secretKey);

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      res.status(200).json({
        success: true,
        message: "Login successful",
      });
    } catch (error) {
      console.error("[Auth] Login failed:", error instanceof Error ? error.message : error);
      console.error("[Auth] Login error stack:", error instanceof Error ? error.stack : "No stack trace");
      res.status(500).json({
        error: "Login failed",
        // Always include details for debugging this critical issue
        details: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // Forgot password request
  app.post("/api/auth/forgot-password", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ error: "Email is required" });
        return;
      }

      const db = await getDb();
      if (!db) {
        res.status(500).json({ error: "Database not available" });
        return;
      }

      const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

      if (!user) {
        // For security reasons, don't tell the user if the email doesn't exist.
        // Just return a success message.
        console.warn(`[Auth] Password reset requested for non-existent email: ${email}`);
        res.status(200).json({ success: true, message: "If an account with that email exists, a password reset link has been sent." });
        return;
      }

      const token = await generatePasswordResetToken(user.id);
      const resetLink = `${req.protocol}://${req.get('host')}/reset-password?token=${token}`;

      await sendPasswordResetEmail(email, resetLink);

      res.status(200).json({ success: true, message: "If an account with that email exists, a password reset link has been sent." });

    } catch (error) {
      console.error("[Auth] Forgot password failed:", error instanceof Error ? error.message : error);
      res.status(500).json({
        error: "Failed to process forgot password request",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // Reset password with token
  app.post("/api/auth/reset-password", async (req: Request, res: Response) => {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        res.status(400).json({ error: "Token and new password are required" });
        return;
      }

      const db = await getDb();
      if (!db) {
        res.status(500).json({ error: "Database not available" });
        return;
      }

      const { valid, userId, error } = await validatePasswordResetToken(token);

      if (!valid || !userId) {
        res.status(400).json({ error: error || "Invalid or expired token" });
        return;
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(newPassword, 10);

      // Update user's password
      await db.update(users).set({ passwordHash }).where(eq(users.id, userId));

      // Delete the used token
      await deletePasswordResetToken(token);

      res.status(200).json({ success: true, message: "Password has been reset successfully." });

    } catch (error) {
      console.error("[Auth] Reset password failed:", error instanceof Error ? error.message : error);
      res.status(500).json({
        error: "Failed to reset password",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  });
}
