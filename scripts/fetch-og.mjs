import dns from "node:dns/promises";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import YAML from "yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");
const CACHE_PATH = path.join(ROOT_DIR, "src/content/.generated/og.json");

export const USER_AGENT = "PersonalWeb-OGFetcher/1.0 (+https://github.com)";
export const TIMEOUT_MS = 5000;
export const MAX_REDIRECTS = 3;
export const MAX_BYTES = 512 * 1024; // 512 KB
export const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export function normalizeUrl(rawUrl) {
  const parsed = new URL(rawUrl.trim());
  if (parsed.protocol !== "https:") {
    throw new Error(`Only https:// URLs are allowed: ${rawUrl}`);
  }
  parsed.hash = "";
  return parsed.toString();
}

export function isPrivateOrLoopbackIp(ip) {
  const version = net.isIP(ip);
  if (version === 4) {
    const parts = ip.split(".").map(Number);
    const [a, b] = parts;
    if (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      a >= 224
    ) {
      return true;
    }
    return false;
  }
  if (version === 6) {
    const lower = ip.toLowerCase();
    if (
      lower === "::1" ||
      lower === "::" ||
      lower.startsWith("fc") ||
      lower.startsWith("fd") ||
      lower.startsWith("fe8") ||
      lower.startsWith("fe9") ||
      lower.startsWith("fea") ||
      lower.startsWith("feb") ||
      lower.startsWith("::ffff:127.") ||
      lower.startsWith("::ffff:10.") ||
      lower.startsWith("::ffff:192.168.")
    ) {
      return true;
    }
    return false;
  }
  return true;
}

export async function assertSafeHostname(hostname, lookupFn = dns.lookup) {
  const cleanHost = hostname.trim().toLowerCase();
  if (
    cleanHost === "localhost" ||
    cleanHost.endsWith(".localhost") ||
    cleanHost.endsWith(".local") ||
    cleanHost.endsWith(".internal")
  ) {
    throw new Error(`Rejected loopback or local hostname: ${hostname}`);
  }
  if (net.isIP(cleanHost)) {
    if (isPrivateOrLoopbackIp(cleanHost)) {
      throw new Error(`Rejected private or loopback IP literal: ${hostname}`);
    }
    return;
  }
  const records = await lookupFn(cleanHost, { all: true });
  if (!records || records.length === 0) {
    throw new Error(`DNS lookup returned no records for ${hostname}`);
  }
  for (const record of records) {
    if (isPrivateOrLoopbackIp(record.address)) {
      throw new Error(
        `Rejected private/loopback DNS resolution (${record.address}) for ${hostname}`,
      );
    }
  }
}

function decodeHtmlEntities(str) {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .trim();
}

export function extractOgMetadata(html, fallbackDomain) {
  const getMetaContent = (attrName, attrValue) => {
    const escaped = attrValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex1 = new RegExp(
      `<meta[^>]+${attrName}=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`,
      "i",
    );
    const match1 = html.match(regex1);
    if (match1?.[1]) return decodeHtmlEntities(match1[1]);

    const regex2 = new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+${attrName}=["']${escaped}["'][^>]*>`,
      "i",
    );
    const match2 = html.match(regex2);
    if (match2?.[1]) return decodeHtmlEntities(match2[1]);

    return undefined;
  };

  const ogTitle = getMetaContent("property", "og:title") ?? getMetaContent("name", "twitter:title");
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const htmlTitle = titleMatch?.[1]
    ? decodeHtmlEntities(titleMatch[1].replace(/\s+/g, " "))
    : undefined;

  const ogDesc =
    getMetaContent("property", "og:description") ??
    getMetaContent("name", "description") ??
    getMetaContent("name", "twitter:description");

  const ogSiteName = getMetaContent("property", "og:site_name") ?? fallbackDomain;

  return {
    title: ogTitle || htmlTitle || fallbackDomain,
    description: ogDesc,
    siteName: ogSiteName || fallbackDomain,
  };
}

export function isCacheEntryFresh(entry, nowMs = Date.now()) {
  if (!entry || !entry.fetchedAt) return false;
  const fetchedMs = Date.parse(entry.fetchedAt);
  if (Number.isNaN(fetchedMs)) return false;
  return nowMs - fetchedMs < CACHE_TTL_MS;
}

export async function fetchHtmlBounded(
  initialUrl,
  { fetchImpl = globalThis.fetch, lookupFn = dns.lookup } = {},
) {
  let currentUrl = normalizeUrl(initialUrl);

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
    const parsed = new URL(currentUrl);
    if (parsed.protocol !== "https:") {
      throw new Error(`Redirected to non-https protocol: ${currentUrl}`);
    }
    await assertSafeHostname(parsed.hostname, lookupFn);

    const response = await fetchImpl(currentUrl, {
      method: "GET",
      redirect: "manual",
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (response.status >= 300 && response.status < 400) {
      const locationHeader = response.headers.get("location");
      if (!locationHeader) {
        throw new Error(`Redirect response missing Location header at ${currentUrl}`);
      }
      currentUrl = new URL(locationHeader, currentUrl).toString();
      continue;
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} when fetching ${currentUrl}`);
    }

    if (!response.body) {
      const text = await response.text();
      return text.slice(0, MAX_BYTES);
    }

    const reader = response.body.getReader();
    const chunks = [];
    let received = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.byteLength;
      if (received >= MAX_BYTES) {
        await reader.cancel();
        break;
      }
    }
    const combined = Buffer.concat(chunks, Math.min(received, MAX_BYTES));
    return combined.toString("utf-8");
  }

  throw new Error(`Too many redirects while fetching ${initialUrl}`);
}

export function collectMarkdownStandaloneUrls(markdownContent) {
  const urls = new Set();
  const lines = markdownContent.split(/\r?\n/);
  let inCodeFence = false;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (trimmed.startsWith("```")) {
      inCodeFence = !inCodeFence;
      continue;
    }
    if (inCodeFence) continue;
    if (/^https:\/\/\S+$/.test(trimmed)) {
      urls.add(trimmed);
    }
  }
  return [...urls];
}

function walkFiles(dirPath, ext) {
  if (!fs.existsSync(dirPath)) return [];
  const results = [];
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkFiles(fullPath, ext));
    } else if (entry.name.endsWith(ext)) {
      results.push(fullPath);
    }
  }
  return results;
}

export function collectAllTargetUrls(rootDir = ROOT_DIR) {
  const urls = new Set();
  const projectsPath = path.join(rootDir, "src/content/projects.yaml");
  if (fs.existsSync(projectsPath)) {
    const projectsData = YAML.parse(fs.readFileSync(projectsPath, "utf-8"));
    for (const item of projectsData?.items ?? []) {
      for (const link of item.links ?? []) {
        if (typeof link.url === "string" && link.url.startsWith("https://")) {
          urls.add(link.url);
        }
      }
      for (const embed of item.embeds ?? []) {
        if (
          embed.kind === "card" &&
          typeof embed.url === "string" &&
          embed.url.startsWith("https://")
        ) {
          urls.add(embed.url);
        }
      }
    }
  }

  const mdFiles = [
    ...walkFiles(path.join(rootDir, "src/content/md"), ".md"),
    ...walkFiles(path.join(rootDir, "src/content/blog"), ".md"),
  ];

  for (const mdFile of mdFiles) {
    const raw = fs.readFileSync(mdFile, "utf-8");
    for (const url of collectMarkdownStandaloneUrls(raw)) {
      urls.add(url);
    }
  }

  return [...urls];
}

export async function runFetchOg({ forceRefresh = false } = {}) {
  let cache = {};
  if (fs.existsSync(CACHE_PATH)) {
    try {
      cache = JSON.parse(fs.readFileSync(CACHE_PATH, "utf-8"));
    } catch {
      cache = {};
    }
  }

  const urls = collectAllTargetUrls();

  for (const rawUrl of urls) {
    let normalized;
    try {
      normalized = normalizeUrl(rawUrl);
    } catch {
      continue;
    }

    const existing = cache[normalized] ?? cache[rawUrl];
    if (!forceRefresh && isCacheEntryFresh(existing)) {
      cache[normalized] = existing;
      continue;
    }

    const domain = new URL(normalized).hostname.replace(/^www\./, "");
    try {
      const html = await fetchHtmlBounded(normalized);
      const meta = extractOgMetadata(html, domain);
      cache[normalized] = {
        url: normalized,
        title: meta.title,
        ...(meta.description ? { description: meta.description } : {}),
        siteName: meta.siteName,
        fetchedAt: new Date().toISOString(),
      };
    } catch {
      // Never fail the build: fall back to existing cache, then to domain name
      if (existing) {
        cache[normalized] = existing;
      } else {
        cache[normalized] = {
          url: normalized,
          title: domain,
          siteName: domain,
          fetchedAt: new Date(0).toISOString(),
        };
      }
    }
  }

  fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
  fs.writeFileSync(CACHE_PATH, `${JSON.stringify(cache, null, 2)}\n`, "utf-8");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const forceRefresh = process.argv.includes("--refresh");
  runFetchOg({ forceRefresh }).catch((err) => {
    console.warn("[fetch-og] Warning:", err);
  });
}
