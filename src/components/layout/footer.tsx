import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { contact, friends, profile, site } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import { BrandIcon, NavIcon } from "@/lib/icons";
import { pageRoutes } from "@/lib/pages";

export function Footer() {
  const { lang, t } = useI18n();

  return (
    <footer className="w-full border-t border-rule bg-surface px-6 py-16">
      <div className="mx-auto flex w-full max-w-content flex-col gap-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
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

          <div className="flex flex-col gap-3">
            <h2 className="font-mono text-body font-bold text-foreground">
              {t(site.ui.footer.navHeading)}
            </h2>
            <ul className="flex flex-col gap-2">
              {site.nav.map((item) => (
                <li key={item.id}>
                  <Link
                    to={pageRoutes[item.id]}
                    params={{ lang }}
                    className="inline-flex items-center gap-2 font-mono text-body text-gray transition-colors hover:text-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
                  >
                    <NavIcon name={item.icon} className="size-3.5" />
                    <span>{t(item.label)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-mono text-body font-bold text-foreground">
              {t(site.ui.footer.friendsHeading)}
            </h2>
            <ul className="flex flex-col gap-2">
              {friends.items.map((friend) => (
                <li key={friend.url}>
                  <a
                    href={friend.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-mono text-body text-gray transition-colors hover:text-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
                  >
                    <span>{t(friend.name)}</span>
                    <ExternalLink className="size-3 shrink-0" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-mono text-body font-bold text-foreground">
              {t(site.ui.footer.socialHeading)}
            </h2>
            <ul className="flex flex-col gap-2">
              {contact.links.map((social) => (
                <li key={social.url}>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-mono text-body text-gray transition-colors hover:text-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
                  >
                    <BrandIcon name={social.icon} className="size-3.5" />
                    <span>{t(social.label)}</span>
                    <ExternalLink className="size-3 shrink-0" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-6 font-mono text-caption text-gray">
          <span>{t(site.ui.footer.license)}</span>
          <a
            href={site.meta.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-gray transition-colors hover:text-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
          >
            <BrandIcon name="github" className="size-3.5" />
            <span>{t(site.ui.footer.sourceLink)}</span>
            <ExternalLink className="size-3 shrink-0" aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}
