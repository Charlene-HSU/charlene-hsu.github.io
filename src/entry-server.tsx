import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "@/routeTree.gen";
import { site } from "@/lib/content";
import { languages, t, type Lang } from "@/lib/i18n";

export async function renderRoute(urlPath: string, basepath: string = "/"): Promise<string> {
  const memoryHistory = createMemoryHistory({
    initialEntries: [urlPath],
  });

  const router = createRouter({
    routeTree,
    history: memoryHistory,
    basepath,
    trailingSlash: "always",
  });

  await router.load();

  return renderToString(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}

export function getPageMetadata(lang?: Lang) {
  const resolvedLang: Lang = lang ?? "en";
  return {
    lang: resolvedLang,
    languages,
    siteUrl: site.meta.url.replace(/\/$/, ""),
    siteName: t(site.meta.siteName, resolvedLang),
    title: t(site.meta.title, resolvedLang),
    description: t(site.meta.description, resolvedLang),
  };
}
