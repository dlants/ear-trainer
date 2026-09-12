import { defineConfig, type Plugin } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  appType: "mpa",
  plugins: [
    spaFallback(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["apple-touch-icon.png"],
      workbox: {
        // Soundfont samples are fetched from a CDN at runtime; everything the
        // app itself needs is precached so a cold offline launch works.
        globPatterns: ["**/*.{js,css,html,png,svg,woff2}"],
      },
      manifest: {
        name: "ear trainer",
        short_name: "ear trainer",
        description: "functional ear training drills",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#1a2238",
        theme_color: "#1a2238",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
  base: "/",
  root: import.meta.dirname,
  build: {
    target: "esnext",
    outDir: "dist",
    minify: true,
  },
  server: {
    host: "localhost",
    port: Number(process.env.VITE_PORT ?? 5173),
    strictPort: true,
  },
});

function spaFallback(): Plugin {
  return {
    name: "spa-fallback",
    configureServer(server) {
      return () => {
        server.middlewares.use((req, _res, next) => {
          if (req.headers.accept?.includes("text/html") && req.url) {
            req.url = "/index.html";
          }
          next();
        });
      };
    },
  };
}
