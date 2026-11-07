import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { CollapsiblePanel, CollapsibleRoot, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { HeadingEntry } from "@/lib/headings";
import { formatTemplate } from "@/lib/i18n";
import { cn, type WithClassName } from "@/lib/utils";

export type TableOfContentsProps = WithClassName<{
  headings: HeadingEntry[];
  title: string;
  /** Label for the arrow that shows a section's subheadings; `{title}` is the section title. */
  expandLabel: string;
}>;

interface TocSection {
  heading: HeadingEntry;
  children: HeadingEntry[];
}

/** Top-level headings, each with the deeper headings that follow it. */
function groupHeadings(headings: HeadingEntry[]): TocSection[] {
  const topLevel = Math.min(...headings.map((h) => h.level));
  const sections: TocSection[] = [];
  for (const heading of headings) {
    const last = sections.at(-1);
    if (heading.level > topLevel && last) last.children.push(heading);
    else sections.push({ heading, children: [] });
  }
  return sections;
}

const linkClassName =
  "block py-1 font-sans text-body transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue";

/**
 * A sticky list of a post's top-level headings; each one's subheadings open from an
 * arrow and start closed. The section the reader is in is highlighted (the first one
 * before scrolling and in the prerendered HTML).
 */
export function TableOfContents({ headings, title, expandLabel, className }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState(headings[0]?.id);
  const sections = groupHeadings(headings);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      // The current heading is the last one that has scrolled past the top quarter.
      const line = window.innerHeight / 4;
      let current = headings[0]?.id;
      for (const { id } of headings) {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= line) current = id;
      }
      setActiveId(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [headings]);

  return (
    <nav aria-labelledby="toc-title" className={cn("flex flex-col gap-3", className)}>
      <p id="toc-title" className="font-mono text-caption font-bold text-gray/75">
        {title}
      </p>
      <ul className="flex flex-col border-l border-rule">
        {sections.map(({ heading, children }) => {
          const sectionActive =
            heading.id === activeId || children.some((child) => child.id === activeId);
          const link = (
            <Link
              to="./"
              hash={heading.id}
              aria-current={heading.id === activeId ? "location" : undefined}
              className={cn(
                linkClassName,
                "-ml-px min-w-0 flex-1 border-l pl-4",
                sectionActive
                  ? "border-green text-foreground/80"
                  : "border-transparent text-gray/75 hover:text-gray",
              )}
            >
              {heading.text}
            </Link>
          );
          if (children.length === 0) return <li key={heading.id}>{link}</li>;
          return (
            <li key={heading.id}>
              <CollapsibleRoot>
                <div className="flex items-start gap-1">
                  {link}
                  <CollapsibleTrigger
                    aria-label={formatTemplate(expandLabel, { title: heading.text })}
                    className="shrink-0 rounded-xs p-1 text-gray/75 hover:text-gray data-panel-open:text-gray"
                  >
                    <ChevronDown
                      className="size-4 transition-transform group-data-panel-open:rotate-180 motion-reduce:transition-none"
                      aria-hidden="true"
                    />
                  </CollapsibleTrigger>
                </div>
                <CollapsiblePanel className="pt-0">
                  <ul className="flex flex-col">
                    {children.map((child) => (
                      <li key={child.id}>
                        <Link
                          to="./"
                          hash={child.id}
                          aria-current={child.id === activeId ? "location" : undefined}
                          className={cn(
                            linkClassName,
                            "pl-8",
                            child.id === activeId
                              ? "text-foreground/80"
                              : "text-gray/75 hover:text-gray",
                          )}
                        >
                          {child.text}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CollapsiblePanel>
              </CollapsibleRoot>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
