import fs from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import ViteYaml from "@modyfi/vite-plugin-yaml";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { imagetools } from "vite-imagetools";
import Font from "vite-plugin-font";

const basePath = process.env.BASE_PATH || "/";

// Make `vite preview` behave like GitHub Pages: no SPA fallback to the `/` shell,
// and unknown paths get dist/404.html with a 404 status.
function pagesPreview(): Plugin {
  return {
    name: "pages-preview",
    config: (_, { isPreview }) => (isPreview ? { appType: "mpa" } : undefined),
    configurePreviewServer(server) {
      return () => {
        server.middlewares.use((req, res, next) => {
          const outDir = path.resolve(server.config.root, server.config.build.outDir);
          const notFoundPage = path.join(outDir, "404.html");
          // Vite serves `<dir>/index.html` after this hook, so let existing pages through.
          const pathname = decodeURIComponent((req.url ?? "/").split("?")[0]);
          const page = path.join(
            outDir,
            pathname.endsWith("/") ? `${pathname}index.html` : pathname,
          );
          if (req.method !== "GET" || fs.existsSync(page) || !fs.existsSync(notFoundPage)) {
            return next();
          }
          res.statusCode = 404;
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          res.end(fs.readFileSync(notFoundPage));
        });
      };
    },
  };
}

export default defineConfig({
  base: basePath,
  define: {
    // When this build was made; the home shortcuts use it until the page hydrates.
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  plugins: [
    pagesPreview(),
    TanStackRouterVite({
      target: "react",
      autoCodeSplitting: false,
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
    }),
    react(),
    tailwindcss(),
    ViteYaml(),
    imagetools({
      // Case-insensitive, so photos straight from a phone (`IMG_1234.JPG`) are processed too.
      include: /^[^?]+\.(avif|gif|heif|jpeg|jpg|png|tiff|webp)(\?.*)?$/i,
      defaultDirectives: (url) => {
        if (url.searchParams.has("responsive")) {
          return new URLSearchParams({
            format: "avif;webp",
            w: "480;960;1600",
            as: "picture",
          });
        }
        return new URLSearchParams();
      },
    }),
    Font({
      scanFiles: ["src/**/*.{ts,tsx,yaml,md}", "src/content/**/*.{yaml,md}"],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
