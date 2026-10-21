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
