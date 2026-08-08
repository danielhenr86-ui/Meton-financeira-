import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

function metonCfoDevApi() {
  return {
    name: "meton-cfo-dev-api",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        if ((request.url || "").split("?")[0] !== "/api/cfo") return next();
        response.setHeader("Content-Type", "application/json; charset=utf-8");
        response.setHeader("Cache-Control", "no-store");
        if (request.method !== "POST") {
          response.statusCode = 405;
          response.setHeader("Allow", "POST");
          response.end(JSON.stringify({ error: "method_not_allowed", message: "Use POST /api/cfo." }));
          return;
        }

        try {
          let raw = "";
          for await (const chunk of request) {
            raw += chunk;
            if (raw.length > 100_000) {
              response.statusCode = 413;
              response.end(JSON.stringify({ error: "payload_too_large", message: "A fotografia financeira excedeu o limite permitido." }));
              return;
            }
          }
          let body;
          try {
            body = JSON.parse(raw || "{}");
          } catch {
            response.statusCode = 400;
            response.end(JSON.stringify({ error: "invalid_json", message: "JSON invalido." }));
            return;
          }
          const { analyzeCfo, toPublicCfoError } = await import("./api/_cfoAgent.js");
          try {
            const analysis = await analyzeCfo(body);
            response.statusCode = 200;
            response.end(JSON.stringify({ analysis }));
          } catch (error) {
            const publicError = toPublicCfoError(error);
            response.statusCode = publicError.status;
            response.end(JSON.stringify(publicError.body));
          }
        } catch {
          response.statusCode = 500;
          response.end(JSON.stringify({ error: "dev_api_error", message: "Falha no endpoint local do CFO Copilot." }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [
    metonCfoDevApi(),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "icon.svg"],
      manifest: {
        name: "Meton Financeira",
        short_name: "Meton",
        description: "Sua visão panorâmica das finanças pessoais e da empresa.",
        theme_color: "#14532d",
        background_color: "#14532d",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        lang: "pt-BR",
        categories: ["finance", "productivity"],
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // aumenta o limite para o bundle do app (~670kb)
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
        runtimeCaching: [
          {
            // fontes do Google: cacheia para funcionar offline
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
});
