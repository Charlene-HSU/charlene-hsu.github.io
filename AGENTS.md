# AGENTS.md

Guidance for AI coding agents working in this repository. This is a bilingual (English / Traditional Chinese) personal portfolio site with a black-and-white, terminal-inspired look. It introduces the owner, lists skills, experience and projects, shows a blog section and a friends section, and is published as a static site on GitHub Pages. README.md is the public introduction and quick start; keep implementation and operational details here. `CLAUDE.md` is a symlink to this file, so maintain one shared agent guide.

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

| File                 | Purpose                                                                                        |
| -------------------- | ---------------------------------------------------------------------------------------------- |
| `site.yaml`          | Metadata, `nav` (single source for navbar, hero CTAs and footer), UI strings, `embedAllowlist` |
| `profile.yaml`       | Name, title, location, timezone, tagline, status, stats, `primaryCta`, `about`                 |
| `skills.yaml`        | Skill groups and the marquee list                                                              |
| `experience.yaml`    | Work and study history                                                                         |
| `projects.yaml`      | Projects, links and embeds                                                                     |
| `friends.yaml`       | Friend sites and the link-exchange card                                                        |
| `contact.yaml`       | Email and social links                                                                         |
| `md/`                | Markdown for About (`about.<lang>.md`) and projects (`projects/<id>.<lang>.md`)                |
| `blog/`              | Blog posts (`<slug>.<lang>.md`)                                                                |
| `.generated/og.json` | Cache written by `fetch-og`. Commit it. Never edit it by hand                                  |

Conventions:

- A translatable value is `string | { en: string; "zh-TW": string }`. Values that do not need translation (URLs, dates, tags, ids) are plain values. Resolve values with `t(value, lang)` from `@/lib/i18n`.
- Dates are `YYYY-MM` or `YYYY-MM-DD`. `end: null` means "present". Status badges (Present, Ended, Archived) are computed from dates and status fields, not typed by hand.
- Types for every content file live in `src/types/content.ts`; typed exports live in `src/lib/content.ts`. Never import YAML directly from components.
- Content checks (Vitest) must keep passing: required fields exist in both languages, ids are unique, URLs are valid `https` (or `mailto:`), referenced Markdown, covers, avatars and badges exist, blog `title` and `date` are present.

For a content update: edit the relevant file under `src/content/`, keep its structure, run `pnpm check` and `pnpm test`, then review with `pnpm dev`.

## Internationalization

- Supported languages: `en` and `zh-TW`. Every `zh*` locale maps to `zh-TW`; everything else maps to `en`. There is no Simplified Chinese version.
- Routes are path-based: `/` (language detection and redirect), `/en/`, `/zh-TW/`. `src/routes/index.tsx` redirects in `beforeLoad`; `src/routes/$lang/route.tsx` validates the param (invalid → not found), provides the i18n context, and sets `<html lang>`.
- Detection order: URL prefix → language stored in `localStorage` → `navigator.languages` (first supported match wins) → `en`. Wrap every `localStorage` access in `try/catch` and only run it in the browser, so prerendering stays safe.
- The language switcher (Base UI `Menu`) keeps the current hash and stores the choice.
- The prerendered `/` shell contains a tiny inline detection script, a `<noscript>` link to each language, and `hreflang` plus `x-default` alternates. Each language page has its own title, description, Open Graph metadata and `hreflang` links.
- If a translation is missing, fall back to the other language and warn in development. Do not hide the content.
- Format dates and numbers with `Intl` using the current language.

## Navigation and icons

- `site.yaml` `nav` is the single source for the navbar, the hero CTAs and the footer links. Every page has one entry: `id`, `type` (`hash`), `icon`, localized `label`. Add a page by adding one entry and implementing its section.
- The hero shows one CTA per entry (icon + label). `profile.yaml` `primaryCta` names the entry shown in green; the others are outline buttons.
- Icons are `lucide-react` names written in YAML and resolved through an allowlist mapping in code, so only used icons are bundled. Never import the whole icon set. Icons are decorative (`aria-hidden`); the label provides the text.

## Markdown

- Render all Markdown through the shared `<Markdown>` component (`react-markdown` + `remark-gfm`). Front matter is parsed with `front-matter`.
- Supported: GFM (tables, task lists, strikethrough), links, images, headings with anchors, code blocks, and a standalone URL on its own line, which becomes a link card (implemented by overriding the `p` component).
- **Raw HTML is not supported.** Never enable `rehype-raw` or `dangerouslySetInnerHTML` for content.
- External links get `target="_blank"` and `rel="noopener noreferrer"` plus an external-link icon. Internal links use `<Link>`.
- Relative images resolve against `src/assets/` (project covers, `blog/<slug>/`) and use the `?responsive` pipeline.
- Phase 2 (add only when the owner asks): `remark-directive` for `::embed{kind="…" url="…"}` and `rehype-highlight` for code highlighting. Do not add other Markdown plugins without approval.
- Inline Markdown fields in YAML (for example experience `highlights`, friend `rules`) render through `<Markdown inline>`, which only supports bold, links and inline code.

### Blog

- The blog is a **section on the home page** (`#blog`), not a set of routes. Do not add blog list or article routes, tables of contents, tag filters, reading time, covers, pagination, RSS, comments or search unless the owner asks.
- Posts are `src/content/blog/<slug>.<lang>.md` with YAML front matter containing only `title` and `date` (optional `draft: true`, shown in development only).
- Posts are listed newest first and rendered as written: the front matter title and date, then the Markdown body through `<Markdown>`. Load them with `import.meta.glob("/src/content/blog/*.md", { query: "?raw", import: "default", eager: true })`.
- If a post has no file for the current language, show the available one without a badge or notice.

## Projects, embeds and link previews

- Projects have **no detail pages**. The Projects section shows a list of tiles on one side and a detail panel on the other (an accordion on mobile). The selected project is kept in a validated search param (`?p=<id>`, `validateSearch`) so it can be shared without adding a route.
- Panel content: cover, summary, link buttons, optional Markdown body (`body: projects/<id>` → `md/projects/<id>.<lang>.md`), and embeds.
- Embed kinds:
  - `card`: link card. YAML fields win; missing title or description come from the link-preview cache.
  - `youtube`: `youtube-nocookie.com` iframe loaded only after the visitor clicks a thumbnail.
  - `iframe`: supported by the code but **disabled**: `embedAllowlist` in `site.yaml` is empty. Add a domain only when the owner approves it, and keep the CSP `frame-src` in sync. Iframes use `sandbox`, `loading="lazy"` and `referrerpolicy`.
  - `ratio` is an enum (`video`, `wide`, `square`) mapped to existing tokens. If an embed cannot load, fall back to a link card.
- `scripts/fetch-og.mjs` runs before `pnpm build` and fetches Open Graph data (title, description, site name) for `card` embeds, project `links`, and standalone URLs in Markdown. Rules:
  - Cache in `src/content/.generated/og.json`, keyed by normalized URL with a fetch time. Reuse entries younger than 30 days.
  - A failed fetch never fails the build: fall back to the cache, then to the domain name.
  - `https` only, 5 second timeout, bounded response size and redirects, reject private and loopback addresses (the script runs in CI), fixed User-Agent.
  - Text only. Do not hotlink or download preview images unless the owner asks.
  - Visitors' browsers never contact third-party sites to build previews.

## Friends

- `friends.yaml` lists friend sites (`name`, `url`, localized `description`, `tags`, optional `avatar`, optional `badge`) and an `exchange` block with this site's own details, application link and rules.
- Avatars and badges are local files in `src/assets/friends/`. Never fetch a friend's favicon or image at runtime. Without an avatar, show the initial letter.
- A `badge` is an 88×31 image rendered at its intrinsic size (`width="88"` and `height="31"`, not scaled by tokens). The exchange card offers one-click copy for each field and an HTML snippet for this site's own badge (with a Base UI `Toast` or `Tooltip` confirmation).

## Where components go

- `src/components/ui/`: reusable UI primitives (button, tabs, dialog, tooltip, menu, collapsible, toast, badge, …). One file per primitive, kebab-case.
- `src/components/`: site-level components composed from the primitives: `layout/` (navbar, footer, section shell), `sections/` (hero, status, about, skills, experience, projects, blog, friends, contact), `markdown.tsx`, `embed.tsx`, `link-card.tsx`, `terminal.tsx`, `type-writer.tsx`, `responsive-image.tsx`.
- `src/routes/`: one file per route, picked up by TanStack Router's Vite plugin (`index.tsx`, `$lang/route.tsx`, `$lang/index.tsx`). Each exports `Route = createFileRoute('<path>')({ component })`. Use `<Link to="…">` for internal links (type-checked paths). Routes compose components; do not put primitives inline in routes.
- Never write a root-relative `href="/…"` or `src="/…"`. Route through `<Link>` (or a primitive's `render={<Link … />}`) and import assets so the base path is applied.
- In-page jumps use `<Link to="/$lang" params={{ lang }} hash="projects">`, never a raw `<a href="#projects">`. The router smooth-scrolls hash links (`defaultHashScrollIntoView`, instant under `prefers-reduced-motion`) and `scroll-pt-header` on `html` keeps the target clear of the header. Do not add `scroll-behavior: smooth` in CSS or a smooth-scroll library.
- `src/routeTree.gen.ts` is generated by the Vite plugin whenever `pnpm dev` or `pnpm build` runs. Never edit it by hand, but do commit it: `tsc` needs it.

## Base UI is a hard requirement

- Any interactive element that affects user experience (buttons, tabs, menus, dialogs, popovers, tooltips, toasts, toggle groups, collapsibles, inputs, …) **must** be built on [Base UI](https://base-ui.com) (`@base-ui/react`).
- Do not hand-roll these behaviors with raw `<div>`/`<button>` plus custom keyboard, focus or ARIA handling. Base UI provides accessibility and interaction logic; we provide the look.
- Check the Base UI docs for the component's anatomy and props before writing it. Version-matched docs ship in the package: `node_modules/@base-ui/react/docs/react/components/<name>.md`. They override anything you remember about Base UI.
- Never render a link (`<a>`) through `Button`'s `render` prop. Style the `<a>` or `<Link>` with `buttonVariants()` from `@/components/ui/button` instead.
- Do not add other headless or pre-styled UI libraries (Radix, shadcn/ui, Headless UI, MUI, …).

| Need                                        | Use                         |
| ------------------------------------------- | --------------------------- |
| Buttons, icon buttons                       | `Button`                    |
| Skills categories                           | `Tabs`                      |
| Experience highlights, mobile project list  | `Collapsible` / `Accordion` |
| Language switcher, mobile navigation        | `Menu`                      |
| Image lightbox, large embeds if ever needed | `Dialog`                    |
| Icon-only controls                          | `Tooltip`                   |
| "Copied" feedback                           | `Toast` (or `Tooltip`)      |

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
| `text-mega`      | 96 / 1.05                        | 44     | Hero name                                   |
| `text-stat`      | 64 / 1                           | 40     | Stat numbers                                |
| `text-display`   | 48 / 1.15                        | 32     | Section titles (`// projects`)              |
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

- Terminal vocabulary: `$ whoami`, `~/about`, `> ls`, a blinking cursor. Section titles are comments: `// about`, `// projects`.
- 1px `rule` borders, small radii, no shadows. The terminal window component (title bar with three dots) frames About and the project panel.
- The typewriter effect is used only for the hero tagline.

## Icons and images

- Icons: use `lucide-react` whenever an equivalent exists.
- Brand logos (GitHub, LinkedIn, …) that Lucide does not provide are exported as SVG into `src/assets/brands/` and imported. Never hand-draw or paste approximate paths.
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
- The build writes `404.html` (a copy of `index.html`); GitHub Pages serves it from the site root.
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
