// Every file in src/assets/brands/ (svg, png, webp, jpg) is available by file
// name, with or without its extension: `discord`, `discord.png`.
const brandIconModules = import.meta.glob<string>("/src/assets/brands/*.{svg,png,webp,jpg,jpeg}", {
  import: "default",
  eager: true,
});

const brandIcons = new Map<string, string>();
for (const [filePath, url] of Object.entries(brandIconModules)) {
  const fileName = (filePath.split("/").pop() ?? "").toLowerCase();
  brandIcons.set(fileName, url);
  const baseName = fileName.replace(/\.[^.]+$/, "");
  if (!brandIcons.has(baseName)) {
    brandIcons.set(baseName, url);
  }
}

/** URL of a brand icon by file name (extension optional), or undefined if there is no such file. */
export function resolveBrandIcon(name: string): string | undefined {
  return brandIcons.get(name.trim().toLowerCase());
}
