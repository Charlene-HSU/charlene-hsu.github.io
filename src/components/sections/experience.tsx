import { ChevronDown } from "lucide-react";
import { SectionShell } from "@/components/layout/section-shell";
import { Markdown } from "@/components/markdown";
import { Badge } from "@/components/ui/badge";
import { CollapsiblePanel, CollapsibleRoot, CollapsibleTrigger } from "@/components/ui/collapsible";
import { computePeriodStatus, experience, site } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import type { ExperienceItem } from "@/types/content";

function ExperienceCard({ item }: { item: ExperienceItem }) {
  const { t, tf, formatDate } = useI18n();

  const status = computePeriodStatus(item.period);
  const startFormatted = formatDate(item.period.start);
  // A one-off event (start and end on the same date) shows a single date.
  const periodLabel =
    item.period.end === item.period.start
      ? startFormatted
      : tf(site.ui.sections.experience.periodTemplate, {
          start: startFormatted,
          end:
            item.period.end === null
              ? t(site.ui.sections.experience.present)
              : formatDate(item.period.end),
        });

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-rule bg-surface p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="font-mono text-h2 font-bold text-foreground">{t(item.company)}</h3>
            <Badge variant={status === "present" ? "green" : "default"}>
              {status === "present"
                ? t(site.ui.sections.experience.present)
                : t(site.ui.sections.experience.ended)}
            </Badge>
          </div>
          <span className="font-mono text-lead font-bold text-foreground">{t(item.role)}</span>
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
}

export function ExperienceSection() {
  const { t } = useI18n();
  // Groups with no items are hidden, so a block can be switched off by emptying it.
  const groups = experience.groups.filter((group) => group.items.length > 0);

  return (
    <SectionShell
      id="experience"
      comment={t(site.ui.sections.experience.comment)}
      title={t(site.ui.sections.experience.title)}
    >
      {groups.length === 0 ? (
        <p className="font-mono text-body text-gray">{t(site.ui.sections.experience.empty)}</p>
      ) : null}
      {groups.map((group) => (
        <section
          key={group.id}
          id={group.id}
          aria-labelledby={`${group.id}-title`}
          className="flex scroll-mt-header flex-col gap-4"
        >
          <h2 id={`${group.id}-title`} className="font-mono text-h2 font-bold text-green">
            {t(group.title)}
          </h2>
          <div className="flex flex-col gap-4">
            {group.items.map((item) => (
              <ExperienceCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      ))}
    </SectionShell>
  );
}
