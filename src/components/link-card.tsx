import { ExternalLink } from "lucide-react";
import { getOgEntry } from "@/lib/content";
import { cn, type WithClassName } from "@/lib/utils";

export type LinkCardProps = WithClassName<{
  url: string;
  title?: string;
  description?: string;
  siteName?: string;
}>;

function extractDomain(rawUrl: string): string {
  try {
    return new URL(rawUrl).hostname.replace(/^www\./, "");
  } catch {
    return rawUrl;
  }
}

export function LinkCard({ url, title, description, siteName, className }: LinkCardProps) {
  const cached = getOgEntry(url);
  const domain = extractDomain(url);
  const resolvedSiteName = siteName ?? cached?.siteName ?? domain;
  const resolvedTitle = title ?? cached?.title ?? domain;
  const resolvedDescription = description ?? cached?.description;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group flex flex-col gap-1.5 rounded-md border border-rule bg-background p-4 text-left transition-colors hover:border-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 font-mono text-caption text-gray">
        <span className="truncate">{resolvedSiteName}</span>
        <ExternalLink
          className="size-3.5 shrink-0 text-gray transition-colors group-hover:text-green"
          aria-hidden="true"
        />
      </div>
      <div className="font-mono text-body font-bold text-foreground group-hover:text-green">
        {resolvedTitle}
      </div>
      {resolvedDescription ? (
        <p className="line-clamp-2 font-sans text-caption text-gray">{resolvedDescription}</p>
      ) : null}
    </a>
  );
}
