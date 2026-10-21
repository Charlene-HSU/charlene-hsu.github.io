import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

process.env.TZ = "Asia/Taipei";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");
const DIST_DIR = path.join(ROOT_DIR, "dist");
const DIST_SSR_ENTRY = path.join(ROOT_DIR, "dist-ssr/entry-server.js");

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function ogLocale(lang) {
  return lang === "zh-TW" ? "zh_TW" : "en_US";
}

function buildHeadTags({
  siteUrl,
  cleanBase,
  lang,
  siteName,
  title,
  description,
  canonicalPath,
  alternates = {},
  noindex = false,
  inlineScript,
}) {
  const abs = (p) => `${siteUrl}${cleanBase}${p}`;
  const tags = [
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${escapeHtml(siteName)}" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:locale" content="${ogLocale(lang)}" />`,
  ];

  if (noindex) {
    tags.push(`<meta name="robots" content="noindex" />`);
  }

  if (canonicalPath) {
    tags.push(`<meta property="og:url" content="${escapeHtml(abs(canonicalPath))}" />`);
    tags.push(`<link rel="canonical" href="${escapeHtml(abs(canonicalPath))}" />`);
  }

  const alternateEntries = Object.entries(alternates);
  for (const [altLang, altPath] of alternateEntries) {
    tags.push(`<link rel="alternate" hreflang="${altLang}" href="${escapeHtml(abs(altPath))}" />`);
  }
  if (alternateEntries.length > 0) {
    const defaultPath = alternates.en ?? alternateEntries[0][1];
    tags.push(
      `<link rel="alternate" hreflang="x-default" href="${escapeHtml(abs(defaultPath))}" />`,
    );
  }

  if (inlineScript) {
    tags.push(inlineScript);
  }

  return tags.join("\n    ");
}

function languageRedirectScript(cleanBase) {
  return `<script>(function(){try{var s=localStorage.getItem("site_lang");var l=(s==="en"||s==="zh-TW")?s:null;if(!l){var nav=navigator.languages||[navigator.language||"en"];for(var i=0;i<nav.length;i++){var t=String(nav[i]).toLowerCase();if(t.indexOf("zh")===0){l="zh-TW";break;}if(t.indexOf("en")===0){l="en";break;}}}l=l||"en";var b=${JSON.stringify(cleanBase)};location.replace(b+"/"+l+"/"+location.search+location.hash);}catch(e){}})();</script>`;
}

function fillTemplate(templateHtml, { lang, title, headTags, appHtml, rootAttrs = "" }) {
  return templateHtml
    .replace(/<html lang="[^"]*"/, `<html lang="${lang}"`)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>\n    ${headTags}`)
    .replace('<div id="root"></div>', `<div id="root"${rootAttrs}>${appHtml}</div>`);
}

function writePage(urlPath, html) {
  const relative = urlPath.replace(/^\//, "");
  const targetPath = path.join(DIST_DIR, relative, "index.html");
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, html, "utf-8");
}

async function runPrerender() {
  const templateHtml = fs.readFileSync(path.join(DIST_DIR, "index.html"), "utf-8");
  const basePath = process.env.BASE_PATH || "/";
  const cleanBase = basePath.replace(/\/$/, "");
  const { renderRoute, getPublicPages, getSiteInfo, NOT_FOUND_RENDER_PATH } = await import(
    pathToFileURL(DIST_SSR_ENTRY).href
  );
  const info = getSiteInfo();
  const pages = getPublicPages();

  // `/`: language detection shell.
  {
    const home = info.home("en");
    const alternates = Object.fromEntries(info.languages.map((lang) => [lang, `/${lang}/`]));
    const headTags = buildHeadTags({
      siteUrl: info.siteUrl,
      cleanBase,
      lang: "en",
      siteName: info.siteName("en"),
      title: home.title,
      description: home.description,
      canonicalPath: "/",
      alternates,
      inlineScript: languageRedirectScript(cleanBase),
    });
    const appHtml = await renderRoute("/", basePath);
    writePage(
      "/",
      fillTemplate(templateHtml, { lang: "en", title: home.title, headTags, appHtml }),
    );
  }

  // Every language page and blog post.
  for (const page of pages) {
    const headTags = buildHeadTags({
      siteUrl: info.siteUrl,
      cleanBase,
      lang: page.lang,
      siteName: info.siteName(page.lang),
      title: page.title,
      description: page.description,
      canonicalPath: page.canonicalPath,
      alternates: page.alternates,
    });
    const appHtml = await renderRoute(page.path, basePath);
    writePage(
      page.path,
      fillTemplate(templateHtml, { lang: page.lang, title: page.title, headTags, appHtml }),
    );
  }

  // 404.html: bilingual not-found page, served by GitHub Pages for unknown paths.
  // Its HTML was rendered for NOT_FOUND_RENDER_PATH, not the URL the visitor asked for,
  // so `data-hydrate="false"` tells main.tsx to render it fresh instead of hydrating.
  {
    const title = info.notFoundTitle;
    const headTags = buildHeadTags({
      siteUrl: info.siteUrl,
      cleanBase,
      lang: "en",
      siteName: info.siteName("en"),
      title,
      description: info.home("en").description,
      noindex: true,
    });
    const appHtml = await renderRoute(NOT_FOUND_RENDER_PATH, basePath);
    fs.writeFileSync(
      path.join(DIST_DIR, "404.html"),
      fillTemplate(templateHtml, {
        lang: "en",
        title,
        headTags,
        appHtml,
        rootAttrs: ' data-hydrate="false"',
      }),
      "utf-8",
    );
  }

  console.log(`[prerender] Wrote ${pages.length + 1} pages and 404.html`);
}

runPrerender().catch((err) => {
  console.error("[prerender] Failed:", err);
  process.exit(1);
});
