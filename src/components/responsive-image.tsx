import type { ImgHTMLAttributes } from "react";
import { cn, type WithClassName } from "@/lib/utils";
import type { ResponsiveImageOutput } from "@/types/responsive";

export type ResponsiveImageProps = WithClassName<
  Omit<ImgHTMLAttributes<HTMLImageElement>, "src">
> & {
  image: ResponsiveImageOutput | string;
  alt: string;
  sizes?: string;
};

export function ResponsiveImage({
  image,
  alt,
  sizes = "100vw",
  loading = "lazy",
  fetchPriority,
  className,
  ...props
}: ResponsiveImageProps) {
  if (typeof image === "string") {
    return (
      <img
        src={image}
        alt={alt}
        loading={loading}
        fetchPriority={fetchPriority}
        className={cn("block max-w-full object-cover", className)}
        {...props}
      />
    );
  }

  const sourceEntries = Array.isArray(image.sources)
    ? image.sources.map((s) => ({
        type: s.type,
        srcSet: s.srcset,
      }))
    : Object.entries(image.sources).map(([format, srcSet]) => ({
        type: `image/${format}`,
        srcSet,
      }));

  return (
    <picture className="block">
      {sourceEntries.map((source) => (
        <source
          key={source.type ?? source.srcSet}
          type={source.type}
          srcSet={source.srcSet}
          sizes={sizes}
        />
      ))}
      <img
        src={image.img.src}
        width={image.img.w}
        height={image.img.h}
        alt={alt}
        loading={loading}
        fetchPriority={fetchPriority}
        className={cn("block max-w-full object-cover", className)}
        {...props}
      />
    </picture>
  );
}
