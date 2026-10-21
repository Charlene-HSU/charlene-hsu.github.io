import { createFileRoute, redirect } from "@tanstack/react-router";
import { LanguageRedirectShell } from "@/components/layout/language-redirect-shell";
import { detectLang } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const lang = detectLang();
      throw redirect({
        to: "/$lang/",
        params: { lang },
        replace: true,
      });
    }
  },
  component: LanguageRedirectShell,
});
