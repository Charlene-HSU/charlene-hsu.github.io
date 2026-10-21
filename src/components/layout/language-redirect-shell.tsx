import { Link } from "@tanstack/react-router";
import { buttonVariants } from "@/components/ui/button";
import { site } from "@/lib/content";
import { languages, t } from "@/lib/i18n";

export function LanguageRedirectShell() {
  return (
    <main className="mx-auto flex min-h-screen max-w-content flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="font-mono text-body text-gray">{t(site.ui.redirect.message, "en")}</p>
      <noscript>
        <div className="flex flex-col items-center gap-4 rounded-lg border border-rule bg-surface p-6">
          <p className="font-mono text-body text-foreground">
            {t(site.ui.redirect.chooseLanguage, "en")} /{" "}
            {t(site.ui.redirect.chooseLanguage, "zh-TW")}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {languages.map((locale) => (
              <Link
                key={locale}
                to="/$lang/"
                params={{ lang: locale }}
                className={buttonVariants({ variant: "outline" })}
              >
                {site.ui.languages[locale]}
              </Link>
            ))}
          </div>
        </div>
      </noscript>
    </main>
  );
}
