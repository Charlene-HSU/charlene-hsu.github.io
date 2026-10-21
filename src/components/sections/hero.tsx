import { Link } from "@tanstack/react-router";
import { TypeWriter } from "@/components/type-writer";
import { buttonVariants } from "@/components/ui/button";
import { profile, site } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import { NavIcon } from "@/lib/icons";
import { pageRoutes } from "@/lib/pages";
import { cn } from "@/lib/utils";

export function HeroSection() {
  const { lang, t, tf } = useI18n();

  const metaLine = tf(site.ui.hero.metaTemplate, {
    title: t(profile.title),
    location: t(profile.location),
  });

  return (
    <section className="w-full px-6 pt-header pb-16 md:pb-24">
      <div className="mx-auto flex w-full max-w-content flex-col gap-6 pt-8 md:pt-12">
        <div className="flex flex-col gap-3">
          <span className="font-mono text-body font-bold text-green">{site.ui.hero.prompt}</span>
          <h1 className="font-mono text-mega font-bold tracking-tight text-foreground">
            {t(profile.name)}
          </h1>
          <p className="font-mono text-h2 font-normal text-foreground">{metaLine}</p>
        </div>

        <TypeWriter text={t(profile.tagline)} />

        <div className="grid grid-cols-2 gap-3 pt-2 sm:flex sm:flex-wrap">
          {site.nav.map((item) => {
            const isPrimary = item.id === profile.primaryCta;
            return (
              <Link
                key={item.id}
                to={pageRoutes[item.id]}
                params={{ lang }}
                className={cn(
                  buttonVariants({
                    variant: isPrimary ? "primary" : "outline",
                    size: "lg",
                  }),
                  "w-full sm:w-auto",
                )}
              >
                <NavIcon name={item.icon} />
                <span>{t(item.label)}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
