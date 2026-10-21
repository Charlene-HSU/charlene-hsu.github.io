import { useEffect, useState } from "react";
import { cn, type WithClassName } from "@/lib/utils";

export type TypeWriterProps = WithClassName<{
  text: string;
  speedMs?: number;
}>;

export function TypeWriter({ text, speedMs = 32, className }: TypeWriterProps) {
  const [displayed, setDisplayed] = useState(text);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setDisplayed(text);
      return;
    }

    let index = 0;
    setDisplayed("");
    const timer = window.setInterval(() => {
      index += 1;
      setDisplayed(text.slice(0, index));
      if (index >= text.length) {
        window.clearInterval(timer);
      }
    }, speedMs);

    return () => {
      window.clearInterval(timer);
    };
  }, [text, speedMs]);

  return (
    <p className={cn("font-mono text-lead text-gray", className)}>
      <span>{displayed}</span>
      <span className="ml-1 inline-block text-green animate-cursor-blink" aria-hidden="true">
        ▍
      </span>
    </p>
  );
}
