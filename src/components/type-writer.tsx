import { useLayoutEffect, useState } from "react";
import { useHydrated } from "@/lib/use-hydrated";
import { cn, type WithClassName } from "@/lib/utils";

export type TypeWriterProps = WithClassName<{
  text: string;
  speedMs?: number;
}>;

export function TypeWriter({ text, speedMs = 32, className }: TypeWriterProps) {
  const [displayed, setDisplayed] = useState(text);
  const hydrated = useHydrated();

  // A layout effect clears the text before the browser paints, so a client-side visit
  // or a language switch never shows the full new text for a frame first.
  useLayoutEffect(() => {
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
      {/* Screen readers get the whole text once instead of every typed letter. */}
      <span className="sr-only">{text}</span>
      {/* The prerendered full text stays hidden (but keeps its space) until the typing
          starts, so it does not flash; see `data-typewriter-pending` in index.css. */}
      <span aria-hidden="true" data-typewriter-pending={hydrated ? undefined : ""}>
        {displayed}
      </span>
      <span className="ml-1 inline-block text-green animate-cursor-blink" aria-hidden="true">
        ▍
      </span>
    </p>
  );
}
