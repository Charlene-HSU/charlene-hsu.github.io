import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "@/routeTree.gen";
import "@/index.css";

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function createAppRouter() {
  return createRouter({
    routeTree,
    basepath: import.meta.env.BASE_URL,
    trailingSlash: "always",
    defaultHashScrollIntoView: {
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    },
  });
}

const router = createAppRouter();

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root");
if (rootElement) {
  const app = (
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  );

  if (rootElement.hasChildNodes()) {
    // Resolve the current route before hydrating so the first client render
    // matches the prerendered HTML.
    void router.load().then(() => {
      hydrateRoot(rootElement, app);
    });
  } else {
    createRoot(rootElement).render(app);
  }
}
