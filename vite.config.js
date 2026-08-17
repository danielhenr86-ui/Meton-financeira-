import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

function fixMetonStableHooks() {
  return {
    name: "fix-meton-stable-hooks",
    enforce: "pre",
    transform(code, id) {
      if (!id.replace(/\\/g, "/").endsWith("/src/MetonStable.jsx")) return null;

      let next = code.replace(
        "import React,{useEffect,useMemo,useState}from'react';",
        "import React,{useEffect,useState}from'react';"
      );
      next = next.replace(
        "const ctrl=useMemo(()=>calcController(data,balance,income,expense,result),[data,balance,income,expense,result]);",
        "const ctrl=calcController(data,balance,income,expense,result);"
      );

      if (next === code) {
        throw new Error("MetonStable hook patch was not applied; aborting build to avoid publishing a blank-screen regression.");
      }
      return { code: next, map: null };
    },
  };
}

export default defineConfig({
  plugins: [
    fixMetonStableHooks(),
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
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
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
