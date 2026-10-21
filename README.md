# Personal Portfolio

Bilingual (`en` / `zh-TW`) personal portfolio and blog built with React 19, Vite, Tailwind CSS v4, TypeScript, Base UI, and TanStack Router.

## Quick Start

Use Node.js 22 (`.nvmrc`) and `pnpm` (other package managers are blocked).

```bash
pnpm install
pnpm dev
```

## Editing Content

All user-facing content lives in [`src/content/`](./src/content/README.md). You can update profile details, skills, experience, projects, blog posts, and friend links by editing the YAML and Markdown files there without touching React code.

## Commands

- `pnpm dev` — Start the development server
- `pnpm check` — Run typecheck, ESLint, and Prettier formatting check
- `pnpm test` — Run Vitest (including content validation checks)
- `pnpm build` — Fetch Open Graph link previews, typecheck, bundle, prerender every page in both languages (home, About, Skills, Experience, Projects, Blog and each post, Friends, Contact) plus `404.html`, and generate `sitemap.xml`
- `pnpm og:refresh` — Re-fetch all link previews ignoring the 30-day cache
- `pnpm preview` — Locally preview the production build

For architecture, design tokens, and engineering conventions, see [`AGENTS.md`](./AGENTS.md).
