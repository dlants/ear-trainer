import { defineConfig, type Plugin } from "vite";

export default defineConfig({
  appType: "mpa",
  plugins: [spaFallback()],
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
