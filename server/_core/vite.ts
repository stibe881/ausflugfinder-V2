import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  // Middleware to inject environment variables into index.html before serving
  const indexPath = path.resolve(distPath, "index.html");
  let cachedHtml: string | null = null;

  app.use((req, res, next) => {
    // Only process requests for index.html or root path for SPA routing
    if (req.path === "/" || req.path.endsWith(".html")) {
      if (!cachedHtml) {
        try {
          let html = fs.readFileSync(indexPath, "utf-8");

          // Replace VITE_* environment variables in the HTML
          for (const [key, value] of Object.entries(process.env)) {
            if (key.startsWith("VITE_")) {
              const placeholder = `%${key}%`;
              // Use simple string replacement to avoid regex issues
              while (html.includes(placeholder)) {
                html = html.replace(placeholder, String(value || ""));
              }
            }
          }

          cachedHtml = html;
        } catch (err) {
          console.error("Failed to load index.html:", err);
          cachedHtml = "<html><body>Error loading page</body></html>";
        }
      }

      res.set({ "Content-Type": "text/html" });
      res.send(cachedHtml);
      return;
    }

    next();
  });

  // Serve static files
  app.use(express.static(distPath));

  // Fall through to index.html for SPA routing
  app.use("*", (_req, res) => {
    if (!cachedHtml) {
      try {
        let html = fs.readFileSync(indexPath, "utf-8");

        // Replace VITE_* environment variables in the HTML
        for (const [key, value] of Object.entries(process.env)) {
          if (key.startsWith("VITE_")) {
            const placeholder = `%${key}%`;
            // Use simple string replacement to avoid regex issues
            while (html.includes(placeholder)) {
              html = html.replace(placeholder, String(value || ""));
            }
          }
        }

        cachedHtml = html;
      } catch (err) {
        console.error("Failed to load index.html:", err);
        cachedHtml = "<html><body>Error loading page</body></html>";
      }
    }

    res.set({ "Content-Type": "text/html" });
    res.send(cachedHtml);
  });
}
