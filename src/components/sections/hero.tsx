import { TypeWriter } from "@/components/type-writer";
import { profile, site } from "@/lib/content";
import { useI18n } from "@/lib/i18n";

export function HeroSection() {
  const { t, tf } = useI18n();

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
      </div>
    </section>
  );
}
