import { Copy, ExternalLink } from "lucide-react";
import siteBadgeImg from "@/assets/friends/badges/site-88x31.png";
import { SectionShell } from "@/components/layout/section-shell";
import { Markdown } from "@/components/markdown";
import { ResponsiveImage } from "@/components/responsive-image";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { useToastManager } from "@/components/ui/toast";
import { friends, getFriendAvatarAsset, getFriendBadgeAsset, site } from "@/lib/content";
import { useI18n } from "@/lib/i18n";

export function FriendsSection() {
  const { t, tf } = useI18n();
  const toastManager = useToastManager();

  const copyToClipboard = async (value: string) => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(value);
      }
      toastManager.add({
        title: t(site.ui.toast.copiedTitle),
        description: tf(site.ui.toast.copiedDescription, { value }),
      });
    } catch {
      // Ignore clipboard permission failures
    }
  };

  const exchangeName = t(friends.exchange.name);
  const exchangeDesc = t(friends.exchange.description);
  const badgeHtmlSnippet = `<a href="${friends.exchange.url}" target="_blank" rel="noopener noreferrer"><img src="${friends.exchange.badge ?? ""}" width="88" height="31" alt="${exchangeName}" /></a>`;

  const exchangeFields = [
    {
      key: "name",
      label: t(site.ui.sections.friends.fields.name),
      value: exchangeName,
    },
    {
      key: "url",
      label: t(site.ui.sections.friends.fields.url),
      value: friends.exchange.url,
    },
    {
      key: "description",
      label: t(site.ui.sections.friends.fields.description),
      value: exchangeDesc,
    },
    {
      key: "avatar",
      label: t(site.ui.sections.friends.fields.avatar),
      value: friends.exchange.avatar,
    },
  ];

  return (
    <SectionShell
      id="friends"
      comment={t(site.ui.sections.friends.comment)}
      title={t(site.ui.sections.friends.title)}
    >
      <p className="font-sans text-lead text-gray">{t(friends.intro)}</p>

      {/* Friend Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {friends.items.map((friend) => {
          const friendName = t(friend.name);
          const avatarAsset = getFriendAvatarAsset(friend.avatar);
          const badgeSrc = getFriendBadgeAsset(friend.badge);
          const initial = friendName.trim().charAt(0).toUpperCase() || "?";

          return (
            <a
              key={friend.url}
              href={friend.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col justify-between gap-4 rounded-lg border border-rule bg-surface p-5 transition-colors hover:border-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {avatarAsset ? (
                      <div className="size-10 shrink-0 overflow-hidden rounded-full border border-rule bg-background">
                        <ResponsiveImage
                          image={avatarAsset}
                          alt={tf(site.ui.sections.friends.avatarAltTemplate, {
                            name: friendName,
                          })}
                          sizes="40px"
                          className="size-full object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        aria-hidden="true"
                        className="flex size-10 shrink-0 items-center justify-center rounded-full border border-rule bg-background font-mono text-body font-bold text-green"
                      >
                        {initial}
                      </div>
                    )}
                    <span className="truncate font-mono text-h2 font-bold text-foreground group-hover:text-green">
                      {friendName}
                    </span>
                  </div>
                  <ExternalLink
                    className="size-4 shrink-0 text-gray transition-colors group-hover:text-green"
                    aria-hidden="true"
                  />
                </div>

                <p className="font-sans text-body text-gray">{t(friend.description)}</p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex flex-wrap gap-1.5">
                  {friend.tags.map((tag) => (
                    <Badge key={tag} variant="default">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {badgeSrc ? (
                  <img
                    src={badgeSrc}
                    width="88"
                    height="31"
                    alt={tf(site.ui.sections.friends.badgeAltTemplate, {
                      name: friendName,
                    })}
                    loading="lazy"
                    className="shrink-0 border border-rule"
                  />
                ) : null}
              </div>
            </a>
          );
        })}
      </div>

      {/* Link Exchange Info Card */}
      <div className="flex flex-col gap-6 rounded-lg border border-rule bg-surface p-6">
        <div className="flex flex-col gap-1">
          <h2 className="font-mono text-h2 font-bold text-foreground">
            {t(site.ui.sections.friends.exchangeTitle)}
          </h2>
          <p className="font-sans text-body text-gray">
            {t(site.ui.sections.friends.exchangeSubtitle)}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {exchangeFields.map((field) => (
            <div
              key={field.key}
              className="flex items-center justify-between gap-3 rounded-md border border-rule bg-background p-3"
            >
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="font-mono text-caption text-gray">{field.label}</span>
                <span className="truncate font-mono text-body text-foreground">{field.value}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label={tf(site.ui.sections.friends.copyFieldAriaLabel, {
                  field: field.label,
                })}
                onClick={() => void copyToClipboard(field.value)}
              >
                <Copy className="size-4" aria-hidden="true" />
              </Button>
            </div>
          ))}
        </div>

        {friends.exchange.badge ? (
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-md border border-rule bg-background p-4">
            <div className="flex items-center gap-4">
              <img
                src={siteBadgeImg}
                width="88"
                height="31"
                alt={tf(site.ui.sections.friends.badgeAltTemplate, {
                  name: exchangeName,
                })}
                loading="lazy"
                className="shrink-0 border border-rule"
              />
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-caption text-gray">
                  {t(site.ui.sections.friends.fields.badge)}
                </span>
                <code className="max-w-md truncate font-mono text-caption text-green">
                  {badgeHtmlSnippet}
                </code>
              </div>
            </div>
            <Button variant="outline" onClick={() => void copyToClipboard(badgeHtmlSnippet)}>
              <Copy className="size-4" aria-hidden="true" />
              <span>{t(site.ui.sections.friends.copyBadgeHtml)}</span>
            </Button>
          </div>
        ) : null}

        <div className="flex flex-col gap-4 border-t border-rule pt-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-body font-bold text-foreground">
              {t(site.ui.sections.friends.rulesTitle)}
            </span>
            <Markdown content={t(friends.exchange.rules)} inline />
          </div>

          <a
            href={friends.exchange.apply}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "primary" })}
          >
            <span>{t(site.ui.sections.friends.applyCta)}</span>
            <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
          </a>
        </div>
      </div>
    </SectionShell>
  );
}
