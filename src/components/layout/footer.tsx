import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { profile, site } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import { NavIcon } from "@/lib/icons";
import { pageRoutes } from "@/lib/pages";
import { cn } from "@/lib/utils";
import type { FooterContent } from "@/types/content";

// Static class names so Tailwind generates them; phones show at most two columns.
const columnClasses: Record<FooterContent["columns"], string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
};

const linkClassName =
  "inline-flex items-center gap-2 font-mono text-body text-gray transition-colors hover:text-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue";

function FooterBottomLink() {
  const { lang, t } = useI18n();
  const { page, url, label } = site.footer.bottomLink;
  const text = t(label);

  if (page) {
    const entry = site.nav.find((item) => item.id === page);
    return (
      <Link to={pageRoutes[page]} params={{ lang }} className={cn(linkClassName, "text-caption")}>
        {entry ? <NavIcon name={entry.icon} className="size-3.5" /> : null}
        <span>{text}</span>
      </Link>
    );
  }

  const isExternal = url?.startsWith("https://") ?? false;
  return (
    <a
      href={url}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn(linkClassName, "text-caption")}
    >
      <span>{text}</span>
      {isExternal ? <ExternalLink className="size-3 shrink-0" aria-hidden="true" /> : null}
    </a>
  );
}

export function Footer() {
  const { lang, t } = useI18n();
  const footerPages = site.footer.links
    .map((id) => site.nav.find((item) => item.id === id))
    .filter((item) => item !== undefined);

  return (
    <footer className="w-full border-t border-rule bg-surface px-6 py-16">
      <div className="mx-auto flex w-full max-w-content flex-col gap-12">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div className="flex flex-col gap-3">
            <Link
              to="/$lang/"
              params={{ lang }}
              className="inline-flex w-fit items-center gap-2 font-mono text-h2 font-bold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
            >
              <span className="text-green">{site.ui.brand}</span>
              <span>{t(profile.name)}</span>
            </Link>
            <p className="font-sans text-body text-gray">{t(profile.tagline)}</p>
          </div>

          {footerPages.length > 0 ? (
            <nav aria-labelledby="footer-nav-heading" className="flex flex-col gap-3">
              <h2 id="footer-nav-heading" className="font-mono text-body font-bold text-foreground">
                {t(site.ui.footer.navHeading)}
              </h2>
              <ul className={cn("grid gap-x-12 gap-y-2", columnClasses[site.footer.columns])}>
                {footerPages.map((item) => (
                  <li key={item.id}>
                    <Link to={pageRoutes[item.id]} params={{ lang }} className={linkClassName}>
                      <NavIcon name={item.icon} className="size-3.5" />
                      <span>{t(item.label)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-6 font-mono text-caption text-gray">
          <span>{t(site.ui.footer.license)}</span>
          <FooterBottomLink />
        </div>
      </div>
    </footer>
  );
}
