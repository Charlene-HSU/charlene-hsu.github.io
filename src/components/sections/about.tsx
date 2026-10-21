import { SectionShell } from "@/components/layout/section-shell";
import { Markdown } from "@/components/markdown";
import { Terminal } from "@/components/terminal";
import { profile, site } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import { getMarkdownContent } from "@/lib/markdown";

export function AboutSection() {
  const { lang, t, formatNumber } = useI18n();
  const aboutMarkdown = getMarkdownContent(profile.about, lang);

  return (
    <SectionShell
      id="about"
      comment={t(site.ui.sections.about.comment)}
      title={t(site.ui.sections.about.title)}
    >
      {profile.stats.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {profile.stats.map((stat) => (
            <div
              key={t(stat.label)}
              className="flex flex-col gap-2 rounded-lg border border-rule bg-surface p-6"
            >
              <span className="font-mono text-stat font-bold text-green">
                {formatNumber(stat.value)}
              </span>
              <span className="font-mono text-body text-gray">{t(stat.label)}</span>
            </div>
          ))}
        </div>
      ) : null}

      <Terminal title={site.ui.sections.about.terminalTitle}>
        <Markdown content={aboutMarkdown} />
      </Terminal>
    </SectionShell>
  );
}
