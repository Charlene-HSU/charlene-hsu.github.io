import fs from "node:fs";
import path from "node:path";
import fm from "front-matter";
import { describe, expect, it } from "vitest";
import YAML from "yaml";
import {
  BlogFrontMatterSchema,
  BlogSlugSchema,
  ContactContentSchema,
  ExperienceContentSchema,
  FriendsContentSchema,
  OgCacheSchema,
  ProfileContentSchema,
  ProjectsContentSchema,
  SiteContentSchema,
  SkillsContentSchema,
  languages,
} from "@/types/content";
import { resolveBrandIcon } from "@/lib/brand-icons";
import { getFriendAvatarAsset, getFriendBadgeAsset, getProjectCoverAsset } from "@/lib/content";

const ROOT = path.resolve(__dirname, "../..");
const CONTENT_DIR = path.join(ROOT, "src/content");

/**
 * Whether a file exists with exactly this spelling. `fs.existsSync` ignores case on macOS
 * (and Windows) but not on Linux, where CI and the deploy build run, so a reference that
 * only differs in case would pass locally and break the build.
 */
function existsExactCase(fullPath: string): boolean {
  const relative = path.relative(ROOT, fullPath);
  let dir = ROOT;
  for (const segment of relative.split(path.sep)) {
    if (!fs.existsSync(dir) || !fs.readdirSync(dir).includes(segment)) return false;
    dir = path.join(dir, segment);
  }
  return true;
}

function loadYaml(filename: string): unknown {
  const fullPath = path.join(CONTENT_DIR, filename);
  return YAML.parse(fs.readFileSync(fullPath, "utf-8"));
}

describe("Content schemas and references", () => {
  it("validates site.yaml and ensures nav IDs are unique", () => {
    const site = SiteContentSchema.parse(loadYaml("site.yaml"));
    const navIds = site.nav.map((item) => item.id);
    expect(new Set(navIds).size).toBe(navIds.length);
  });

  it("allows every embedAllowlist domain in the index.html frame-src CSP", () => {
    const site = SiteContentSchema.parse(loadYaml("site.yaml"));
    const indexHtml = fs.readFileSync(path.join(ROOT, "index.html"), "utf-8");
    const frameSrc = indexHtml.match(/frame-src ([^;]*);/)?.[1].split(/\s+/) ?? [];
    for (const domain of site.embedAllowlist) {
      const clean = domain.trim().toLowerCase();
      // Subdomains are allowed too (see isDomainAllowed in embed.tsx).
      expect(frameSrc).toContain(`https://${clean}`);
      expect(frameSrc).toContain(`https://*.${clean}`);
    }
  });

  it("only references nav pages from the footer", () => {
    const site = SiteContentSchema.parse(loadYaml("site.yaml"));
    const navIds = new Set<string>(site.nav.map((item) => item.id));
    for (const id of site.footer.links) {
      expect(navIds.has(id), `footer link "${id}" is in nav`).toBe(true);
    }
    expect(new Set(site.footer.links).size).toBe(site.footer.links.length);
    if (site.footer.bottomLink.page) {
      expect(navIds.has(site.footer.bottomLink.page)).toBe(true);
    }
  });

  it("has a route file for every nav page", () => {
    const site = SiteContentSchema.parse(loadYaml("site.yaml"));
    const routesDir = path.join(ROOT, "src/routes/$lang");
    for (const item of site.nav) {
      const flat = path.join(routesDir, `${item.id}.tsx`);
      const nested = path.join(routesDir, item.id, "index.tsx");
      expect(existsExactCase(flat) || existsExactCase(nested), `route for "${item.id}"`).toBe(true);
    }
  });

  it("validates profile.yaml and checks the about markdown reference", () => {
    const profile = ProfileContentSchema.parse(loadYaml("profile.yaml"));

    for (const lang of languages) {
      const mdPath = path.join(CONTENT_DIR, "md", `${profile.about}.${lang}.md`);
      expect(existsExactCase(mdPath), `src/content/md/${profile.about}.${lang}.md`).toBe(true);
    }
  });

  it("validates skills.yaml", () => {
    const skills = SkillsContentSchema.parse(loadYaml("skills.yaml"));
    // Empty lists are allowed; the page shows an empty state instead.
    expect(Array.isArray(skills.groups)).toBe(true);
    expect(Array.isArray(skills.marquee)).toBe(true);
  });

  it("validates experience.yaml and ensures unique group and item IDs", () => {
    const experience = ExperienceContentSchema.parse(loadYaml("experience.yaml"));
    const groupIds = experience.groups.map((group) => group.id);
    expect(new Set(groupIds).size).toBe(groupIds.length);
    const ids = experience.groups.flatMap((group) => group.items.map((item) => item.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("validates projects.yaml, unique IDs, covers, and body markdown files", () => {
    const projects = ProjectsContentSchema.parse(loadYaml("projects.yaml"));
    const ids = projects.items.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const item of projects.items) {
      // Ask the site's own lookup, so a wrong case or an unsupported format fails here too.
      if (item.cover) {
        expect(
          getProjectCoverAsset(item.cover),
          `cover "${item.cover}" of "${item.id}" in src/assets/projects/ (webp, png, jpg, jpeg)`,
        ).toBeDefined();
      }
      if (item.body) {
        for (const lang of languages) {
          const mdPath = path.join(CONTENT_DIR, "md", `${item.body}.${lang}.md`);
          expect(existsExactCase(mdPath), `src/content/md/${item.body}.${lang}.md`).toBe(true);
        }
      }
    }
  });

  it("validates friends.yaml and ensures referenced avatars and badges exist", () => {
    const friends = FriendsContentSchema.parse(loadYaml("friends.yaml"));
    const site = SiteContentSchema.parse(loadYaml("site.yaml"));

    // The link-exchange avatar and badge on this site must be real files in public/.
    const origin = site.meta.url.replace(/\/$/, "");
    for (const url of [friends.exchange?.avatar, friends.exchange?.badge]) {
      if (url?.startsWith(`${origin}/`)) {
        const file = path.join(ROOT, "public", url.slice(origin.length + 1));
        expect(existsExactCase(file), `${url} needs public/${url.slice(origin.length + 1)}`).toBe(
          true,
        );
      }
    }
    for (const friend of friends.items) {
      if (friend.avatar) {
        expect(
          getFriendAvatarAsset(friend.avatar),
          `avatar "${friend.avatar}" in src/assets/friends/ (webp, png, jpg, jpeg)`,
        ).toBeDefined();
      }
      if (friend.badge) {
        expect(
          getFriendBadgeAsset(friend.badge),
          `badge "${friend.badge}" in src/assets/friends/badges/ (an 88×31 gif, png, webp or svg)`,
        ).toBeDefined();
      }
    }
  });

  it("validates contact.yaml", () => {
    const contact = ContactContentSchema.parse(loadYaml("contact.yaml"));

    // Icons are file names in src/assets/brands/, with or without the extension.
    for (const link of contact.links) {
      expect(
        resolveBrandIcon(link.icon),
        `icon "${link.icon}" in src/assets/brands/`,
      ).toBeDefined();
    }
  });

  it("validates .generated/og.json cache schema", () => {
    const ogRaw = JSON.parse(
      fs.readFileSync(path.join(CONTENT_DIR, ".generated/og.json"), "utf-8"),
    );
    OgCacheSchema.parse(ogRaw);
  });

  it("validates blog posts frontmatter, filename conventions, tags, and referenced images", () => {
    const site = SiteContentSchema.parse(loadYaml("site.yaml"));
    const blogDir = path.join(CONTENT_DIR, "blog");
    // Posts sit in blog/ or one sub-folder deep (blog/<folder>/); each folder needs a label.
    const files: string[] = [];
    for (const entry of fs.readdirSync(blogDir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        BlogSlugSchema.parse(entry.name);
        expect(
          site.blogFolders[entry.name],
          `label for folder "${entry.name}" in site.yaml blogFolders`,
        ).toBeDefined();
        for (const inner of fs.readdirSync(path.join(blogDir, entry.name), {
          withFileTypes: true,
        })) {
          expect(inner.isDirectory(), `nested folder blog/${entry.name}/${inner.name}`).toBe(false);
          if (inner.name.endsWith(".md")) files.push(path.join(entry.name, inner.name));
        }
      } else if (entry.name.endsWith(".md")) {
        files.push(entry.name);
      }
    }

    const seenSlugLang = new Set<string>();
    const tagsBySlug = new Map<string, string>();
    for (const file of files) {
      const matchedLang = languages.find((l) => file.endsWith(`.${l}.md`));
      expect(matchedLang, `language suffix of ${file}`).toBeDefined();
      const slug = path.basename(file).slice(0, -`.${matchedLang}.md`.length);
      BlogSlugSchema.parse(slug);

      const key = `${slug}:${matchedLang}`;
      expect(seenSlugLang.has(key), `slug "${slug}" is unique across folders`).toBe(false);
      seenSlugLang.add(key);

      const raw = fs.readFileSync(path.join(blogDir, file), "utf-8");
      const parsed = fm<unknown>(raw);
      const frontmatter = BlogFrontMatterSchema.parse(parsed.attributes);

      for (const tag of frontmatter.tags) {
        expect(site.blogTags[tag], `label for tag "${tag}" in site.yaml blogTags`).toBeDefined();
      }
      const tagKey = [...frontmatter.tags].sort().join(",");
      const previous = tagsBySlug.get(slug);
      if (previous !== undefined) {
        expect(tagKey, `translations of "${slug}" list the same tags`).toBe(previous);
      }
      tagsBySlug.set(slug, tagKey);

      // Images, links and syntax inside posts are checked in markdown-content.test.ts.
    }
  });
});

describe("Codebase architectural guardrails", () => {
  function walkSrcFiles(dir: string): string[] {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const out: string[] = [];
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "__tests__") continue;
        out.push(...walkSrcFiles(full));
      } else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
        if (entry.name === "routeTree.gen.ts") continue;
        out.push(full);
      }
    }
    return out;
  }

  const sourceFiles = walkSrcFiles(path.join(ROOT, "src"));
  const relative = (file: string) => path.relative(ROOT, file);

  it("forbids arbitrary Tailwind values, root-relative URLs, and raw HTML in components", () => {
    // Any utility with an arbitrary size or color: `h-[59px]`, `max-h-[30rem]`, `bg-[#fff]`, `font-['X']`.
    const arbitraryValue = /(?<![\w-])-?[a-z][a-z0-9-]*-\[(?:#|\d|\.|')[^\]]*\]/;
    // Arbitrary properties: `[box-decoration-break:clone]`.
    const arbitraryProperty = /["'`\s]\[[a-z-]+:[^\]\s]+\]/;
    const rootRelativeAttr = /\b(?:href|src)=["']\/[^"']*["']/;

    for (const file of sourceFiles) {
      const code = fs.readFileSync(file, "utf-8");
      expect(code, relative(file)).not.toMatch(arbitraryValue);
      expect(code, relative(file)).not.toMatch(arbitraryProperty);
      expect(code, relative(file)).not.toMatch(rootRelativeAttr);
      expect(code, relative(file)).not.toContain("dangerouslySetInnerHTML");
      expect(code, relative(file)).not.toContain("rehype-raw");
    }
  });

  it("only uses Tailwind classes that exist after the token reset", () => {
    // The default palette, type scale and extra font weights are removed in src/index.css,
    // so these classes silently do nothing.
    const resetClasses = [
      /(?<![\w-])(?:bg|text|border|fill|stroke|ring|outline)-(?:white|slate|zinc|neutral|stone|gray|red|green|blue|yellow|amber|orange|emerald|sky|indigo|violet|purple|pink|rose)-\d{2,3}\b/,
      /(?<![\w-])(?:bg|text|border)-white\b/,
      /(?<![\w-])text-(?:xs|sm|base|lg|xl|[2-9]xl)\b/,
      /(?<![\w-])font-(?:thin|extralight|light|medium|semibold|extrabold|black)\b/,
    ];
    for (const file of sourceFiles) {
      const code = fs.readFileSync(file, "utf-8");
      for (const pattern of resetClasses) {
        expect(code, relative(file)).not.toMatch(pattern);
      }
    }
  });

  it("builds interactive controls on Base UI, not raw elements", () => {
    const rawControl = /<(?:button|input|select|textarea|dialog)[\s>]/;
    for (const file of sourceFiles) {
      if (file.includes(`${path.sep}components${path.sep}ui${path.sep}`)) continue;
      expect(fs.readFileSync(file, "utf-8"), relative(file)).not.toMatch(rawControl);
    }
  });

  it("imports Lucide icons by name and keeps localStorage in the i18n module", () => {
    for (const file of sourceFiles) {
      const code = fs.readFileSync(file, "utf-8");
      expect(code, relative(file)).not.toMatch(
        /import\s+\*\s+as\s+\w+\s+from\s+["']lucide-react["']/,
      );
      if (!file.endsWith(path.join("lib", "i18n.ts"))) {
        expect(code, `${relative(file)}: localStorage belongs in src/lib/i18n.ts`).not.toContain(
          "localStorage",
        );
      }
    }
  });

  it("does not add smooth scrolling", () => {
    const css = fs.readFileSync(path.join(ROOT, "src/index.css"), "utf-8");
    expect(css).not.toMatch(/scroll-behavior\s*:\s*smooth/);
    for (const file of sourceFiles) {
      expect(fs.readFileSync(file, "utf-8"), relative(file)).not.toMatch(/\bscroll-smooth\b/);
    }
  });

  it("only uses approved Markdown plugins and no third-party scripts", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf-8")) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
    // Adding another remark/rehype plugin needs the owner's approval (see AGENTS.md).
    const approved = new Set(["remark-gfm"]);
    for (const dep of deps.filter((d) => /^(?:remark|rehype)-/.test(d))) {
      expect(approved.has(dep), `Markdown plugin "${dep}" is not approved`).toBe(true);
    }
    const indexHtml = fs.readFileSync(path.join(ROOT, "index.html"), "utf-8");
    expect(indexHtml).not.toMatch(/<script[^>]+src=["']https?:/);
  });
});
