import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Markdown } from "@/components/markdown";
import { I18nProvider } from "@/lib/i18n";

function render(content: string): string {
  return renderToString(
    <StrictMode>
      <I18nProvider lang="en">
        <Markdown content={content} />
      </I18nProvider>
    </StrictMode>,
  );
}

describe("Markdown headings", () => {
  it("gives repeated headings unique ids and keeps code text in them", () => {
    const html = render(["# Setup", "", "## Install `pnpm`", "", "# Setup"].join("\n"));
    expect(html).toContain('id="setup"');
    expect(html).toContain('id="install-pnpm"');
    expect(html).toContain('id="setup-2"');
    expect(html).not.toContain("setup-3");
  });
});

describe("Markdown highlights", () => {
  it("turns ==text== into a mark and reads the color", () => {
    const html = render("Plain ==yellow== and =={red}danger== and =={pink}x== `==code==`");
    expect(html).toContain("<mark");
    expect(html).toContain("text-yellow");
    expect(html).toContain("text-red");
    expect(html).toContain(">danger</mark>");
    // An unknown color is left as plain text, and code is never highlighted.
    expect(html).toContain("=={pink}x==");
    expect(html).toContain("==code==");
  });

  it("leaves a lone or spaced == alone", () => {
    const html = render("a == b and == c ==");
    expect(html).not.toContain("<mark");
  });
});

describe("Markdown alerts", () => {
  it("turns > [!WARNING] into a titled callout", () => {
    const html = render("> [!WARNING]\n> Be careful.");
    expect(html).toContain("Warning");
    expect(html).toContain("Be careful.");
    expect(html).not.toContain("[!WARNING]");
    expect(html).not.toContain("<blockquote");
  });

  it("keeps plain quotes as blockquotes", () => {
    expect(render("> Just a quote.")).toContain("<blockquote");
  });
});

describe("Markdown images", () => {
  it("does not wrap an image paragraph in <p>", () => {
    // An unknown image renders nothing, but the paragraph around it must not be a <p>.
    expect(render("![caption](missing.jpg)")).not.toContain("<p");
  });
});
