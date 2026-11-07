import { Children, isValidElement, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  ExternalLink,
  Info,
  Lightbulb,
  MessageSquareWarning,
  OctagonAlert,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { LinkCard } from "@/components/link-card";
import { MermaidDiagram } from "@/components/mermaid-diagram";
import { ResponsiveImage } from "@/components/responsive-image";
import { getMarkdownAsset, site } from "@/lib/content";
import { t, useI18n, type Lang } from "@/lib/i18n";
import { cn, type WithClassName } from "@/lib/utils";

/** The parts of a hast (HTML syntax tree) node that heading ids need. */
interface HastNode {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

function hastText(node: HastNode): string {
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(hastText).join("");
}

function slugifyHeading(text: string): string {
  const raw = text.trim().toLowerCase();
  return raw.replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "") || "section";
}

/**
 * Rehype plugin: gives h1–h3 an id from their text (including code and link text),
 * adding `-2`, `-3`, … to repeats. It runs once per parse, so the ids stay the same
 * however often React renders the headings.
 */
function rehypeHeadingIds() {
  return (tree: HastNode) => {
    const seen = new Map<string, number>();
    const visit = (node: HastNode) => {
      if (node.type === "element" && /^h[1-3]$/.test(node.tagName ?? "")) {
        const base = slugifyHeading(hastText(node));
        const count = (seen.get(base) ?? 0) + 1;
        seen.set(base, count);
        node.properties = { ...node.properties, id: count === 1 ? base : `${base}-${count}` };
        return;
      }
      node.children?.forEach(visit);
    };
    visit(tree);
  };
}

/** The parts of an mdast (Markdown syntax tree) node that highlights and alerts need. */
interface MdastNode {
  type: string;
  value?: string;
  children?: MdastNode[];
  data?: { hName?: string; hProperties?: Record<string, unknown> };
}

const highlightColors = ["yellow", "green", "blue", "red"] as const;
type HighlightColor = (typeof highlightColors)[number];

// `==text==` or `=={green}text==`; the text may not start or end with a space, and an
// unknown color (`=={pink}…==`) is left as plain text.
const highlightPattern = /==(?:\{(yellow|green|blue|red)\})?(?!\{)(\S(?:.*?\S)?)==/g;

/**
 * Remark plugin: turns `==text==` into <mark> (yellow), and `=={green}text==`,
 * `=={blue}…==`, `=={red}…==` into colored marks. It works inside one run of plain
 * text, so wrap formatting around the mark (`**==bold==**`), not inside it.
 */
function remarkHighlight() {
  return (tree: MdastNode) => {
    const visit = (node: MdastNode) => {
      if (!node.children) return;
      node.children = node.children.flatMap((child) => {
        if (child.type !== "text" || !child.value?.includes("==")) {
          visit(child);
          return [child];
        }
        const parts: MdastNode[] = [];
        let last = 0;
        for (const match of child.value.matchAll(highlightPattern)) {
          if (match.index > last) {
            parts.push({ type: "text", value: child.value.slice(last, match.index) });
          }
          parts.push({
            type: "highlight",
            data: { hName: "mark", hProperties: { dataColor: match[1] ?? "yellow" } },
            children: [{ type: "text", value: match[2] }],
          });
          last = match.index + match[0].length;
        }
        if (last === 0) return [child];
        if (last < child.value.length) parts.push({ type: "text", value: child.value.slice(last) });
        return parts;
      });
    };
    visit(tree);
  };
}

const alertKinds = ["note", "tip", "important", "warning", "caution"] as const;
type AlertKind = (typeof alertKinds)[number];

const alertMarker = /^\[!(note|tip|important|warning|caution)\][^\S\n]*\n?/i;

/**
 * Remark plugin: a blockquote that starts with `[!NOTE]`, `[!TIP]`, `[!IMPORTANT]`,
 * `[!WARNING]` or `[!CAUTION]` (GitHub's alert syntax) becomes a callout box.
 */
function remarkAlerts() {
  return (tree: MdastNode) => {
    const visit = (node: MdastNode) => {
      if (node.type === "blockquote") {
        const first = node.children?.[0];
        const text = first?.type === "paragraph" ? first.children?.[0] : undefined;
        const match = text?.type === "text" ? text.value?.match(alertMarker) : null;
        if (first && text && match) {
          text.value = text.value?.slice(match[0].length);
          if (!text.value) first.children?.shift();
          if (!first.children?.length) node.children?.shift();
          node.data = { ...node.data, hProperties: { dataAlert: match[1].toLowerCase() } };
        }
      }
      node.children?.forEach(visit);
    };
    visit(tree);
  };
}

const highlightClassNames: Record<HighlightColor, string> = {
  yellow: "bg-yellow/20 text-yellow",
  green: "bg-green/15 text-green",
  blue: "bg-blue/25 text-foreground",
  red: "bg-red/20 text-red",
};

function Highlight({ color, children }: { color: unknown; children: ReactNode }) {
  const key = highlightColors.find((c) => c === color) ?? "yellow";
  return (
    <mark className={cn("rounded-xs px-1 box-decoration-clone", highlightClassNames[key])}>
      {children}
    </mark>
  );
}

const alertStyles: Record<AlertKind, { icon: LucideIcon; border: string; title: string }> = {
  note: { icon: Info, border: "border-l-blue", title: "text-blue" },
  tip: { icon: Lightbulb, border: "border-l-green", title: "text-green" },
  important: {
    icon: MessageSquareWarning,
    border: "border-l-foreground",
    title: "text-foreground",
  },
  warning: { icon: TriangleAlert, border: "border-l-yellow", title: "text-yellow" },
  caution: { icon: OctagonAlert, border: "border-l-red", title: "text-red" },
};

/** True when a paragraph holds only images (and whitespace between them). */
function isImageOnly(node: HastNode | undefined): boolean {
  const children = (node?.children ?? []).filter(
    (child) => !(child.type === "text" && !child.value?.trim()),
  );
  return children.length > 0 && children.every((child) => child.tagName === "img");
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

/** The source of a ```mermaid code block, or null for any other <pre>. */
function getMermaidSource(children: ReactNode): string | null {
  const child = Children.toArray(children)[0];
  if (!isValidElement<{ className?: string; children?: ReactNode }>(child)) return null;
  if (!child.props.className?.split(" ").includes("language-mermaid")) return null;
  const source = Children.toArray(child.props.children).join("");
  return source.trim() ? source : null;
}

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
      // `block` keeps several paragraphs apart without nesting a <p> in inline contexts.
      p: ({ children }) => <span className="block">{children}</span>,
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
      mark: ({ node, children }) => (
        <Highlight color={node?.properties.dataColor}>{children}</Highlight>
      ),
    };

    return (
      // `block`: an inline wrapper around the block paragraphs below makes the
      // browser add an empty line first, which pushes list bullets onto their own line.
      <span className={cn("block font-sans text-paragraph", className)}>
        <ReactMarkdown
          remarkPlugins={[remarkHighlight]}
          allowedElements={["p", "strong", "code", "a", "ul", "li", "mark"]}
          components={inlineComponents}
        >
          {content}
        </ReactMarkdown>
      </span>
    );
  }

  const components: Components = {
    h1: ({ id, children }) => (
      <h2 id={id} className="pt-4 font-mono text-h1 font-bold text-foreground first:pt-0">
        {children}
      </h2>
    ),
    h2: ({ id, children }) => (
      <h3 id={id} className="pt-3 font-mono text-h2 font-bold text-foreground first:pt-0">
        {children}
      </h3>
    ),
    h3: ({ id, children }) => (
      <h4 id={id} className="pt-2 font-mono text-lead font-bold text-foreground first:pt-0">
        {children}
      </h4>
    ),
    p: ({ node, children }) => {
      // A paragraph of only images renders its <figure>s directly (a figure cannot sit in a <p>).
      if (isImageOnly(node)) return <>{children}</>;
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
    mark: ({ node, children }) => (
      <Highlight color={node?.properties.dataColor}>{children}</Highlight>
    ),
    blockquote: ({ node, children }) => {
      const kind = alertKinds.find((k) => k === node?.properties.dataAlert);
      if (kind) {
        const { icon: Icon, border, title } = alertStyles[kind];
        return (
          <div
            className={cn(
              "flex flex-col gap-2 rounded-md border border-l-2 border-rule bg-surface px-4 py-3",
              border,
            )}
          >
            <p className={cn("flex items-center gap-2 font-mono text-body font-bold", title)}>
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              {t(site.ui.markdown.alerts[kind], lang)}
            </p>
            {children}
          </div>
        );
      }
      return (
        <blockquote className="border-l-2 border-green pl-4 font-sans text-paragraph text-gray italic">
          {children}
        </blockquote>
      );
    },
    pre: ({ children }) => {
      const block = (
        <pre
          tabIndex={0}
          className="overflow-x-auto rounded-md border border-rule bg-background p-4 font-mono text-body text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
        >
          {children}
        </pre>
      );
      const chart = getMermaidSource(children);
      return chart ? <MermaidDiagram chart={chart} fallback={block} /> : block;
    },
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
        {/* Fixed layout with the same column shares everywhere, so tables on one page
            line up: a narrow first column (dates), a fixed last column (place, role)
            when there are 3+ columns, and the rest for the middle. */}
        <table className="w-full table-fixed border-collapse text-left font-sans text-body [&_th:first-child]:w-1/5 [&_th:last-child:nth-child(n+3)]:w-1/3">
          {children}
        </table>
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
        const caption = alt?.trim();
        return (
          <figure className="flex flex-col items-center gap-2">
            <ResponsiveImage
              image={resolvedAsset}
              alt={caption ?? ""}
              sizes="(min-width: 960px) 640px, 100vw"
              // Capped at 480px tall and centered, so photos (portrait or landscape) do not
              // take over the screen; the aspect ratio is kept.
              className="h-auto max-h-120 w-auto rounded-md border border-rule object-contain"
            />
            {caption ? (
              // The alt text already names the image for screen readers, so the visible
              // caption is hidden from them to avoid reading it twice.
              <figcaption
                aria-hidden="true"
                className="text-center font-sans text-caption text-gray"
              >
                {caption}
              </figcaption>
            ) : null}
          </figure>
        );
      }
      return null;
    },
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkHighlight, remarkAlerts]}
        rehypePlugins={[rehypeHeadingIds]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
