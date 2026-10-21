import { Copy, ExternalLink } from "lucide-react";
import { SectionShell } from "@/components/layout/section-shell";
import { Markdown } from "@/components/markdown";
import { ResponsiveImage } from "@/components/responsive-image";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { useToastManager } from "@/components/ui/toast";
import {
  friends,
  getFriendAvatarAsset,
  getFriendBadgeAsset,
  ownPublicFileUrl,
  site,
} from "@/lib/content";
import { useI18n } from "@/lib/i18n";

function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

type Exchange = NonNullable<typeof friends.exchange>;

function ExchangeCard({
  exchange,
  onCopy,
}: {
  exchange: Exchange;
  onCopy: (value: string) => void;
}) {
  const { t, tf } = useI18n();
  const exchangeName = t(exchange.name);
  const exchangeDesc = t(exchange.description);
  const badgeHtmlSnippet = `<a href="${escapeHtmlAttr(exchange.url)}" target="_blank" rel="noopener noreferrer"><img src="${escapeHtmlAttr(exchange.badge ?? "")}" width="88" height="31" alt="${escapeHtmlAttr(exchangeName)}" /></a>`;

  // Previews of the images friends will link to (files in public/).
  const avatarPreview = ownPublicFileUrl(exchange.avatar);
  const badgePreview = ownPublicFileUrl(exchange.badge);

  const exchangeFields = [
    {
      key: "name",
      label: t(site.ui.sections.friends.fields.name),
      value: exchangeName,
    },
    {
      key: "url",
      label: t(site.ui.sections.friends.fields.url),
      value: exchange.url,
    },
    {
      key: "description",
      label: t(site.ui.sections.friends.fields.description),
      value: exchangeDesc,
    },
    {
      key: "avatar",
      label: t(site.ui.sections.friends.fields.avatar),
      value: exchange.avatar,
    },
  ];

  return (
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
            <div className="flex min-w-0 items-center gap-3">
              {field.key === "avatar" && avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={tf(site.ui.sections.friends.avatarAltTemplate, { name: exchangeName })}
                  loading="lazy"
                  className="size-10 shrink-0 rounded-full border border-rule object-cover"
                />
              ) : null}
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="font-mono text-caption text-gray">{field.label}</span>
                <span className="truncate font-mono text-body text-foreground">{field.value}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label={tf(site.ui.sections.friends.copyFieldAriaLabel, {
                field: field.label,
              })}
              onClick={() => onCopy(field.value)}
            >
              <Copy className="size-4" aria-hidden="true" />
            </Button>
          </div>
        ))}
      </div>

      {exchange.badge ? (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-md border border-rule bg-background p-4">
          <div className="flex items-center gap-4">
            {badgePreview ? (
              <img
                src={badgePreview}
                width="88"
                height="31"
                alt={tf(site.ui.sections.friends.badgeAltTemplate, {
                  name: exchangeName,
                })}
                loading="lazy"
                className="shrink-0 border border-rule"
              />
            ) : null}
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="font-mono text-caption text-gray">
                {t(site.ui.sections.friends.fields.badge)}
              </span>
              <code className="max-w-md truncate font-mono text-caption text-green">
                {badgeHtmlSnippet}
              </code>
            </div>
          </div>
          <Button variant="outline" onClick={() => onCopy(badgeHtmlSnippet)}>
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
          <Markdown content={t(exchange.rules)} inline />
        </div>

        <a
          href={exchange.apply}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: "primary" })}
        >
          <span>{t(site.ui.sections.friends.applyCta)}</span>
          <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}

export function FriendsSection() {
  const { t, tf } = useI18n();
  const toastManager = useToastManager();

  const copyToClipboard = async (value: string) => {
    try {
      // Only confirm a copy that actually happened.
      if (typeof navigator === "undefined" || !navigator.clipboard) return;
      await navigator.clipboard.writeText(value);
      toastManager.add({
        title: t(site.ui.toast.copiedTitle),
        description: tf(site.ui.toast.copiedDescription, { value }),
      });
    } catch {
      // Ignore clipboard permission failures
    }
  };

  return (
    <SectionShell
      id="friends"
      comment={t(site.ui.sections.friends.comment)}
      title={t(site.ui.sections.friends.title)}
    >
      <p className="font-sans text-lead text-gray">{t(friends.intro)}</p>

      {friends.items.length === 0 ? (
        <p className="font-mono text-body text-gray">{t(site.ui.sections.friends.empty)}</p>
      ) : (
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
      )}

      {friends.exchange ? (
        <ExchangeCard exchange={friends.exchange} onCopy={(value) => void copyToClipboard(value)} />
      ) : null}
    </SectionShell>
  );
}
