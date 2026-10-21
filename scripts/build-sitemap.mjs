import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");
const DIST_DIR = path.join(ROOT_DIR, "dist");
const DIST_SSR_DIR = path.join(ROOT_DIR, "dist-ssr");

async function buildSitemap() {
  // Same page list as the prerenderer, so the sitemap never disagrees with the built pages.
  const { getPublicPages, getSiteInfo } = await import(
    pathToFileURL(path.join(DIST_SSR_DIR, "entry-server.js")).href
  );
  const { siteUrl } = getSiteInfo();
  const cleanBase = (process.env.BASE_PATH || "/").replace(/\/$/, "");
  const abs = (p) => `${siteUrl}${cleanBase}${p}`;

  // Only canonical pages: a post shown in a fallback language points elsewhere.
  const pages = getPublicPages().filter((page) => page.canonicalPath === page.path);

  const urlsXml = pages
    .map((page) => {
      const alternates = Object.entries(page.alternates);
      const lines = ["  <url>", `    <loc>${abs(page.path)}</loc>`];
      for (const [lang, altPath] of alternates) {
        lines.push(`    <xhtml:link rel="alternate" hreflang="${lang}" href="${abs(altPath)}" />`);
      }
      if (alternates.length > 0) {
        const defaultPath = page.alternates.en ?? alternates[0][1];
        lines.push(
          `    <xhtml:link rel="alternate" hreflang="x-default" href="${abs(defaultPath)}" />`,
        );
      }
      lines.push("  </url>");
      return lines.join("\n");
    })
    .join("\n");

  const sitemapXml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    urlsXml,
    "</urlset>",
    "",
  ].join("\n");

  const robotsTxt = ["User-agent: *", "Allow: /", `Sitemap: ${abs("/sitemap.xml")}`, ""].join("\n");

  fs.mkdirSync(DIST_DIR, { recursive: true });
  fs.writeFileSync(path.join(DIST_DIR, "sitemap.xml"), sitemapXml, "utf-8");
  fs.writeFileSync(path.join(DIST_DIR, "robots.txt"), robotsTxt, "utf-8");
  console.log(`[sitemap] Wrote ${pages.length} URLs`);

  // Last build step: the temporary SSR bundle is no longer needed.
  fs.rmSync(DIST_SSR_DIR, { recursive: true, force: true });
}

buildSitemap().catch((err) => {
  console.error("[sitemap] Failed:", err);
  process.exit(1);
});
