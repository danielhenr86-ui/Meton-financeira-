import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

/* ------------------------------------------------------------------
   base do site.
   - Vercel / dominio proprio: fica "/" (padrao)
   - GitHub Pages em subpasta: o workflow define VITE_BASE=/Meton-financeira-/
   Sem isso, o app procura os arquivos na raiz do dominio e abre em branco.
   ------------------------------------------------------------------ */
const base = process.env.VITE_BASE || "/";

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "icon.svg"],
      manifest: {
        name: "MetOn Financeira",
        short_name: "MetOn",
        description: "Sua visão panorâmica das finanças pessoais e da empresa.",
        theme_color: "#0E1B17",
        background_color: "#0E1B17",
        display: "standalone",
        orientation: "portrait",
        // scope e start_url acompanham o base, senao o app instalado abre em 404
        scope: base,
        start_url: base,
        lang: "pt-BR",
        categories: ["finance", "productivity"],
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
        runtimeCaching: [
          {
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
