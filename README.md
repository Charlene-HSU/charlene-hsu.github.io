# charlene-hsu.github.io

My bilingual (English / 繁體中文) personal site and blog, with a black-and-white terminal look. Live at **<https://charlene-hsu.github.io>**.

Built with React 19, Vite, Tailwind CSS v4, TypeScript, Base UI and TanStack Router, prerendered to static HTML and published on GitHub Pages.

- **Pages:** Home, About, Skills, Experience, Projects, Blog (list with tag filters, one page per post), Friends and Contact, each in `/en/…` and `/zh-TW/…`.
- **Home:** name and tagline, the self-introduction, status and local clock, shortcuts to recently updated or pinned projects and posts, and a tech marquee.
- **Content in plain files:** every word, link and image is set in YAML and Markdown under `src/content/`. You never need to touch React code to update the site.

## Quick start

### 1. Install the tools (once)

You need **Node.js 22** and **pnpm**. npm, yarn and bun are blocked on purpose.

```bash
# Node 22 (with nvm: https://github.com/nvm-sh/nvm)
nvm install        # reads .nvmrc → 22
nvm use

# pnpm, at the version pinned in package.json
corepack enable
```

### 2. Get the code and install dependencies

```bash
git clone https://github.com/Charlene-HSU/charlene-hsu.github.io.git
cd charlene-hsu.github.io
pnpm install
```

### 3. Run it locally

```bash
pnpm dev
```

Open the URL it prints (usually <http://localhost:5173>). `/` sends you to `/en/` or `/zh-TW/` based on your browser language. Saving any file under `src/content/` updates the page right away. Stop the server with `Ctrl + C`.

### 4. Make it yours

Edit these files first. Each one is plain YAML or Markdown.

| What                                                      | File                                                         |
| --------------------------------------------------------- | ------------------------------------------------------------ |
| Site name, title, description, URL                        | `src/content/site.yaml` → `meta`                             |
| Your name, title, location, tagline, status, stats        | `src/content/profile.yaml`                                   |
| Self-introduction (Home and About)                        | `src/content/md/about.en.md`, `about.zh-TW.md`               |
| Email and contact links                                   | `src/content/contact.yaml`                                   |
| Skills and the marquee                                    | `src/content/skills.yaml`                                    |
| Work and study history                                    | `src/content/experience.yaml`                                |
| Projects                                                  | `src/content/projects.yaml` (+ `md/projects/<id>.<lang>.md`) |
| Blog posts                                                | `src/content/blog/<slug>.<lang>.md`                          |
| Friend sites and link exchange                            | `src/content/friends.yaml`                                   |
| Footer links and columns, page labels, tag names, UI text | `src/content/site.yaml`                                      |

### 5. Check before you push

```bash
pnpm format   # fix formatting
pnpm check    # typecheck, lint, format check
pnpm test     # content checks: missing translations, bad URLs, missing images, …
pnpm build && pnpm preview   # the real production site at http://localhost:4173
```

If `pnpm test` fails, its message names the file and the field to fix.

## Editing content

[`src/content/README.md`](./src/content/README.md) lists every file. The most common tasks:

### Write a blog post

Create `src/content/blog/<slug>.en.md` and/or `<slug>.zh-TW.md`. The slug is lowercase words joined by hyphens and becomes the URL: `/en/blog/<slug>/`.

To group a series, put its posts in a folder: `src/content/blog/<folder>/<slug>.<lang>.md`, and give the folder a name in `site.yaml` `blogFolders`. The blog list shows the folder as one item that opens to list its posts; the post URLs stay `/en/blog/<slug>/`.

```markdown
---
title: My first post
date: "2026-10-21"
description: One or two sentences for the list and for link previews. # optional
tags: # optional; labels live in site.yaml → blogTags
  - frontend
updated: "2026-11-02" # optional; counts as "recently updated" on Home
pinned: true # optional; always shown in the Home shortcuts
draft: true # optional; only visible in `pnpm dev`
---

Markdown body. Images go in `src/assets/blog/<slug>/` and are linked as `![alt](./image.png)`.
A link alone on its own line becomes a preview card.
```

If a post exists in only one language, both language versions of the site show it.

### Add a project

Add an item to `src/content/projects.yaml`:

```yaml
items:
  - id: my-project # used in the URL: /en/projects/?p=my-project
    name: My Project
    status: active # active | wip | archived
    period:
      start: "2026-09"
      end: null # null = still going
    tags: [TypeScript, React]
    cover: my-project.png # optional, file in src/assets/projects/
    summary:
      en: One-line summary.
      zh-TW: 一句話介紹。
    links: # optional
      - type: github # github | demo | docs
        url: https://github.com/Charlene-HSU/my-project
    body: projects/my-project # optional, md/projects/my-project.<lang>.md
    updated: "2026-10" # optional, for the Home shortcuts
    pinned: true # optional
```

### Home shortcuts

Home links to projects and posts updated in the last **30 days**, plus anything with `pinned: true`. Set the number of days and the maximum number of cards in `site.yaml` → `shortcuts`. If nothing qualifies, the block is hidden. Shortcuts expire on their own; you don't need to rebuild.

### Contact links and icons

Put logo files (`.svg` or `.png`) in `src/assets/brands/` and refer to them by file name. Each link has either a `url` (opens a page) or a `text` (shown and copied on click, e.g. a Discord username):

```yaml
links:
  - label: GitHub
    icon: github
    url: https://github.com/Charlene-HSU
  - label: Discord
    icon: discord # src/assets/brands/discord.png
    iconStyle: color # keep the logo's colors on the light card
    text: my-discord-name
```

### Images

| Image                                                                   | Folder                                              |
| ----------------------------------------------------------------------- | --------------------------------------------------- |
| Project cover                                                           | `src/assets/projects/`                              |
| Blog image                                                              | `src/assets/blog/<slug>/`                           |
| Friend avatar / 88×31 badge                                             | `src/assets/friends/`, `src/assets/friends/badges/` |
| Contact and brand logos                                                 | `src/assets/brands/`                                |
| Files others link to directly (your avatar and badge for link exchange) | `public/`                                           |

Photos should be at least twice as wide as they appear (up to 1600px); the build makes AVIF and WebP versions automatically.

### Empty lists are fine

Any list (projects, friends, skills, highlights, tags, …) can be left empty, set to `null` or removed. The page then shows a short "nothing here yet" message or hides that block instead of breaking.

## Commands

| Command           | What it does                                                                                                            |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `pnpm dev`        | Development server with live reload                                                                                     |
| `pnpm check`      | Typecheck, ESLint and Prettier check (run before every commit)                                                          |
| `pnpm format`     | Fix formatting with Prettier                                                                                            |
| `pnpm test`       | Vitest, including the content checks                                                                                    |
| `pnpm build`      | Fetch link previews, typecheck, bundle, prerender every page in both languages plus `404.html`, and write `sitemap.xml` |
| `pnpm preview`    | Serve the production build locally                                                                                      |
| `pnpm og:refresh` | Re-fetch all link previews, ignoring the 30-day cache                                                                   |

## Deploying

The site deploys itself to GitHub Pages from GitHub Actions.

1. The repository is named **`charlene-hsu.github.io`**, so the site lives at the root: <https://charlene-hsu.github.io>. No DNS or `CNAME` file is needed.
2. In the repository, go to **Settings → Pages** and set **Source** to **GitHub Actions** (once).
3. Push to `main`. The **Deploy** workflow runs `pnpm check`, `pnpm test` and `pnpm build`, then publishes `dist/`.

Pull requests and other branches run the **CI** workflow (lint, format, test, build) without deploying. If you ever move the site to a repository with another name, set the repository variable `BASE_PATH` to `/<repo-name>/`.

## Troubleshooting

- **`pnpm install` says to use pnpm:** run `corepack enable` and try again.
- **`format:check` fails:** run `pnpm format`, then commit the changes.
- **CI fails on "routeTree.gen.ts is up to date":** run `pnpm build` (or `pnpm dev`) locally and commit `src/routeTree.gen.ts`.
- **A test fails with a ZodError:** the message points at the YAML file and field, e.g. `items → 0 → highlights`.
- **Fonts look like the system font:** add the font files described in [`fonts/README.md`](./fonts/README.md).

## For contributors and AI agents

Architecture, design tokens and coding rules are in [`AGENTS.md`](./AGENTS.md). (`CLAUDE.md` is a link to the same file.)

## License

The code is under the [MIT License](./LICENSE). Written content and images are © Charlene Hsu, all rights reserved.
