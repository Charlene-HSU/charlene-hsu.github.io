import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { profile, site, skills } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { ProfileState } from "@/types/content";

const stateDotColor: Record<ProfileState, string> = {
  open: "bg-green",
  busy: "bg-yellow",
  away: "bg-gray",
};

const stateBadgeVariant: Record<ProfileState, "green" | "yellow" | "default"> = {
  open: "green",
  busy: "yellow",
  away: "default",
};

function formatClockTime(date: Date, lang: string, timeZone: string): string {
  return new Intl.DateTimeFormat(lang, {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    // `hour12: false` shows midnight as "24:00" in some browsers; h23 is always 00–23.
    hourCycle: "h23",
  }).format(date);
}

export function StatusSection() {
  const { lang, t, tf } = useI18n();
  const [timeStr, setTimeStr] = useState<string>("--:--:--");

  useEffect(() => {
    const updateClock = () => {
      setTimeStr(formatClockTime(new Date(), lang, profile.timezone));
    };
    updateClock();
    const intervalId = window.setInterval(updateClock, 1000);
    return () => {
      window.clearInterval(intervalId);
    };
  }, [lang]);

  const state = profile.status.state;

  return (
    <section className="w-full flex flex-col gap-12 pb-16">
      <div className="w-full px-6">
        <div className="mx-auto grid w-full max-w-content grid-cols-1 gap-2 md:grid-cols-2">
          {/* Left / Top Card: Current Status (outer corner xl, inner corner sm) */}
          <div className="flex flex-col justify-between gap-4 rounded-t-xl rounded-b-sm border border-rule bg-surface p-6 md:rounded-l-xl md:rounded-r-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-caption text-gray">
                {t(site.ui.status.statusEyebrow)}
              </span>
              <Badge variant={stateBadgeVariant[state]}>{t(site.ui.status.states[state])}</Badge>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={cn("size-3 shrink-0 rounded-full", stateDotColor[state])}
                aria-hidden="true"
              />
              <span className="font-mono text-h2 font-bold text-foreground">
                {t(profile.status.text)}
              </span>
            </div>
          </div>

          {/* Right / Bottom Card: Local Time (inner corner sm, outer corner xl) */}
          <div className="flex flex-col justify-between gap-4 rounded-t-sm rounded-b-xl border border-rule bg-surface p-6 md:rounded-l-sm md:rounded-r-xl">
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-caption text-gray">
                {t(site.ui.status.clockEyebrow)}
              </span>
              <span className="font-mono text-caption text-gray">
                {tf(site.ui.status.timezoneTemplate, { tz: profile.timezone })}
              </span>
            </div>
            <div className="font-mono text-h1 font-bold text-green">{timeStr}</div>
          </div>
        </div>
      </div>

      {/* Full-bleed Tech Stack Marquee. The list is drawn twice for a seamless loop;
          only the first copy is exposed to screen readers. */}
      {skills.marquee.length > 0 ? (
        <div
          role="region"
          aria-label={t(site.ui.status.marqueeAriaLabel)}
          className="w-full overflow-hidden border-y border-rule bg-surface py-3"
        >
          <div className="mx-auto max-w-content px-6">
            <div className="overflow-hidden">
              <div className="flex w-max items-center gap-6 animate-marquee">
                {[false, true].map((isCopy) => (
                  <ul
                    key={String(isCopy)}
                    aria-hidden={isCopy || undefined}
                    className="flex items-center gap-6"
                  >
                    {skills.marquee.map((item, idx) => (
                      <li key={`${item}-${idx}`} className="flex items-center gap-6">
                        <span className="font-mono text-body font-bold text-foreground">
                          {item}
                        </span>
                        <span className="font-mono text-body text-green" aria-hidden="true">
                          /
                        </span>
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
