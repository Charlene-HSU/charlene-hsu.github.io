import { useEffect, useId, useState, type ReactNode } from "react";
import { site } from "@/lib/content";
import { useI18n } from "@/lib/i18n";

type Mermaid = typeof import("mermaid").default;

let mermaidPromise: Promise<Mermaid> | undefined;

// Mermaid is large, so it is only downloaded once a page actually contains a diagram.
function loadMermaid(): Promise<Mermaid> {
  mermaidPromise ??= import("mermaid").then(({ default: mermaid }) => {
    // Read the design tokens so diagrams follow src/index.css.
    const css = getComputedStyle(document.documentElement);
    const color = (name: string) => css.getPropertyValue(`--color-${name}`).trim();
    // The SVG is shown through <img>, which cannot use the site's web fonts, so
    // local CJK fonts come first to keep measured and drawn text the same width.
    const fontFamily = `"PingFang TC", "Microsoft JhengHei", ${css.getPropertyValue("--font-sans")}`;
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      htmlLabels: false,
      theme: "base",
      fontFamily,
      themeVariables: {
        darkMode: true,
        fontFamily,
        fontSize: "15px",
        background: color("surface"),
        mainBkg: color("background"),
        primaryColor: color("background"),
        primaryTextColor: color("foreground"),
        primaryBorderColor: color("rule"),
        secondaryColor: color("surface"),
        secondaryTextColor: color("foreground"),
        secondaryBorderColor: color("rule"),
        tertiaryColor: color("surface"),
        tertiaryTextColor: color("foreground"),
        tertiaryBorderColor: color("rule"),
        nodeBorder: color("gray"),
        lineColor: color("gray"),
        textColor: color("foreground"),
        titleColor: color("foreground"),
        edgeLabelBackground: color("surface"),
        clusterBkg: color("surface"),
        clusterBorder: color("rule"),
        noteBkgColor: color("surface"),
        noteTextColor: color("foreground"),
        noteBorderColor: color("green"),
        errorBkgColor: color("red"),
        errorTextColor: color("background"),
      },
    });
    return mermaid;
  });
  return mermaidPromise;
}

interface Diagram {
  src: string;
  width: number;
  height: number;
  label: string | undefined;
}

async function renderDiagram(id: string, chart: string): Promise<Diagram> {
  const mermaid = await loadMermaid();
  const { svg } = await mermaid.render(id, chart);
  const root = new DOMParser().parseFromString(svg, "image/svg+xml").documentElement;
  const [, , width = 0, height = 0] = (root.getAttribute("viewBox") ?? "")
    .split(/[\s,]+/)
    .map(Number);
  // `accDescr` (or `accTitle`) in the diagram becomes the image's alt text.
  const label =
    root.querySelector(":scope > desc")?.textContent?.trim() ||
    root.querySelector(":scope > title")?.textContent?.trim() ||
    undefined;
  return {
    src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    width: Math.ceil(width),
    height: Math.ceil(height),
    label,
  };
}

interface MermaidDiagramProps {
  chart: string;
  /** Shown before the diagram renders (prerendered HTML) and if the syntax is invalid. */
  fallback: ReactNode;
}

export function MermaidDiagram({ chart, fallback }: MermaidDiagramProps) {
  const { t } = useI18n();
  const id = `mermaid-${useId().replace(/[^a-zA-Z0-9-]/g, "")}`;
  const [diagram, setDiagram] = useState<Diagram | null>(null);

  useEffect(() => {
    let cancelled = false;
    renderDiagram(id, chart).then(
      (result) => {
        if (cancelled) return;
        if (import.meta.env.DEV && !result.label) {
          console.warn("Mermaid diagram has no accDescr; using the generic alt text.");
        }
        setDiagram(result);
      },
      (error: unknown) => {
        if (import.meta.env.DEV) console.warn("Mermaid diagram failed to render.", error);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [id, chart]);

  if (!diagram) return fallback;

  return (
    <figure className="overflow-x-auto rounded-md border border-rule bg-surface p-4">
      <img
        src={diagram.src}
        alt={diagram.label ?? t(site.ui.embed.diagramAlt)}
        width={diagram.width}
        height={diagram.height}
        loading="lazy"
        className="mx-auto block h-auto max-w-full"
      />
    </figure>
  );
}
