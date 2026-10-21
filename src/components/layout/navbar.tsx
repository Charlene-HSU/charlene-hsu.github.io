import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Check, Globe, Menu as MenuIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  MenuItem,
  MenuPopup,
  MenuPortal,
  MenuPositioner,
  MenuRadioGroup,
  MenuRadioItem,
  MenuRoot,
  MenuTrigger,
} from "@/components/ui/menu";
import {
  TooltipPopup,
  TooltipPortal,
  TooltipPositioner,
  TooltipRoot,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { contact, site } from "@/lib/content";
import { languages, useI18n, writeStoredLang, type Lang } from "@/lib/i18n";
import { BrandIcon, NavIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { lang, t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();

  const githubLink =
    contact.links.find((item) => item.icon.toLowerCase() === "github")?.url ?? site.meta.repoUrl;

  const handleLanguageChange = (nextLang: Lang) => {
    writeStoredLang(nextLang);
    const currentHash = location.hash ? location.hash.replace(/^#/, "") : undefined;
    void navigate({
      to: "/$lang/",
      params: { lang: nextLang },
      search: (prev) => prev,
      hash: currentHash,
    });
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 px-6 pt-4">
      <div className="mx-auto flex h-control-lg max-w-content items-center justify-between gap-3 rounded-full border border-rule bg-black/35 px-4 backdrop-blur-md">
        <Link
          to="/$lang/"
          params={{ lang }}
          aria-label={t(site.ui.brandAriaLabel)}
          className="inline-flex items-center gap-1 rounded-full px-3 py-1 font-mono text-lead font-bold text-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
        >
          <span>{site.ui.brand}</span>
        </Link>

        {/* Desktop & Tablet Navigation */}
        <nav aria-label={t(site.ui.mainNavAriaLabel)} className="hidden items-center gap-1 md:flex">
          {site.nav.map((item) => {
            const label = t(item.label);
            return (
              <TooltipRoot key={item.id}>
                <TooltipTrigger
                  render={
                    <Link
                      to="/$lang/"
                      params={{ lang }}
                      hash={item.id}
                      aria-label={label}
                      className="inline-flex h-control items-center gap-2 rounded-full px-3 font-mono text-body text-gray transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
                    >
                      <NavIcon name={item.icon} />
                      <span className="hidden lg:inline">{label}</span>
                    </Link>
                  }
                />
                <TooltipPortal>
                  <TooltipPositioner className="lg:hidden">
                    <TooltipPopup>{label}</TooltipPopup>
                  </TooltipPositioner>
                </TooltipPortal>
              </TooltipRoot>
            );
          })}
        </nav>

        {/* Right Controls: Language Switcher, GitHub Link, Mobile Menu */}
        <div className="flex items-center gap-2">
          <MenuRoot>
            <MenuTrigger aria-label={t(site.ui.langSwitchAriaLabel)}>
              <Globe className="size-4" aria-hidden="true" />
            </MenuTrigger>
            <MenuPortal>
              <MenuPositioner>
                <MenuPopup>
                  <MenuRadioGroup
                    value={lang}
                    onValueChange={(val) => handleLanguageChange(val as Lang)}
                  >
                    {languages.map((locale) => (
                      <MenuRadioItem key={locale} value={locale}>
                        <span>{site.ui.languages[locale]}</span>
                        {lang === locale ? (
                          <Check className="size-3.5 text-green" aria-hidden="true" />
                        ) : null}
                      </MenuRadioItem>
                    ))}
                  </MenuRadioGroup>
                </MenuPopup>
              </MenuPositioner>
            </MenuPortal>
          </MenuRoot>

          <TooltipRoot>
            <TooltipTrigger
              render={
                <a
                  href={githubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t(site.ui.githubAriaLabel)}
                  className={cn(buttonVariants({ variant: "outline", size: "icon" }), "bg-surface")}
                >
                  <BrandIcon name="github" />
                </a>
              }
            />
            <TooltipPortal>
              <TooltipPositioner>
                <TooltipPopup>{t(site.ui.githubAriaLabel)}</TooltipPopup>
              </TooltipPositioner>
            </TooltipPortal>
          </TooltipRoot>

          {/* Mobile Navigation Menu */}
          <div className="md:hidden">
            <MenuRoot>
              <MenuTrigger aria-label={t(site.ui.mobileMenuAriaLabel)}>
                <MenuIcon className="size-4" aria-hidden="true" />
              </MenuTrigger>
              <MenuPortal>
                <MenuPositioner>
                  <MenuPopup>
                    {site.nav.map((item) => (
                      <MenuItem
                        key={item.id}
                        render={<Link to="/$lang/" params={{ lang }} hash={item.id} />}
                      >
                        <NavIcon name={item.icon} />
                        <span>{t(item.label)}</span>
                      </MenuItem>
                    ))}
                  </MenuPopup>
                </MenuPositioner>
              </MenuPortal>
            </MenuRoot>
          </div>
        </div>
      </div>
    </header>
  );
}
