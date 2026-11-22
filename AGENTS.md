# AGENTS.md

Guidance for AI coding agents working in this repository. This is a bilingual (English / Traditional Chinese) personal portfolio site with a black-and-white, terminal-inspired look. It has a home page (hero, status and tech marquee) plus one page each for About, Skills, Experience, Projects, Blog, Friends and Contact. The blog has a post list with tag filters and one page per post. The site is published as a static site on GitHub Pages. README.md is the public introduction and quick start; keep implementation and operational details here. `CLAUDE.md` is a symlink to this file, so maintain one shared agent guide.

The visual and engineering conventions are modeled on the [SITCON 2027 CFP site](https://github.com/sitcon-tw/2027-cfp) (MIT). Borrow its layout ideas and rules, never its branding, photos, copy or other assets.

> Status: this guide describes the target structure. Create files and scripts as the milestones land, and keep this guide in sync when the structure changes.

## Stack

React 19, Vite, Tailwind CSS v4, TypeScript, pnpm (npm, yarn and bun are blocked). Base UI (`@base-ui/react`), TanStack Router (file-based), `clsx` + `tailwind-merge` (via `cn()`), `lucide-react`. Run `pnpm check` (typecheck, lint, format check) before finishing a task.

- Import from `src` with the `@/` alias (`@/components/ui/button`, `@/lib/utils`).
- Content: YAML files (via a Vite YAML plugin, e.g. `@modyfi/vite-plugin-yaml`) and Markdown files rendered with `react-markdown` (+ `remark-gfm`, `front-matter`).
- Content checks: `zod` and Vitest.
- Design source: there is no Figma file yet. The tokens in this guide and in `src/index.css` are the source of truth. If a Figma file is added, link it here and follow it instead.

## Development and verification

- Use the Node version selected by `.nvmrc` (22). `package.json` pins the pnpm version in `packageManager` and blocks other package managers (`only-allow pnpm`). Use pnpm only.
- Run `pnpm install`, then `pnpm dev` from the repository root. No environment variables or backend are needed.
- `pnpm check` runs typecheck, lint, and formatting checks. Run it before finishing every task.
- `pnpm test` runs Vitest, including the content checks. Run it after changing content schemas, i18n, Markdown rendering, or the link-preview script.
- `pnpm build` runs `fetch-og`, typechecks, builds the browser bundle, and prerenders the public pages into `dist/`. `pnpm preview` serves that build. Route generation happens during `pnpm dev` or `pnpm build`.
- `pnpm og:refresh` re-fetches every link preview, ignoring the cache.
- `pnpm check` and `pnpm test` must work offline. Only `fetch-og` (part of `pnpm build`) uses the network.
- Do not install or switch toolchains to resolve check failures without the user's authorization. Report unavailable checks instead.

## Project map

- `src/content/`: everything the owner edits (YAML and Markdown). See [User-facing content](#user-facing-content).
- `src/lib/`: domain logic: i18n (`i18n.ts`), typed content exports (`content.ts`), Markdown loading (`markdown.ts`), `cn()` (`utils.ts`).
- `src/types/`: content types and `*.yaml` module declarations.
- `src/components/ui/`: Base UI primitives. `src/components/`: site-level components. `src/routes/`: routes.
- `src/index.css`: design tokens and shared CSS. `src/assets/`: imported artwork (`projects/`, `friends/`, `blog/`, `brands/`).
- `docs/`: guides for the owner (`mermaid.md`, `markdown.md`). Not published on the site.
- `fonts/`: self-hosted fonts. `public/`: files copied directly to the build output.
- `scripts/`: `prerender.mjs`, `fetch-og.mjs`, `build-sitemap.mjs`.
- `vite.config.ts`: base path, YAML plugin, font subsetting, image presets, router generation.
- `.github/workflows/`: CI and the GitHub Pages deployment.

## User-facing content

- **All user-facing literals live in `src/content/`.** This is the only place the owner edits: visible copy, button and link labels, navigation, image alt text, accessibility labels, placeholders, dates and units, browser metadata, example text, and outbound URLs.
- Do not hardcode new copy in TS/TSX/HTML and do not create another copy file. Interface chrome (button labels, `aria-label`s, validation or toast messages, section titles) lives under `ui` in `site.yaml`.
- Keep complete sentences in content files. For dynamic text, use named placeholders such as `{count}` and substitute values in code; never concatenate hardcoded words or punctuation.
- Technical identifiers (route paths, anchor ids, CSS classes, state values) and calculated numbers may stay in code. Display labels for technical values belong in content.
- YAML holds structured data (lists, dates, links, tags). Markdown holds long-form text (About, project descriptions, friend-link rules, blog posts).

| File                 | Purpose                                                                                                                                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `site.yaml`          | Metadata, `nav` (single source for pages and the navbar), `footer` (links, columns, bottom-right link), `blogTags`, `blogFolders`, UI strings, `embedAllowlist`                                        |
| `profile.yaml`       | Name, title, location, timezone, tagline, status, stats, `about`, `intro`                                                                                                                              |
| `skills.yaml`        | Skill groups and the marquee list                                                                                                                                                                      |
| `experience.yaml`    | Experience page blocks (`groups`, e.g. education and competitions)                                                                                                                                     |
| `projects.yaml`      | Projects, links and embeds                                                                                                                                                                             |
| `friends.yaml`       | Friend sites and the link-exchange card                                                                                                                                                                |
| `contact.yaml`       | Email and contact links: `label`, `icon` (file in `src/assets/brands/`), optional `iconStyle` (`mono`/`color`), and exactly one of `url` (opens) or `text` (shown and copied, e.g. a Discord username) |
| `md/`                | Markdown for About (`about.<lang>.md`) and projects (`projects/<id>.<lang>.md`)                                                                                                                        |
| `blog/`              | Blog posts (`<slug>.<lang>.md`), one page each                                                                                                                                                         |
| `.generated/og.json` | Cache written by `fetch-og`. Commit it. Never edit it by hand                                                                                                                                          |

Conventions:

- A translatable value is `string | { en: string; "zh-TW": string }`. Values that do not need translation (URLs, dates, tags, ids) are plain values. Resolve values with `t(value, lang)` from `@/lib/i18n`.
- Lists and optional fields may be left empty (`items:`), written as `null` or omitted; all mean "none". Build them with `yamlList()` / `yamlOptional()` from `src/types/content.ts`, never a bare `z.array()` or `.optional()`. Every section shows an empty state (`ui.sections.<page>.empty`) or hides the block instead of crashing, and `friends.exchange` can be removed to hide the link-exchange card.
- Dates are `YYYY-MM` or `YYYY-MM-DD`. `end: null` means "present". Status badges (Present, Ended, Archived) are computed from dates and status fields, not typed by hand.
- Types for every content file live in `src/types/content.ts`; typed exports live in `src/lib/content.ts`. Never import YAML directly from components.
- Content checks (Vitest) must keep passing: required fields exist in both languages and both use the same `{placeholders}`, ids are unique, URLs are valid `https` (or `mailto:`), referenced Markdown, covers, avatars, badges and brand icons exist, blog `title` and `date` are present, blog slugs are URL-safe and unique, every blog tag has a label in `blogTags`, translations of one post list the same tags, and drafts stay out of the published pages. Inside Markdown (`markdown-content.test.ts`): images are local, resolvable and have alt text; links are `https://`, `mailto:`, an existing `#heading` or an existing site page (and `?tag=` a known tag); highlight colors and callout types are valid; every Mermaid diagram has `accDescr`.
- File references are checked the way the site resolves them, never with `fs.existsSync` alone: it ignores case on macOS but not on Linux, where CI builds. Use the runtime lookups (`getProjectCoverAsset`, `getMarkdownAsset`, `resolveBrandIcon`, …) or `existsExactCase()` in `content.test.ts`.
- Code guardrails in `content.test.ts` enforce parts of this guide: no arbitrary Tailwind values or properties, no classes removed by the token reset (`text-sm`, `bg-white`, `font-medium`, …), no raw `<button>`/`<input>`/… outside `src/components/ui/`, no `import * as` from `lucide-react`, `localStorage` only in `src/lib/i18n.ts`, no smooth scrolling, no unapproved `remark-`/`rehype-` packages, no third-party scripts in `index.html`.

For a content update: edit the relevant file under `src/content/`, keep its structure, run `pnpm check` and `pnpm test`, then review with `pnpm dev`.

## Internationalization

- Supported languages: `en` and `zh-TW`. Every `zh*` locale maps to `zh-TW`; everything else maps to `en`. There is no Simplified Chinese version.
- Routes are path-based: `/` (language detection and redirect), then every page under a language prefix (`/en/…`, `/zh-TW/…`, see [Pages and routes](#pages-and-routes)). `src/routes/index.tsx` redirects in `beforeLoad`; `src/routes/$lang/route.tsx` validates the param (invalid → not found), provides the i18n context, and sets `<html lang>`.
- Detection order: URL prefix → language stored in `localStorage` → `navigator.languages` (first supported match wins) → `en`. Wrap every `localStorage` access in `try/catch` and only run it in the browser, so prerendering stays safe.
- The language switcher (Base UI `Menu`) stays on the same page in the other language (same path after the prefix, same search params and hash, same blog post) and stores the choice.
- The prerendered `/` shell contains a tiny inline detection script, a `<noscript>` link to each language, and `hreflang` plus `x-default` alternates. Every page has its own title, description, Open Graph metadata, canonical URL and `hreflang` links.
- If a translation is missing, fall back to the other language and warn in development. Do not hide the content.
- Format dates and numbers with `Intl` using the current language.

## Pages and routes

The site is a set of static pages, not one long page. Each page is its own route with its own URL, title and metadata.

| Page       | Route (per language) | Content                                                                                                                                                                                                                                                                                                    |
| ---------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home       | `/$lang/`            | Hero (name, title, typewriter tagline), a short self-introduction (`profile.yaml` `intro`, inline Markdown) with a large button to About (`ui.aboutIntro.more`; `shortcuts.about: false` hides the block), status and clock cards, shortcuts to recent or pinned projects and posts, then the tech marquee |
| About      | `/$lang/about/`      | Stats and the About Markdown in a terminal window                                                                                                                                                                                                                                                          |
| Skills     | `/$lang/skills/`     | Skill groups in `Tabs`                                                                                                                                                                                                                                                                                     |
| Experience | `/$lang/experience/` | Work and study history                                                                                                                                                                                                                                                                                     |
| Projects   | `/$lang/projects/`   | Project tiles and detail panel (see [Projects](#projects-embeds-and-link-previews))                                                                                                                                                                                                                        |
| Blog       | `/$lang/blog/`       | Tag filter row, then the post list (see [Blog](#blog))                                                                                                                                                                                                                                                     |
| Blog post  | `/$lang/blog/$slug/` | One post                                                                                                                                                                                                                                                                                                   |
| Friends    | `/$lang/friends/`    | Friend cards and the link-exchange card                                                                                                                                                                                                                                                                    |
| Contact    | `/$lang/contact/`    | Email card and social links                                                                                                                                                                                                                                                                                |

- Route files: `src/routes/$lang/index.tsx` (home), `about.tsx`, `skills.tsx`, `experience.tsx`, `projects.tsx`, `friends.tsx`, `contact.tsx`, `blog/index.tsx` and `blog/$slug.tsx` under `src/routes/$lang/`. Each route renders one section component from `src/components/sections/` and nothing else.
- The router uses `trailingSlash: "always"`, so `to` paths end with `/` (`"/$lang/"`, `"/$lang/blog/"`, `"/$lang/blog/$slug/"`). Follow the paths the generated route tree type-checks.
- Each page except Home opens with the shared page header (`SectionShell`): the comment eyebrow (`projects`) and the page title as the page's only `<h1>`. On Home the owner's name is the `<h1>`. Headings inside a page start at `<h2>`.
- Page content starts below the overlaid header: every page pads its top with `pt-header`. Pages share the same column, gutter and vertical padding.
- Page titles and descriptions come from content: each `nav` entry has a localized `description`; the document title uses `ui.pageTitleTemplate` (for example `"{page} — {site}"`). Blog posts use their own `title` and `description`.
- Navigating to another page scrolls to the top. Keep the router's scroll restoration for back and forward.
- Unknown paths render a not-found page (`notFoundComponent` on the `$lang` route, copy in `ui.notFound`) with a link home. The root `notFoundComponent` covers paths without a valid language.

## Navigation and icons

- `site.yaml` `nav` is the single source for the pages and the navbar; the footer picks from it. Every page except Home has one entry: `id` (also the route segment, so `projects` → `/$lang/projects/`), `icon`, localized `label` and localized `description`. Adding a page means adding one entry, one route file and one section component.
- The footer is configured in `site.yaml` `footer`: `links` (nav ids, in order), `columns` (1–4; phones show at most two) and `bottomLink` (`page`, a nav id, or `url`, `https://` or `mailto:`, plus a localized `label`). Its bottom-left row is `ui.footer.license` (a link to `licenseUrl` with `licenseTooltip` on hover or focus), and the site word count (`ui.footer.wordCount`, all Markdown in the current language, from `src/lib/word-count.ts`). There is no page-view counter. It has no friends or social columns.
- The navbar brand shows `ui.brand` followed by `ui.brandHome` (for example `~/HOME`) and links to Home; it is highlighted on Home only.
- Navbar links use `<Link>` and mark the current page with `aria-current="page"` and an active style (TanStack Router's `activeProps`, or `data-status="active"`). Blog post pages count as the Blog page. The brand link goes Home.
- The hero has no page buttons; the navbar is the way to the other pages.
- Icons are `lucide-react` names written in YAML and resolved through an allowlist mapping in code, so only used icons are bundled. Never import the whole icon set. Icons are decorative (`aria-hidden`); the label provides the text.

## Markdown

- Render all Markdown through the shared `<Markdown>` component (`react-markdown` + `remark-gfm`). Front matter is parsed with `front-matter`.
- Supported: GFM (tables, task lists, strikethrough), links, images, headings with anchors, code blocks, and a standalone URL on its own line, which becomes a link card (implemented by overriding the `p` component). Links: `http(s)://` and `mailto:` open in a new tab, `#anchor` stays on the page, a site path such as `/en/blog/hello-world/` goes to that page (the deploy base path is added automatically), and anything else goes home. Heading anchor ids are set by a small local rehype step in `markdown.tsx` (not a package); repeated headings get `-2`, `-3`, ….
- **Raw HTML is not supported.** Never enable `rehype-raw` or `dangerouslySetInnerHTML` for content.
- External links get `target="_blank"` and `rel="noopener noreferrer"` plus an external-link icon. Internal links use `<Link>`.
- Relative images resolve against `src/assets/` (project covers, `blog/<slug>/`, file names matched case-insensitively) and use the `?responsive` pipeline. Each image renders as a centered `<figure>` capped at `max-h-120`; a non-empty alt is also shown as a `<figcaption>` (`aria-hidden`, since the alt already names the image). A paragraph of only images is not wrapped in `<p>`.
- Diagrams: a fenced ` ```mermaid ` block renders as a [Mermaid](https://mermaid.js.org) diagram (`src/components/mermaid-diagram.tsx`, approved by the owner). Mermaid is loaded with a dynamic `import()` only on pages that have a diagram, uses `securityLevel: "strict"` and the colors from `src/index.css`, and the result is shown as an `<img>` with an SVG data URL, so no generated markup enters the page. The prerendered HTML (and an invalid diagram) shows the source as a code block. Write `accDescr: …` in the diagram for the alt text; without it the alt is `ui.embed.diagramAlt`. The owner's guide (Traditional Chinese) is `docs/mermaid.md`; keep it in sync with this behavior.
- Highlights and callouts (local remark steps in `markdown.tsx`, approved by the owner): `==text==` renders as a `<mark>` (yellow), `=={green|blue|red}text==` picks another color; a blockquote starting with `[!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]` or `[!CAUTION]` (GitHub alert syntax) renders as a callout titled from `ui.markdown.alerts`. Highlights also work in `<Markdown inline>`. The owner's guide is `docs/markdown.md`; keep it in sync.
- Phase 2 (add only when the owner asks): `remark-directive` for `::embed{kind="…" url="…"}` and `rehype-highlight` for code highlighting. Do not add other Markdown plugins or renderers without approval.
- Inline Markdown fields in YAML (for example experience `highlights`, friend `rules`) render through `<Markdown inline>`, which only supports bold, links, inline code and `==highlights==`.

### Home shortcuts

- Between the status cards and the marquee, the home page links to projects and posts that were updated in the last `site.yaml` `shortcuts.recentDays` days (default 30), plus anything marked `pinned: true`. Pinned items come first, then newest first, at most `shortcuts.limit` items. With nothing to show, the block is not rendered.
- A project's date is `updated` (`YYYY-MM` or `YYYY-MM-DD`) in `projects.yaml`, falling back to `period.start`; a post's is `updated` in its front matter, falling back to `date`. `pinned: true` goes in the same places.
- The logic lives in `src/lib/shortcuts.ts` (`getShortcuts`). Prerendered HTML uses the build time (`__BUILD_TIME__`, injected by `vite.config.ts`); after hydration the visitor's clock is used, so shortcuts expire without a rebuild.

### Blog

The blog has two kinds of page: the list (`/$lang/blog/`) and one page per post (`/$lang/blog/$slug/`).

**Posts**

- Posts are `src/content/blog/<slug>.<lang>.md`. The slug is lowercase letters, digits and hyphens, and is shared by all translations of a post.
- A post may sit one folder deep, `src/content/blog/<folder>/<slug>.<lang>.md`, to group a series. The folder does not change the URL (still `/$lang/blog/<slug>/`), so slugs stay unique across folders. Each folder needs an entry in `site.yaml` `blogFolders` (`<folder>: { title, description? }`, localized). Deeper nesting is not supported.
- Front matter: `title` and `date` (`YYYY-MM-DD`) are required; `description` (one or two sentences, used in the list and in page metadata) and `tags` (list of tag ids) are optional; `draft: true` shows the post in development only.
- Tags are language-neutral ids (lowercase, hyphenated, for example `frontend`). Their display labels live in `site.yaml` `blogTags` (`{ <id>: { en, zh-TW } }`), so a tag reads correctly in both languages. Every translation of a post lists the same tags.
- Load posts with `import.meta.glob("/src/content/blog/**/*.md", { query: "?raw", import: "default", eager: true })` through `src/lib/markdown.ts`. Components never parse posts themselves.
- If a post has no file for the current language, show the available one without a badge or notice. Its canonical URL and `hreflang` links point only to the languages that have a file.

**List page (`/$lang/blog/`)**

- At the top, one row of tag filters: an "All" option first, then every tag in use (sorted by post count, then label), each with its count. Build it with Base UI `ToggleGroup` (single selection, `Toggle` items styled like small badges). On narrow screens the row scrolls horizontally instead of wrapping into many lines.
- The selected tag is a validated search param (`?tag=<id>`, `validateSearch`); unknown tags fall back to "All". Filtering happens in the browser on prerendered data. Prerender only the unfiltered list.
- Below the row, posts newest first. Each item shows the date, title, description (if any) and tags, and the whole item is one `<Link>` to the post page. No excerpts generated from the body.
- Posts in a folder collapse into one folder item (Base UI `Collapsible`, closed by default, opened while a tag filter is active), dated by its newest post and showing `ui.sections.blog.folderCount`. Inside it, pinned posts come first, then file-name order. The panel uses `hiddenUntilFound`, so its links stay in the prerendered HTML. From `xl` up, while the list still has posts outside folders, the folders leave the list and sit in a sticky side list placed like a post's table of contents (`src/components/blog-folder-nav.tsx`, title `ui.sections.blog.foldersTitle`). The side list sits in a flex row with the post list, not absolutely positioned, so an opened folder lengthens the page instead of covering the footer.
- Empty states use `ui.sections.blog.empty` (no posts) and `ui.sections.blog.emptyTag` (no posts with the selected tag).

**Post page (`/$lang/blog/$slug/`)**

- An `<article>` with: a back link to the list, the title as `<h1>`, the date (`<time dateTime>`), tags as links to `/$lang/blog/?tag=<id>`, then the body through `<Markdown>`. Markdown headings inside a post start at `<h2>`.
- An unknown or (in production) draft slug throws `notFound()` in the route's `beforeLoad`.
- Images for a post live in `src/assets/blog/<slug>/` and are referenced relatively from the Markdown.
- From `xl` up, a post with two or more headings shows a sticky table of contents on the right: it starts under the navbar's GitHub button and reaches past the `max-w-content` column, and the post leaves room with `xl:pr-26` (`src/components/table-of-contents.tsx`, title `ui.sections.blog.tocTitle`); it lists the top-level headings, and each one's subheadings sit in a `Collapsible` that starts closed (arrow label `ui.sections.blog.tocExpandAriaLabel`). The section the reader is in is highlighted. Heading ids come from `getHeadings()` in `src/lib/headings.ts`, which must match the ids `markdown.tsx` sets (a test checks every post).
- Do not add reading time, covers, pagination, previous/next links, RSS, comments or search unless the owner asks.

## Projects, embeds and link previews

- Projects have **no per-project pages**. The Projects page shows a list of tiles and one detail panel: side by side from `md` up, with the tiles stacked above the panel on mobile. The selected project is kept in a validated search param (`?p=<id>`, `validateSearch`) so it can be shared without adding a route. Selecting a project replaces the search param without scrolling the page. Render the detail panel once (not one copy for desktop and another for mobile) so ids and images are not duplicated.
- Panel content: cover, summary, link buttons, optional Markdown body (`body: projects/<id>` → `md/projects/<id>.<lang>.md`), and embeds.
- Embed kinds:
  - `card`: link card. YAML fields win; missing title or description come from the link-preview cache.
  - `youtube`: `youtube-nocookie.com` iframe loaded only after the visitor clicks a thumbnail.
  - `iframe`: supported by the code but **disabled**: `embedAllowlist` in `site.yaml` is empty. Add a domain only when the owner approves it, and keep the CSP `frame-src` in sync (the content tests check both `https://<domain>` and `https://*.<domain>`). Iframes use `sandbox`, `loading="lazy"` and `referrerpolicy`.
  - `ratio` is an enum (`video`, `wide`, `square`) mapped to existing tokens. A YouTube URL without a valid video id, or an `iframe` URL outside `embedAllowlist`, renders as a link card. Browsers do not report cross-origin iframe load failures, so there is no runtime fallback.
- `scripts/fetch-og.mjs` runs before `pnpm build` and fetches Open Graph data (title, description, site name) for `card` embeds, project `links`, and standalone URLs in Markdown. Rules:
  - Cache in `src/content/.generated/og.json`, keyed by normalized URL with a fetch time. Reuse entries younger than 30 days.
  - A failed fetch never fails the build: fall back to the cache, then to the domain name.
  - `https` only, 5 second timeout, bounded response size and redirects, reject private and loopback addresses (the script runs in CI), fixed User-Agent.
  - Text only. Do not hotlink or download preview images unless the owner asks.
  - Visitors' browsers never contact third-party sites to build previews.

## Friends

- `friends.yaml` lists friend sites (`name`, `url`, localized `description`, `tags`, optional `avatar`, optional `badge`) and an `exchange` block with this site's own details, application link and rules.
- Avatars and badges are local files in `src/assets/friends/`. Never fetch a friend's favicon or image at runtime. Without an avatar, show the initial letter.
- A `badge` is an 88×31 image rendered at its intrinsic size (`width="88"` and `height="31"`, not scaled by tokens). The exchange card offers one-click copy for each field and an HTML snippet for this site's own badge (with a Base UI `Toast` or `Tooltip` confirmation). Its avatar and badge previews come from `exchange.avatar` / `exchange.badge`: URLs on this site map to the same file in `public/` (`ownPublicFileUrl`), so the previews also work locally; never hardcode a preview image.

## Where components go

- `src/components/ui/`: reusable UI primitives (button, tabs, dialog, tooltip, menu, collapsible, toast, badge, …). One file per primitive, kebab-case.
- `src/components/`: site-level components composed from the primitives: `layout/` (navbar, footer, section shell, not-found page), `sections/` (hero, status, about, skills, experience, projects, blog list, blog post, friends, contact), `markdown.tsx`, `embed.tsx`, `link-card.tsx`, `terminal.tsx`, `type-writer.tsx`, `responsive-image.tsx`.
- `src/routes/`: one file per route, picked up by TanStack Router's Vite plugin (`index.tsx`, `$lang/route.tsx`, `$lang/index.tsx` and the page routes listed in [Pages and routes](#pages-and-routes)). Each exports `Route = createFileRoute('<path>')({ component })`. Use `<Link to="…">` for internal links (type-checked paths). Routes compose components; do not put primitives inline in routes.
- Never write a root-relative `href="/…"` or `src="/…"`. Route through `<Link>` (or a primitive's `render={<Link … />}`) and import assets so the base path is applied.
- Links between pages are `<Link to="/$lang/projects/" params={{ lang }}>`, never a raw `<a href>`. Hash links are only for anchors inside a page (Markdown headings); the router scrolls to them (`defaultHashScrollIntoView`, instant under `prefers-reduced-motion`) and `scroll-pt-header` on `html` keeps the target clear of the header. Do not add `scroll-behavior: smooth` in CSS or a smooth-scroll library.
- `src/routeTree.gen.ts` is generated by the Vite plugin whenever `pnpm dev` or `pnpm build` runs. Never edit it by hand, but do commit it: `tsc` needs it.

## Base UI is a hard requirement

- Any interactive element that affects user experience (buttons, tabs, menus, dialogs, popovers, tooltips, toasts, toggle groups, collapsibles, inputs, …) **must** be built on [Base UI](https://base-ui.com) (`@base-ui/react`).
- Do not hand-roll these behaviors with raw `<div>`/`<button>` plus custom keyboard, focus or ARIA handling. Base UI provides accessibility and interaction logic; we provide the look.
- Check the Base UI docs for the component's anatomy and props before writing it. Version-matched docs ship in the package: `node_modules/@base-ui/react/docs/react/components/<name>.md`. They override anything you remember about Base UI.
- Never render a link (`<a>`) through `Button`'s `render` prop. Style the `<a>` or `<Link>` with `buttonVariants()` from `@/components/ui/button` instead.
- Do not add other headless or pre-styled UI libraries (Radix, shadcn/ui, Headless UI, MUI, …).

| Need                                        | Use                    |
| ------------------------------------------- | ---------------------- |
| Buttons, icon buttons                       | `Button`               |
| Skills categories                           | `Tabs`                 |
| Experience highlights                       | `Collapsible`          |
| Language switcher, mobile navigation        | `Menu`                 |
| Image lightbox, large embeds if ever needed | `Dialog`               |
| Icon-only controls                          | `Tooltip`              |
| "Copied" feedback                           | `Toast` (or `Tooltip`) |

## Styling

- Primitives live in `src/components/ui/` in the shadcn style: a thin wrapper around a Base UI part that owns its own Tailwind classes. The code lives in our repo and is meant to be edited. We do **not** use shadcn/ui or any pre-styled library.
- Style with Tailwind utility classes. Style Base UI states through its data attributes: Tabs `data-active:`, `data-checked:`, popup triggers `data-popup-open:`, everything `data-disabled:`, orientation `data-[orientation=vertical]:`. Check the docs for the exact names.
- Primitives accept a string `className` and merge it with `cn()` from `@/lib/utils`. Wrappers type it as `WithClassName<X.Props>`.
- Focus ring for every interactive element: `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue`.
- Motion (typewriter, marquee, cursor blink) must stop under `prefers-reduced-motion`.

## Design tokens (mandatory)

All tokens live in the `@theme` block of `src/index.css`. Tailwind's default colors, type scale and radii are **reset**, so `bg-white`, `text-sm`, the default `rounded-lg` and friends do not exist.

- **Every size is a token.** Colors, font sizes, line heights, font families, radii, spacing and component dimensions all come from `@theme`. Arbitrary values (`bg-[#…]`, `text-[24px]`, `rounded-[30px]`, `h-[59px]`, `p-[13px]`, `font-['…']`, `leading-[…]`) are **forbidden**, with no exceptions for "one-off" sizes. Selectors such as `data-[orientation=vertical]:` and Base UI runtime variables such as `h-(--popup-height)` are not sizes and are fine.
- **All size tokens are in `rem`** (px ÷ 16; keep the px value in a comment), so the site follows the browser's font-size setting.
- **Spacing** uses a 4px `--spacing` base: `p-5` is 20px. Stay on the 4/8px grid.
- **Reuse before adding.** If a value is already a token, use it, even if its name does not mention your component. Snap values within a few px of an existing token to that token.
- **New tokens only when necessary**, named semantically after their role (`control`, `content`), never after their value. Adding a token requires: (1) an entry in `@theme` (rem, plus a mobile override if it should shrink), (2) registration in the tailwind-merge config in `src/lib/utils.ts` if it is a new `text-*` size or named `--spacing-*` size (otherwise `cn()` drops it next to a text color), (3) a row in the tables below.
- Responsive sizes live in the tokens (overrides below `md`, 48rem). Components do not need `md:text-*` to resize text; use breakpoints only for layout.

### Colors

| Token        | Value     | Use                                             |
| ------------ | --------- | ----------------------------------------------- |
| `background` | `#0A0A0A` | Page background; dark text on inverted surfaces |
| `surface`    | `#141414` | Cards, terminal windows                         |
| `foreground` | `#FAFAFA` | Primary text; inverted (light) surfaces         |
| `gray`       | `#A1A1A1` | Secondary text                                  |
| `rule`       | `#2A2A2A` | Dividers and borders                            |
| `green`      | `#8DF280` | Main accent, success, cursor                    |
| `blue`       | `#6A74E3` | Links and the focus ring                        |
| `red`        | `#FF625B` | Errors, archived status                         |
| `yellow`     | `#FCBF30` | Warnings, optional marquee band                 |
| `black`      | `#000000` | Overlays only (navbar glass `bg-black/35`)      |

On inverted (`foreground`) surfaces the text color is `text-background`. That is intended. Use the accent colors sparingly.

### Typography

Sizes in px (tokens are rem). Line heights are the same at every size unless noted.

| Token            | Desktop                          | Mobile | Use                                         |
| ---------------- | -------------------------------- | ------ | ------------------------------------------- |
| `font-sans`      | Noto Sans TC → Inter → system-ui |        | Body copy and all Chinese text              |
| `font-mono`      | JetBrains Mono → ui-monospace    |        | Navigation, labels, eyebrows, numbers, code |
| `text-mega`      | 96 / 1.05                        | 44     | Unused; kept for very large display text    |
| `text-stat`      | 64 / 1                           | 40     | Stat numbers                                |
| `text-display`   | 48 / 1.15                        | 32     | Page titles, the hero name                  |
| `text-h1`        | 32 / 1.25                        | 26     | Sub-headings                                |
| `text-h2`        | 24 / 1.3                         | 20     | Card titles                                 |
| `text-lead`      | 18 / 1.6                         | 16     | Large buttons, lead text                    |
| `text-paragraph` | 16 / 1.75                        | 15     | Body copy                                   |
| `text-body`      | 14 / 1.5                         | 14     | Navigation, footer links                    |
| `text-caption`   | 12 / 1.5                         | 12     | Fine print, badges                          |

Weights: `font-normal` (400) and `font-bold` (700) only.

Fonts are self-hosted (OFL). Never load fonts from a CDN. Noto Sans TC is large, so it is subsetted at build time to the characters used in `src/` and `src/content/` (including blog posts), split into unicode-range chunks, and only weights 400 and 700 ship. New copy is picked up on the next build; characters missing from the subset fall back to Inter or the system font. Use `font-mono` for Latin UI chrome and `font-sans` for body text, since Chinese has no good monospace.

### Radii and layout

| Token           | Desktop | Mobile | Use                                      |
| --------------- | ------- | ------ | ---------------------------------------- |
| `rounded-*-xs`  | 2       | 2      | Badges, sharp button corners             |
| `rounded-*-sm`  | 4       | 4      | Inner corners of adjacent tiles          |
| `rounded-*-md`  | 8       | 6      | Buttons, inputs                          |
| `rounded-*-lg`  | 12      | 10     | Terminal windows                         |
| `rounded-*-xl`  | 20      | 16     | Outer corners of adjacent tiles          |
| `rounded-full`  |         |        | Navbar, icon buttons                     |
| `max-w-content` | 960     | 960    | Content column (`mx-auto max-w-content`) |

### Sizes

| Token               | Desktop | Mobile | Use                                                        |
| ------------------- | ------- | ------ | ---------------------------------------------------------- |
| `--spacing`         | 4       | 4      | Base of the spacing scale                                  |
| `h-control`         | 40      | 36     | Default control height                                     |
| `h-control-lg`      | 56      | 48     | Large controls, navbar                                     |
| `size-control-icon` | 36      | 36     | Icon-only buttons                                          |
| `pt-header`         | 88      | 76     | Height of the overlaid header; pages pad their top with it |

**Corner rule.** Tiles that sit next to each other (side by side or stacked) read as one shape: their **outer** corners are `xl` and their **inner** corners are `sm`. Examples: the status and clock cards, the project list and its detail panel. Set these per tile at the call site, for example `<Card className="rounded-l-xl">`.

**Section layout.** Sections line up down the page and spacing reads as one rhythm. Copy the shell from an existing section instead of picking new numbers.

- One gutter, one column: every section has the same screen-edge gutter and the same centered `max-w-content` column with the same inner padding. Never pad one column differently to nudge its content.
- Each kind of spacing has one owner: the section owns its background, full-bleed width and the space above and below it; the column owns the rhythm between its children (one `gap`). A child that needs a larger break adds padding on itself. Do not mix in margins or change the gap per child.
- Sections that play the same role share the same vertical padding.
- Full-bleed pieces (the marquee band) put any text or controls back inside the shared column.

### Visual language

- Terminal vocabulary: `$ whoami`, `~/about`, `> ls`, a blinking cursor. Eyebrow labels above titles are plain words (no `//` prefix); an eyebrow that only repeats the title is not shown.
- 1px `rule` borders, small radii, no shadows. The terminal window component (title bar with three dots) frames About and the project panel.
- The typewriter effect is used only for the hero tagline.

## Icons and images

- Icons: use `lucide-react` whenever an equivalent exists.
- Brand logos (GitHub, Discord, …) that Lucide does not provide live in `src/assets/brands/` as SVG (preferred) or PNG/WebP. Every file there is picked up automatically (`import.meta.glob` in `src/lib/icons.tsx`) and referenced from YAML by file name, extension optional. Never hand-draw or paste approximate paths. Icons are small, so they skip the `?responsive` pipeline.
- Photos and covers are optimized at build time by `vite-imagetools`. Commit them as JPG, PNG or WebP, at least as wide as they render on a 2× screen (up to 1600px). Import with `?responsive` (also as `query: '?responsive'` in `import.meta.glob`) and render with `ResponsiveImage` (`@/components/responsive-image`), passing `sizes`. The first image on a page takes `loading="eager"` and `fetchPriority="high"`. SVGs are imported plainly and rendered with `<img>`.

## Accessibility

- All interactive elements work with the keyboard and show the focus ring. Keep contrast at WCAG AA.
- Use semantic landmarks and a continuous heading hierarchy. Blog posts use `<article>`.
- Keep `<html lang>` in sync with the current language.

## Security and privacy

- Markdown never renders raw HTML. Iframes are sandboxed and limited to `embedAllowlist`.
- No runtime requests to third-party origins except an iframe the visitor chose to load (YouTube after a click). Fonts, avatars, badges and link previews are all local or fetched at build time.
- Do not add analytics, trackers or third-party scripts without the owner's approval.
- Do not commit secrets. The site needs none.

## Production deployment

The site is built and published by GitHub Actions to GitHub Pages. In the repository settings, Pages uses **GitHub Actions** as its source (no `gh-pages` branch).

1. A push to `main` (or a manual run) of the deploy workflow runs `pnpm install --frozen-lockfile`, `pnpm check`, `pnpm test`, and `pnpm build` with the right `BASE_PATH`, uploads `dist/` with `actions/upload-pages-artifact`, and deploys it with `actions/deploy-pages`.
2. `BASE_PATH` sets Vite's `base` and the router's `basepath`: `/` for a user site (`<user>.github.io`) or a custom domain, `/<repo>/` for a project site. Canonical URLs always use the production origin from `site.yaml`.

GitHub Pages has no single-page-app fallback and no custom response headers or redirects, so:

- `scripts/prerender.mjs` renders `/`, `/en/` and `/zh-TW/` from the real React routes into static HTML. Pages must contain their headings, copy and links before JavaScript runs. Blog posts are part of the home page and are rendered with it. Keep rendering code free of browser-only calls outside effects, and use a fixed timezone (`Asia/Taipei`) for any time-dependent output so the HTML matches the client.
- The `/` language redirect happens in the browser. The prerendered `/` shell carries the fallback links described under [Internationalization](#internationalization).
- Set the router's trailing-slash behavior to match the Pages output (`/en/`) so canonical URLs match real URLs; check the TanStack Router docs for the option.
- The build writes `404.html`, a bilingual not-found page; GitHub Pages serves it from the site root for any unknown path. Its root carries `data-hydrate="false"`, so `main.tsx` renders it fresh for the requested URL instead of hydrating HTML rendered for another path.
- The Content Security Policy is a `<meta http-equiv="Content-Security-Policy">` tag. `frame-src` allows only `https://www.youtube-nocookie.com`. Meta CSP does not support every directive (for example `frame-ancestors`).
- `scripts/build-sitemap.mjs` generates `sitemap.xml` from the public page list and production canonicals; do not maintain a separate XML file in `public/`.

To check a production build locally, build with the production `BASE_PATH` and serve `dist/` from a folder that mirrors that path (for example `python3 -m http.server`).

## Continuous integration

`ci.yml` runs on every pull request and every push to a non-deploy branch. Its jobs mirror `pnpm check` plus the build:

- **Lint** runs `pnpm lint`.
- **Format** runs `pnpm format:check`.
- **Build** runs `pnpm build` (which typechecks first) and fails if the build regenerated `src/routeTree.gen.ts`, meaning a route change was committed without the regenerated route tree.
- **Test** runs `pnpm test` (Vitest).

## Definition of done

- `pnpm check` passes; `pnpm test` passes when content, i18n, Markdown or link previews changed; `pnpm build` succeeds when routes, prerendering or the build scripts changed.
- Both languages are filled in for every new user-facing string.
- No arbitrary Tailwind values, no hardcoded copy, no root-relative URLs, no hand-rolled interactive controls.
- `src/routeTree.gen.ts` is regenerated and committed if routes changed.
- This guide is updated when conventions or structure change.
