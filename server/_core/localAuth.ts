import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import { hash, verify } from "argon2";
import { getSessionCookieOptions } from "./cookies";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { SignJWT } from "jose";

export function registerLocalAuthRoutes(app: Express) {
  // Register a new user
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { username, password, name, email } = req.body;

      if (!username || !password) {
        res.status(400).json({ error: "Username and password are required" });
        return;
      }

      const db = await getDb();
      if (!db) {
        res.status(500).json({ error: "Database not available" });
        return;
      }

      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (existingUser.length > 0) {
        res.status(400).json({ error: "Username already exists" });
        return;
      }

      // Hash password
      const passwordHash = await hash(password);

      // Create user - use a pseudo-openId for local users
      const pseudoOpenId = `local_${username}_${Date.now()}`;

      await db.insert(users).values({
        openId: pseudoOpenId,
        username,
        passwordHash,
        name: name || username,
        email: email || null,
        loginMethod: "local",
      });

      res.status(201).json({
        success: true,
        message: "User registered successfully. You can now login.",
      });
    } catch (error) {
      console.error("[Auth] Register failed", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // Login with username and password
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({ error: "Username and password are required" });
        return;
      }

      const db = await getDb();
      if (!db) {
        res.status(500).json({ error: "Database not available" });
        return;
      }

      // Find user
      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (userResult.length === 0) {
        res.status(401).json({ error: "Invalid username or password" });
        return;
      }

      const user = userResult[0];

      if (!user.passwordHash) {
        res.status(401).json({ error: "Invalid username or password" });
        return;
      }

      // Verify password
      const passwordValid = await verify(user.passwordHash, password);

      if (!passwordValid) {
        res.status(401).json({ error: "Invalid username or password" });
        return;
      }

      // Update last signed in
      await db
        .update(users)
        .set({ lastSignedIn: new Date() })
        .where(eq(users.id, user.id));

      // Create JWT session token like the OAuth version
      const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || "default-secret");
      const expirationSeconds = Math.floor((Date.now() + ONE_YEAR_MS) / 1000);

      const sessionToken = await new SignJWT({
        openId: user.openId,
        appId: process.env.VITE_APP_ID || "ausflug-manager",
        name: user.name || user.username,
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
      console.error("[Auth] Login failed", error);
      res.status(500).json({ error: "Login failed" });
    }
  });
}
