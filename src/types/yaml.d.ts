/// <reference types="vite/client" />

/** ISO timestamp of the build, injected by `define` in vite.config.ts. */
declare const __BUILD_TIME__: string;

declare module "*.yaml" {
  const content: unknown;
  export default content;
}

declare module "*?responsive" {
  const output: import("./responsive").ResponsiveImageOutput | string;
  export default output;
}
