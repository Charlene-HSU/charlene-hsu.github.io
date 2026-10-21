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

const ROOT = path.resolve(__dirname, "../..");
const CONTENT_DIR = path.join(ROOT, "src/content");
const ASSETS_DIR = path.join(ROOT, "src/assets");

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
      expect(fs.existsSync(flat) || fs.existsSync(nested), `route for "${item.id}"`).toBe(true);
    }
  });

  it("validates profile.yaml and checks the about markdown reference", () => {
    const profile = ProfileContentSchema.parse(loadYaml("profile.yaml"));

    for (const lang of languages) {
      const mdPath = path.join(CONTENT_DIR, "md", `${profile.about}.${lang}.md`);
      expect(fs.existsSync(mdPath)).toBe(true);
    }
  });

  it("validates skills.yaml", () => {
    const skills = SkillsContentSchema.parse(loadYaml("skills.yaml"));
    expect(skills.groups.length).toBeGreaterThan(0);
    expect(skills.marquee.length).toBeGreaterThan(0);
  });

  it("validates experience.yaml and ensures unique item IDs", () => {
    const experience = ExperienceContentSchema.parse(loadYaml("experience.yaml"));
    const ids = experience.items.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("validates projects.yaml, unique IDs, covers, and body markdown files", () => {
    const projects = ProjectsContentSchema.parse(loadYaml("projects.yaml"));
    const ids = projects.items.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const item of projects.items) {
      if (item.cover) {
        const coverPath = path.join(ASSETS_DIR, "projects", item.cover);
        expect(fs.existsSync(coverPath)).toBe(true);
      }
      if (item.body) {
        for (const lang of languages) {
          const mdPath = path.join(CONTENT_DIR, "md", `${item.body}.${lang}.md`);
          expect(fs.existsSync(mdPath)).toBe(true);
        }
      }
    }
  });

  it("validates friends.yaml and ensures referenced avatars and badges exist", () => {
    const friends = FriendsContentSchema.parse(loadYaml("friends.yaml"));
    for (const friend of friends.items) {
      if (friend.avatar) {
        const avatarPath = path.join(ASSETS_DIR, "friends", friend.avatar);
        expect(fs.existsSync(avatarPath)).toBe(true);
      }
      if (friend.badge) {
        const badgePath = path.join(ASSETS_DIR, "friends/badges", friend.badge);
        expect(fs.existsSync(badgePath)).toBe(true);
      }
    }
  });

  it("validates contact.yaml", () => {
    const contact = ContactContentSchema.parse(loadYaml("contact.yaml"));
    expect(contact.links.length).toBeGreaterThan(0);

    // Icons are file names in src/assets/brands/, with or without the extension.
    const brandFiles = fs
      .readdirSync(path.join(ASSETS_DIR, "brands"))
      .filter((f) => /\.(svg|png|webp|jpe?g)$/i.test(f))
      .map((f) => f.toLowerCase());
    const brandNames = new Set([
      ...brandFiles,
      ...brandFiles.map((f) => f.replace(/\.[^.]+$/, "")),
    ]);
    for (const link of contact.links) {
      expect(
        brandNames.has(link.icon.toLowerCase()),
        `icon "${link.icon}" in src/assets/brands/`,
      ).toBe(true);
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
    const files = fs.readdirSync(blogDir).filter((f) => f.endsWith(".md"));
    expect(files.length).toBeGreaterThan(0);

    const seenSlugLang = new Set<string>();
    const tagsBySlug = new Map<string, string>();
    for (const file of files) {
      const matchedLang = languages.find((l) => file.endsWith(`.${l}.md`));
      expect(matchedLang, `language suffix of ${file}`).toBeDefined();
      const slug = file.slice(0, -`.${matchedLang}.md`.length);
      BlogSlugSchema.parse(slug);

      const key = `${slug}:${matchedLang}`;
      expect(seenSlugLang.has(key)).toBe(false);
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

      const imageRegex = /!\[[^\]]*\]\(([^)]+)\)/g;
      for (const match of parsed.body.matchAll(imageRegex)) {
        const imgSrc = match[1].trim();
        if (!imgSrc.startsWith("https://")) {
          const cleanImg = imgSrc.replace(/^\.\//, "");
          const assetPath = path.join(ASSETS_DIR, "blog", slug, cleanImg);
          expect(fs.existsSync(assetPath)).toBe(true);
        }
      }
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

  it("forbids arbitrary Tailwind size/color values, root-relative URLs, and raw HTML in components", () => {
    const files = walkSrcFiles(path.join(ROOT, "src"));
    const arbitraryTailwindRegex =
      /\b(?:bg|text|rounded|h|w|p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|gap|leading|font)-\[(?:#|\d|\.|')[^\]]+\]/;
    const rootRelativeAttrRegex = /\b(?:href|src)=["']\/[^"']*["']/;

    for (const file of files) {
      const code = fs.readFileSync(file, "utf-8");
      expect(code).not.toMatch(arbitraryTailwindRegex);
      expect(code).not.toMatch(rootRelativeAttrRegex);
      expect(code).not.toContain("dangerouslySetInnerHTML");
      expect(code).not.toContain("rehype-raw");
    }
  });
});
