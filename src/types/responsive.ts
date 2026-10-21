export interface ResponsiveSource {
  srcset: string;
  type?: string;
}

export interface ResponsiveImageOutput {
  sources: Record<string, string> | ResponsiveSource[];
  img: {
    src: string;
    w: number;
    h: number;
  };
}
