import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import ViteYaml from "@modyfi/vite-plugin-yaml";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { imagetools } from "vite-imagetools";
import Font from "vite-plugin-font";

const basePath = process.env.BASE_PATH || "/";

export default defineConfig({
  base: basePath,
  define: {
    // When this build was made; the home shortcuts use it until the page hydrates.
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  plugins: [
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
