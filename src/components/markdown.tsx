import { Children, isValidElement, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { LinkCard } from "@/components/link-card";
import { ResponsiveImage } from "@/components/responsive-image";
import { getMarkdownAsset } from "@/lib/content";
import { useI18n, type Lang } from "@/lib/i18n";
import { cn, type WithClassName } from "@/lib/utils";

function textOf(children: ReactNode): string {
  return Children.toArray(children)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number") return String(child);
      if (isValidElement<{ children?: ReactNode }>(child)) return textOf(child.props.children);
      return "";
    })
    .join("");
}

function slugifyHeading(children: ReactNode): string {
  const raw = textOf(children).trim().toLowerCase();
  return raw.replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "") || "section";
}

/** Returns a heading-id generator that adds `-2`, `-3`, … to repeated slugs. */
function createHeadingIds(): (children: ReactNode) => string {
  const seen = new Map<string, number>();
  return (children) => {
    const base = slugifyHeading(children);
    const count = (seen.get(base) ?? 0) + 1;
    seen.set(base, count);
    return count === 1 ? base : `${base}-${count}`;
  };
}

function getStandaloneUrl(children: ReactNode): string | null {
  const arr = Children.toArray(children).filter(
    (node) => !(typeof node === "string" && node.trim() === ""),
  );
  if (arr.length !== 1) {
    return null;
  }
  const only = arr[0];
  if (typeof only === "string" && /^https:\/\/\S+$/.test(only.trim())) {
    return only.trim();
  }
  if (isValidElement<{ href?: string; children?: ReactNode }>(only)) {
    const href = only.props.href;
    const linkText = Children.toArray(only.props.children)
      .map((c) => (typeof c === "string" ? c : ""))
      .join("")
      .trim();
    if (href && href.startsWith("https://") && linkText === href) {
      return href;
    }
  }
  return null;
}

const linkClassName =
  "text-blue underline underline-offset-4 hover:text-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue";

function isExternalHref(href: string): boolean {
  return /^(https?:\/\/|mailto:)/i.test(href);
}

/**
 * A Markdown link. External URLs open in a new tab; `#anchor` stays on the
 * current page; a site path such as `/en/blog/hello-world/` goes to that page;
 * anything else goes home.
 */
function MarkdownLink({
  href,
  lang,
  children,
}: {
  href: string | undefined;
  lang: Lang;
  children: ReactNode;
}) {
  if (!href) return <span>{children}</span>;
  if (isExternalHref(href)) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn("inline-flex items-center gap-1", linkClassName)}
      >
        <span>{children}</span>
        <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
      </a>
    );
  }
  if (href.startsWith("#")) {
    return (
      <Link to="./" hash={href.slice(1)} className={linkClassName}>
        {children}
      </Link>
    );
  }
  if (href.startsWith("/")) {
    const [pathAndSearch, hash] = href.split("#", 2);
    const [pathname] = pathAndSearch.split("?", 1);
    return (
      // Paths written in content are only known at runtime, so the router cannot type-check them.
      <Link to={pathname as never} hash={hash} className={linkClassName}>
        {children}
      </Link>
    );
  }
  return (
    <Link to="/$lang/" params={{ lang }} className={linkClassName}>
      {children}
    </Link>
  );
}

export type MarkdownProps = WithClassName<{
  content: string;
  inline?: boolean;
  blogSlug?: string;
}>;

export function Markdown({ content, inline = false, blogSlug, className }: MarkdownProps) {
  const { lang } = useI18n();

  if (inline) {
    const inlineComponents: Components = {
      p: ({ children }) => <span>{children}</span>,
      strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
      code: ({ children }) => (
        <code className="rounded-xs border border-rule bg-background px-1.5 py-0.5 font-mono text-caption text-green">
          {children}
        </code>
      ),
      ul: ({ children }) => <ul className="list-disc space-y-1 pl-5">{children}</ul>,
      li: ({ children }) => <li className="text-paragraph text-gray">{children}</li>,
      a: ({ href, children }) => (
        <MarkdownLink href={href} lang={lang}>
          {children}
        </MarkdownLink>
      ),
    };

    return (
      <span className={cn("font-sans text-paragraph", className)}>
        <ReactMarkdown
          allowedElements={["p", "strong", "code", "a", "ul", "li"]}
          components={inlineComponents}
        >
          {content}
        </ReactMarkdown>
      </span>
    );
  }

  const headingId = createHeadingIds();
  const components: Components = {
    h1: ({ children }) => (
      <h2
        id={headingId(children)}
        className="pt-4 font-mono text-h1 font-bold text-foreground first:pt-0"
      >
        {children}
      </h2>
    ),
    h2: ({ children }) => (
      <h3
        id={headingId(children)}
        className="pt-3 font-mono text-h2 font-bold text-foreground first:pt-0"
      >
        {children}
      </h3>
    ),
    h3: ({ children }) => (
      <h4
        id={headingId(children)}
        className="pt-2 font-mono text-lead font-bold text-foreground first:pt-0"
      >
        {children}
      </h4>
    ),
    p: ({ children }) => {
      const standaloneUrl = getStandaloneUrl(children);
      if (standaloneUrl) {
        return <LinkCard url={standaloneUrl} />;
      }
      return <p className="font-sans text-paragraph text-foreground/90">{children}</p>;
    },
    a: ({ href, children }) => (
      <MarkdownLink href={href} lang={lang}>
        {children}
      </MarkdownLink>
    ),
    strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
    del: ({ children }) => <del className="text-gray line-through">{children}</del>,
    ul: ({ children }) => (
      <ul className="list-disc space-y-1.5 pl-5 font-sans text-paragraph text-foreground/90">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal space-y-1.5 pl-5 font-sans text-paragraph text-foreground/90">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-green pl-4 font-sans text-paragraph text-gray italic">
        {children}
      </blockquote>
    ),
    pre: ({ children }) => (
      <pre
        tabIndex={0}
        className="overflow-x-auto rounded-md border border-rule bg-background p-4 font-mono text-body text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
      >
        {children}
      </pre>
    ),
    code: ({ className: codeClassName, children }) => {
      const isBlock = Boolean(codeClassName);
      if (isBlock) {
        return <code className="font-mono text-body">{children}</code>;
      }
      return (
        <code className="rounded-xs border border-rule bg-background px-1.5 py-0.5 font-mono text-caption text-green">
          {children}
        </code>
      );
    },
    table: ({ children }) => (
      <div className="overflow-x-auto rounded-md border border-rule">
        <table className="w-full border-collapse text-left font-sans text-body">{children}</table>
      </div>
    ),
    th: ({ children }) => (
      <th className="border-b border-rule bg-surface px-4 py-2.5 font-mono font-bold text-foreground">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border-b border-rule px-4 py-2.5 text-gray">{children}</td>
    ),
    img: ({ src, alt }) => {
      if (!src) return null;
      const resolvedAsset = getMarkdownAsset(src, blogSlug);
      if (resolvedAsset) {
        return (
          <ResponsiveImage
            image={resolvedAsset}
            alt={alt ?? ""}
            sizes="(min-width: 960px) 800px, 100vw"
            className="rounded-md border border-rule"
          />
        );
      }
      return null;
    },
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
