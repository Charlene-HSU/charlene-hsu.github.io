import { useState } from "react";
import { Play } from "lucide-react";
import { LinkCard } from "@/components/link-card";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import { cn, type WithClassName } from "@/lib/utils";
import type { EmbedRatio, ProjectEmbed } from "@/types/content";

const ratioClassMap: Record<EmbedRatio, string> = {
  video: "aspect-video",
  wide: "aspect-video",
  square: "aspect-square",
};

export function extractYouTubeId(rawUrl: string): string | null {
  try {
    const parsed = new URL(rawUrl);
    const host = parsed.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = parsed.pathname.slice(1).split("/")[0];
      return id && /^[\w-]{11}$/.test(id) ? id : null;
    }
    if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
      const vParam = parsed.searchParams.get("v");
      if (vParam && /^[\w-]{11}$/.test(vParam)) {
        return vParam;
      }
      const segments = parsed.pathname.split("/").filter(Boolean);
      if ((segments[0] === "embed" || segments[0] === "shorts") && segments[1]) {
        return /^[\w-]{11}$/.test(segments[1]) ? segments[1] : null;
      }
    }
    return null;
  } catch {
    return null;
  }
}

function isDomainAllowed(rawUrl: string, allowlist: string[]): boolean {
  try {
    const hostname = new URL(rawUrl).hostname.toLowerCase();
    return allowlist.some((allowed) => {
      const clean = allowed.toLowerCase().trim();
      return hostname === clean || hostname.endsWith(`.${clean}`);
    });
  } catch {
    return false;
  }
}

export type EmbedProps = WithClassName<{
  embed: ProjectEmbed;
}>;

export function Embed({ embed, className }: EmbedProps) {
  const { t, tf } = useI18n();
  const [youtubeLoaded, setYoutubeLoaded] = useState(false);

  const resolvedTitle = embed.title ? t(embed.title) : undefined;
  const resolvedDescription = embed.description ? t(embed.description) : undefined;
  const ratioClass = ratioClassMap[embed.ratio ?? "video"];

  if (embed.kind === "card") {
    return (
      <LinkCard
        url={embed.url}
        title={resolvedTitle}
        description={resolvedDescription}
        className={className}
      />
    );
  }

  if (embed.kind === "youtube") {
    const videoId = extractYouTubeId(embed.url);
    if (!videoId) {
      return (
        <LinkCard
          url={embed.url}
          title={resolvedTitle}
          description={resolvedDescription}
          className={className}
        />
      );
    }

    const videoTitle = resolvedTitle ?? t(site.ui.embed.youtubeDefaultTitle);
    const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

    return (
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-md border border-rule bg-background",
          ratioClass,
          className,
        )}
      >
        {youtubeLoaded ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
            title={videoTitle}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            sandbox="allow-scripts allow-same-origin allow-presentation"
            className="size-full border-0"
          />
        ) : (
          <div className="relative flex size-full items-center justify-center">
            <img
              src={thumbnailUrl}
              alt={t(site.ui.embed.youtubeThumbnailAlt)}
              loading="lazy"
              className="size-full object-cover opacity-75"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/35">
              <Button
                variant="primary"
                size="lg"
                aria-label={tf(site.ui.embed.playYoutubeAriaLabel, { title: videoTitle })}
                onClick={() => setYoutubeLoaded(true)}
              >
                <Play className="size-5 fill-current" aria-hidden="true" />
                <span>{videoTitle}</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Browsers do not report cross-origin iframe failures, so only the allowlist decides.
  // Every allowlisted domain must also be in the `frame-src` CSP in index.html (checked by tests).
  if (!isDomainAllowed(embed.url, site.embedAllowlist)) {
    return (
      <LinkCard
        url={embed.url}
        title={resolvedTitle}
        description={resolvedDescription}
        className={className}
      />
    );
  }

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-md border border-rule bg-background",
        ratioClass,
        className,
      )}
    >
      <iframe
        src={embed.url}
        title={resolvedTitle ?? embed.url}
        loading="lazy"
        referrerPolicy="no-referrer"
        sandbox="allow-scripts allow-same-origin"
        className="size-full border-0"
      />
    </div>
  );
}
