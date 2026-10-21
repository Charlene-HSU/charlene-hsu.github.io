/// <reference types="vite/client" />

declare module "*.yaml" {
  const content: unknown;
  export default content;
}

declare module "*?responsive" {
  const output: import("./responsive").ResponsiveImageOutput | string;
  export default output;
}
