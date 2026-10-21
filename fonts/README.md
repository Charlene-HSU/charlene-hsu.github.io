# Self-Hosted Fonts

Place self-hosted OFL font files in this directory:

- `NotoSansTC-Regular.ttf` (or `.woff2`, weight 400)
- `NotoSansTC-Bold.ttf` (or `.woff2`, weight 700)
- `JetBrainsMono-Regular.woff2` (weight 400)
- `JetBrainsMono-Bold.woff2` (weight 700)

At build time, `vite-plugin-font` scans `src/` and `src/content/` (including YAML and Markdown blog posts) to subset `Noto Sans TC` to only the characters used on the site. Missing characters gracefully fall back to `Inter`, `system-ui`, or `ui-monospace`.
