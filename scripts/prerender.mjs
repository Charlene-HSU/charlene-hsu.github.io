import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

process.env.TZ = "Asia/Taipei";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");
const DIST_DIR = path.join(ROOT_DIR, "dist");
const DIST_SSR_ENTRY = path.join(ROOT_DIR, "dist-ssr/entry-server.js");

function escapeHtmlAttr(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildHeadTags({ meta, canonicalPath, isRootRedirect, basePath }) {
  const cleanBase = basePath.replace(/\/$/, "");
  const canonicalUrl = `${meta.siteUrl}${cleanBase}${canonicalPath}`;
  const enUrl = `${meta.siteUrl}${cleanBase}/en/`;
  const zhUrl = `${meta.siteUrl}${cleanBase}/zh-TW/`;

  const tags = [
    `<meta name="description" content="${escapeHtmlAttr(meta.description)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${escapeHtmlAttr(meta.siteName)}" />`,
    `<meta property="og:title" content="${escapeHtmlAttr(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtmlAttr(meta.description)}" />`,
    `<meta property="og:url" content="${escapeHtmlAttr(canonicalUrl)}" />`,
    `<meta property="og:locale" content="${meta.lang === "zh-TW" ? "zh_TW" : "en_US"}" />`,
    `<link rel="canonical" href="${escapeHtmlAttr(canonicalUrl)}" />`,
    `<link rel="alternate" hreflang="en" href="${escapeHtmlAttr(enUrl)}" />`,
    `<link rel="alternate" hreflang="zh-TW" href="${escapeHtmlAttr(zhUrl)}" />`,
    `<link rel="alternate" hreflang="x-default" href="${escapeHtmlAttr(enUrl)}" />`,
  ];

  if (isRootRedirect) {
    const inlineDetectScript = `<script>(function(){try{var s=localStorage.getItem("site_lang");var l=(s==="en"||s==="zh-TW")?s:null;if(!l){var nav=navigator.languages||[navigator.language||"en"];for(var i=0;i<nav.length;i++){var t=String(nav[i]).toLowerCase();if(t.indexOf("zh")===0){l="zh-TW";break;}if(t.indexOf("en")===0){l="en";break;}}}l=l||"en";var b=${JSON.stringify(cleanBase)};location.replace(b+"/"+l+"/"+location.search+location.hash);}catch(e){}})();</script>`;
    tags.push(inlineDetectScript);
  }

  return tags.join("\n    ");
}

async function runPrerender() {
  const templateHtml = fs.readFileSync(path.join(DIST_DIR, "index.html"), "utf-8");
  const basePath = process.env.BASE_PATH || "/";
  const { renderRoute, getPageMetadata } = await import(pathToFileURL(DIST_SSR_ENTRY).href);

  const routesToPrerender = [
    { routePath: "/", outFile: "index.html", lang: undefined, isRootRedirect: true },
    { routePath: "/en/", outFile: "en/index.html", lang: "en", isRootRedirect: false },
    { routePath: "/zh-TW/", outFile: "zh-TW/index.html", lang: "zh-TW", isRootRedirect: false },
  ];

  for (const item of routesToPrerender) {
    const appHtml = await renderRoute(item.routePath, "/");
    const meta = getPageMetadata(item.lang);
    const headTags = buildHeadTags({
      meta,
      canonicalPath: item.routePath,
      isRootRedirect: item.isRootRedirect,
      basePath,
    });

    const html = templateHtml
      .replace(/<html lang="[^"]*"/, `<html lang="${meta.lang}"`)
      .replace(
        /<title>[\s\S]*?<\/title>/,
        `<title>${escapeHtmlAttr(meta.title)}</title>\n    ${headTags}`,
      )
      .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);

    const targetPath = path.join(DIST_DIR, item.outFile);
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, html, "utf-8");
  }

  // Copy index.html to 404.html for GitHub Pages root fallback
  fs.copyFileSync(path.join(DIST_DIR, "index.html"), path.join(DIST_DIR, "404.html"));

  // Clean up temporary SSR bundle directory
  fs.rmSync(path.join(ROOT_DIR, "dist-ssr"), { recursive: true, force: true });
}

runPrerender().catch((err) => {
  console.error("[prerender] Failed:", err);
  process.exit(1);
});
