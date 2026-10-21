import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");
const DIST_DIR = path.join(ROOT_DIR, "dist");

const PUBLIC_PAGES = ["/", "/en/", "/zh-TW/"];

function buildSitemap() {
  const siteYaml = YAML.parse(
    fs.readFileSync(path.join(ROOT_DIR, "src/content/site.yaml"), "utf-8"),
  );
  const origin = String(siteYaml.meta.url).replace(/\/$/, "");
  const basePath = (process.env.BASE_PATH || "/").replace(/\/$/, "");

  const urlsXml = PUBLIC_PAGES.map((pagePath) => {
    const fullUrl = `${origin}${basePath}${pagePath}`;
    const enAlt = `${origin}${basePath}/en/`;
    const zhAlt = `${origin}${basePath}/zh-TW/`;
    return [
      "  <url>",
      `    <loc>${fullUrl}</loc>`,
      `    <xhtml:link rel="alternate" hreflang="en" href="${enAlt}" />`,
      `    <xhtml:link rel="alternate" hreflang="zh-TW" href="${zhAlt}" />`,
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${enAlt}" />`,
      "  </url>",
    ].join("\n");
  }).join("\n");

  const sitemapXml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    urlsXml,
    "</urlset>",
    "",
  ].join("\n");

  const robotsTxt = [
    "User-agent: *",
    "Allow: /",
    `Sitemap: ${origin}${basePath}/sitemap.xml`,
    "",
  ].join("\n");

  fs.mkdirSync(DIST_DIR, { recursive: true });
  fs.writeFileSync(path.join(DIST_DIR, "sitemap.xml"), sitemapXml, "utf-8");
  fs.writeFileSync(path.join(DIST_DIR, "robots.txt"), robotsTxt, "utf-8");
}

buildSitemap();
