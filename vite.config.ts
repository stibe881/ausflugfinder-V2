import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
import { VitePWA } from "vite-plugin-pwa";

// Copy apple-touch-icon to dist after build
function copyAppleIconPlugin() {
  return {
    name: "copy-apple-icon",
    apply: "build",
    writeBundle() {
      const sourceIcon = path.resolve(import.meta.dirname, "public", "apple-touch-icon.png");
      const distIcon = path.resolve(import.meta.dirname, "dist", "public", "apple-touch-icon.png");

      if (fs.existsSync(sourceIcon)) {
        fs.copyFileSync(sourceIcon, distIcon);
        console.log("[PWA] Copied apple-touch-icon.png to dist/public");
      }
    },
  };
}


const plugins = [
  react(),
  tailwindcss(),
  jsxLocPlugin(),
  vitePluginManusRuntime(),
  copyAppleIconPlugin(),
  VitePWA({
    registerType: "autoUpdate",
    includeAssets: [
      "favicon.ico",
      "robots.txt",
      "apple-touch-icon.png",
      "/icons/**/*.png",
      "/icons/**/*.svg",
    ],
    manifest: {
      name: "AusflugFinder",
      short_name: "AusflugFinder",
      description: "Plan and manage unforgettable family trips and adventures",
      theme_color: "#3b82f6",
      background_color: "#ffffff",
      display: "standalone",
      scope: "/",
      start_url: "/",
      orientation: "portrait-primary",
      categories: ["travel", "productivity"],
      icons: [
        {
          src: "/icons/icon-192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "/icons/icon-192-maskable.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "maskable",
        },
        {
          src: "/icons/icon-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "/icons/icon-512-maskable.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
      screenshots: [
        {
          src: "/icons/screenshot-1.png",
          sizes: "540x720",
          form_factor: "narrow",
          type: "image/png",
        },
        {
          src: "/icons/screenshot-2.png",
          sizes: "1280x720",
          form_factor: "wide",
          type: "image/png",
        },
      ],
      shortcuts: [
        {
          name: "Neue Planung",
          short_name: "Neue Planung",
          description: "Erstelle schnell einen neuen Ausflug",
          url: "/trips?create=true",
          icons: [
            {
              src: "/icons/new-trip.png",
              sizes: "192x192",
              type: "image/png",
            },
          ],
        },
      ],
    },
    workbox: {
      globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,jpeg,gif,woff,woff2,ttf,eot}"],
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      skipWaiting: true,
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: "CacheFirst",
          options: {
            cacheName: "google-fonts-cache",
            expiration: {
              maxEntries: 20,
              maxAgeSeconds: 60 * 60 * 24 * 365,
            },
          },
        },
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
          handler: "CacheFirst",
          options: {
            cacheName: "google-fonts-static-cache",
            expiration: {
              maxEntries: 20,
              maxAgeSeconds: 60 * 60 * 24 * 365,
            },
          },
        },
        {
          urlPattern: /^\/api\/.*/i,
          handler: "NetworkFirst",
          options: {
            cacheName: "api-cache",
            networkTimeoutSeconds: 10,
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24,
            },
          },
        },
      ],
    },
  }),
];

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    host: true,
    allowedHosts: "all",
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
