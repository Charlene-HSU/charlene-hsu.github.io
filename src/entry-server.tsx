import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "@/routeTree.gen";
import { site } from "@/lib/content";
import { languages, t, type Lang } from "@/lib/i18n";
import { getPublicPages } from "@/lib/pages";

export { getPublicPages };

/** Path the prerenderer renders into `404.html`: an invalid language, so the root not-found page shows. */
export const NOT_FOUND_RENDER_PATH = "/404/";

export async function renderRoute(urlPath: string, basepath: string = "/"): Promise<string> {
  const cleanBase = basepath.replace(/\/$/, "");
  const memoryHistory = createMemoryHistory({
    initialEntries: [`${cleanBase}${urlPath}`],
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

export function getSiteInfo() {
  return {
    siteUrl: site.meta.url.replace(/\/$/, ""),
    languages,
    siteName: (lang: Lang) => t(site.meta.siteName, lang),
    home: (lang: Lang) => ({
      title: t(site.meta.title, lang),
      description: t(site.meta.description, lang),
    }),
    notFoundTitle: t(site.ui.notFound.title, "en"),
  };
}
