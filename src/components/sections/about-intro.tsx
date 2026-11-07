import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Markdown } from "@/components/markdown";
import { buttonVariants } from "@/components/ui/button";
import { profile, site } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import { NavIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

/**
 * Home: a short self-introduction (`profile.yaml` `intro`) under the hero, with a large
 * button to the About page for the full story. `site.yaml` `shortcuts.about: false` hides it.
 */
export function AboutIntroSection() {
  const { lang, t } = useI18n();
  if (!site.shortcuts.about) return null;

  const intro = profile.intro ? t(profile.intro) : "";
  const entry = site.nav.find((item) => item.id === "about");

  return (
    <section aria-labelledby="about-intro-heading" className="w-full px-6 pb-16">
      <div className="mx-auto flex w-full max-w-content flex-col gap-4 rounded-lg border border-rule bg-surface p-6">
        <h2
          id="about-intro-heading"
          className="inline-flex items-center gap-2 font-mono text-paragraph font-bold text-green"
        >
          {entry ? <NavIcon name={entry.icon} /> : null}
          <span>{entry ? t(entry.label) : null}</span>
        </h2>
        {intro ? <Markdown content={intro} inline className="text-foreground/90" /> : null}
        <Link
          to="/$lang/about/"
          params={{ lang }}
          className={cn(
            buttonVariants({ variant: "primary", size: "lg" }),
            "group mt-2 w-full md:w-fit",
          )}
        >
          <span>{t(site.ui.aboutIntro.more)}</span>
          <ArrowRight
            className="size-5 transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
            aria-hidden="true"
          />
        </Link>
      </div>
    </section>
  );
}
