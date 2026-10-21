import { ChevronDown } from "lucide-react";
import { SectionShell } from "@/components/layout/section-shell";
import { Markdown } from "@/components/markdown";
import { Badge } from "@/components/ui/badge";
import { CollapsiblePanel, CollapsibleRoot, CollapsibleTrigger } from "@/components/ui/collapsible";
import { computePeriodStatus, experience, site } from "@/lib/content";
import { useI18n } from "@/lib/i18n";

export function ExperienceSection() {
  const { t, tf, formatDate } = useI18n();

  return (
    <SectionShell
      id="experience"
      comment={t(site.ui.sections.experience.comment)}
      title={t(site.ui.sections.experience.title)}
    >
      <div className="flex flex-col gap-4">
        {experience.items.map((item) => {
          const status = computePeriodStatus(item.period);
          const startFormatted = formatDate(item.period.start);
          const endFormatted =
            item.period.end === null
              ? t(site.ui.sections.experience.present)
              : formatDate(item.period.end);
          const periodLabel = tf(site.ui.sections.experience.periodTemplate, {
            start: startFormatted,
            end: endFormatted,
          });

          return (
            <div
              key={item.id}
              className="flex flex-col gap-4 rounded-lg border border-rule bg-surface p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="font-mono text-h2 font-bold text-foreground">{t(item.role)}</h3>
                    <Badge variant={status === "present" ? "green" : "default"}>
                      {status === "present"
                        ? t(site.ui.sections.experience.present)
                        : t(site.ui.sections.experience.ended)}
                    </Badge>
                  </div>
                  <span className="font-mono text-body text-gray">{t(item.company)}</span>
                </div>
                <span className="font-mono text-caption text-gray">{periodLabel}</span>
              </div>

              {item.highlights.length > 0 ? (
                <CollapsibleRoot defaultOpen>
                  <CollapsibleTrigger>
                    <ChevronDown
                      className="size-4 transition-transform group-data-panel-open:rotate-180"
                      aria-hidden="true"
                    />
                    <span>
                      {tf(site.ui.sections.experience.highlightsToggle, {
                        count: item.highlights.length,
                      })}
                    </span>
                  </CollapsibleTrigger>
                  <CollapsiblePanel>
                    <ul className="flex list-disc flex-col gap-2 pl-5">
                      {item.highlights.map((highlight, idx) => (
                        <li key={idx} className="text-paragraph text-gray">
                          <Markdown content={t(highlight)} inline />
                        </li>
                      ))}
                    </ul>
                  </CollapsiblePanel>
                </CollapsibleRoot>
              ) : null}
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
}
