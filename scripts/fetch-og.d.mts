export interface OgMetadata {
  title: string;
  description?: string;
  siteName: string;
}

export interface OgCacheEntry {
  url: string;
  title?: string;
  description?: string;
  siteName?: string;
  fetchedAt: string;
}

export interface LookupRecord {
  address: string;
  family?: number;
}

export type LookupFn = (hostname: string, options: { all: true }) => Promise<LookupRecord[]>;

export const USER_AGENT: string;
export const TIMEOUT_MS: number;
export const MAX_REDIRECTS: number;
export const MAX_BYTES: number;
export const CACHE_TTL_MS: number;

export function normalizeUrl(rawUrl: string): string;
export function isPrivateOrLoopbackIp(ip: string): boolean;
export function assertSafeHostname(hostname: string, lookupFn?: LookupFn): Promise<void>;
export function extractOgMetadata(html: string, fallbackDomain: string): OgMetadata;
export function isCacheEntryFresh(
  entry: Pick<OgCacheEntry, "fetchedAt"> | undefined | null,
  nowMs?: number,
): boolean;
export function fetchHtmlBounded(
  initialUrl: string,
  options?: { fetchImpl?: typeof fetch; lookupFn?: LookupFn },
): Promise<string>;
export function collectMarkdownStandaloneUrls(markdownContent: string): string[];
export function collectAllTargetUrls(rootDir?: string): string[];
export function runFetchOg(options?: { forceRefresh?: boolean }): Promise<void>;
