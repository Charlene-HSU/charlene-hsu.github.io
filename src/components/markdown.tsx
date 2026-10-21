import { Children, isValidElement, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { LinkCard } from "@/components/link-card";
import { ResponsiveImage } from "@/components/responsive-image";
import { getMarkdownAsset } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import { cn, type WithClassName } from "@/lib/utils";

function slugifyHeading(children: ReactNode): string {
  const raw = Children.toArray(children)
    .map((child) => (typeof child === "string" || typeof child === "number" ? String(child) : ""))
    .join(" ")
    .trim()
    .toLowerCase();
  return raw.replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "") || "section";
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
      a: ({ href, children }) => {
        if (!href) return <span>{children}</span>;
        if (href.startsWith("https://") || href.startsWith("mailto:")) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue underline underline-offset-4 hover:text-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
            >
              <span>{children}</span>
              <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
            </a>
          );
        }
        const hash = href.startsWith("#") ? href.slice(1) : undefined;
        return (
          <Link
            to="/$lang/"
            params={{ lang }}
            hash={hash}
            className="text-blue underline underline-offset-4 hover:text-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
          >
            {children}
          </Link>
        );
      },
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

  const components: Components = {
    h1: ({ children }) => (
      <h2
        id={slugifyHeading(children)}
        className="pt-4 font-mono text-h1 font-bold text-foreground first:pt-0"
      >
        {children}
      </h2>
    ),
    h2: ({ children }) => (
      <h3
        id={slugifyHeading(children)}
        className="pt-3 font-mono text-h2 font-bold text-foreground first:pt-0"
      >
        {children}
      </h3>
    ),
    h3: ({ children }) => (
      <h4
        id={slugifyHeading(children)}
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
    a: ({ href, children }) => {
      if (!href) return <span>{children}</span>;
      if (href.startsWith("https://") || href.startsWith("http://") || href.startsWith("mailto:")) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue underline underline-offset-4 hover:text-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
          >
            <span>{children}</span>
            <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
          </a>
        );
      }
      const hash = href.startsWith("#") ? href.slice(1) : undefined;
      return (
        <Link
          to="/$lang/"
          params={{ lang }}
          hash={hash}
          className="text-blue underline underline-offset-4 hover:text-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
        >
          {children}
        </Link>
      );
    },
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
