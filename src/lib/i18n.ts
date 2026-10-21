import { createContext, createElement, useContext, type ReactNode } from "react";
import { languages, type Lang, type Localized } from "@/types/content";

export { languages, type Lang };

const STORAGE_KEY = "site_lang";

export function isLang(value: unknown): value is Lang {
  return typeof value === "string" && (languages as readonly string[]).includes(value);
}

export function mapLocaleTagToLang(tag: string): Lang | null {
  const normalized = tag.trim().toLowerCase();
  if (normalized.startsWith("zh")) {
    return "zh-TW";
  }
  if (normalized.startsWith("en")) {
    return "en";
  }
  return null;
}

export function readStoredLang(): Lang | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return isLang(raw) ? raw : null;
  } catch {
    return null;
  }
}

export function writeStoredLang(lang: Lang): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Ignore storage quota or privacy mode errors
  }
}

export function detectLang(): Lang {
  const stored = readStoredLang();
  if (stored) {
    return stored;
  }
  if (typeof navigator !== "undefined") {
    const candidates =
      navigator.languages && navigator.languages.length > 0
        ? navigator.languages
        : navigator.language
          ? [navigator.language]
          : [];
    for (const tag of candidates) {
      const matched = mapLocaleTagToLang(tag);
      if (matched) {
        return matched;
      }
    }
  }
  return "en";
}

export function t(value: Localized, lang: Lang): string {
  if (typeof value === "string") {
    return value;
  }
  const primary = value[lang];
  if (typeof primary === "string" && primary.trim().length > 0) {
    return primary;
  }
  const fallbackLang: Lang = lang === "en" ? "zh-TW" : "en";
  const fallback = value[fallbackLang];
  if (import.meta.env.DEV) {
    console.warn(`[i18n] Missing "${lang}" translation, falling back to "${fallbackLang}".`, value);
  }
  return fallback ?? "";
}

export function formatTemplate(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    return Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : match;
  });
}

export function tf(value: Localized, lang: Lang, params: Record<string, string | number>): string {
  return formatTemplate(t(value, lang), params);
}

export function formatDate(dateStr: string, lang: Lang, timeZone: string = "Asia/Taipei"): string {
  const parts = dateStr.split("-").map(Number);
  const year = parts[0];
  const month = (parts[1] ?? 1) - 1;
  const day = parts[2];

  if (typeof day === "number" && !Number.isNaN(day)) {
    const date = new Date(Date.UTC(year, month, day, 4, 0, 0));
    return new Intl.DateTimeFormat(lang, {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone,
    }).format(date);
  }

  const date = new Date(Date.UTC(year, month, 1, 4, 0, 0));
  return new Intl.DateTimeFormat(lang, {
    year: "numeric",
    month: "short",
    timeZone,
  }).format(date);
}

export function formatNumber(value: number, lang: Lang): string {
  return new Intl.NumberFormat(lang).format(value);
}

export interface I18nContextValue {
  lang: Lang;
  t: (value: Localized) => string;
  tf: (value: Localized, params: Record<string, string | number>) => string;
  formatDate: (dateStr: string) => string;
  formatNumber: (value: number) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  const value: I18nContextValue = {
    lang,
    t: (val) => t(val, lang),
    tf: (val, params) => tf(val, lang, params),
    formatDate: (dateStr) => formatDate(dateStr, lang),
    formatNumber: (num) => formatNumber(num, lang),
  };

  return createElement(I18nContext.Provider, { value }, children);
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
