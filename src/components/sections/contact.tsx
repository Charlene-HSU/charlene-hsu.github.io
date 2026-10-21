import { Copy, ExternalLink, Mail } from "lucide-react";
import { SectionShell } from "@/components/layout/section-shell";
import { Button, buttonVariants } from "@/components/ui/button";
import { useToastManager } from "@/components/ui/toast";
import { contact, site } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import { BrandIcon } from "@/lib/icons";

const invertedOutline =
  "border-background/30 bg-transparent text-background hover:border-background hover:bg-background/10";

export function ContactSection() {
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
      // Ignore clipboard permission errors
    }
  };

  return (
    <SectionShell
      id="contact"
      comment={t(site.ui.sections.contact.comment)}
      title={t(site.ui.sections.contact.title)}
    >
      {/* Inverted (foreground) surface card */}
      <div className="flex flex-col justify-between gap-8 rounded-xl bg-foreground p-8 text-background md:p-10">
        <div className="flex flex-col gap-3">
          <p className="max-w-2xl font-sans text-lead text-background/85">
            {t(site.ui.sections.contact.lead)}
          </p>
          <span className="font-mono text-h1 font-bold break-all text-background">
            {contact.email}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-background/15 pt-6">
          <div className="flex flex-wrap gap-3">
            <Button
              variant="inverted"
              size="lg"
              onClick={() => void copyToClipboard(contact.email)}
            >
              <Copy className="size-4" aria-hidden="true" />
              <span>{tf(site.ui.sections.contact.copyEmail, { email: contact.email })}</span>
            </Button>

            <a
              href={`mailto:${contact.email}`}
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className: invertedOutline,
              })}
            >
              <Mail className="size-4" aria-hidden="true" />
              <span>{t(site.ui.sections.contact.sendEmail)}</span>
            </a>
          </div>

          {contact.links.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {contact.links.map((social) => {
                const label = t(social.label);
                const icon = <BrandIcon name={social.icon} iconStyle={social.iconStyle} inverted />;

                // A handle (e.g. a Discord username): show it and copy it on click.
                if (social.text) {
                  const handle = social.text;
                  return (
                    <Button
                      key={`${social.icon}-${handle}`}
                      variant="outline"
                      aria-label={tf(site.ui.sections.contact.copyHandleAriaLabel, {
                        label,
                        value: handle,
                      })}
                      onClick={() => void copyToClipboard(handle)}
                      className={invertedOutline}
                    >
                      {icon}
                      <span>{label}</span>
                      <span className="font-normal">{handle}</span>
                      <Copy className="size-3.5 shrink-0" aria-hidden="true" />
                    </Button>
                  );
                }

                const isExternal = social.url?.startsWith("https://") ?? false;
                return (
                  <a
                    key={social.url}
                    href={social.url}
                    {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className={buttonVariants({ variant: "outline", className: invertedOutline })}
                  >
                    {icon}
                    <span>{label}</span>
                    {isExternal ? (
                      <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
                    ) : null}
                  </a>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </SectionShell>
  );
}
