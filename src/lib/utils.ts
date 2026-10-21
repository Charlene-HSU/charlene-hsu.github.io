import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const customTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: ["mega", "stat", "display", "h1", "h2", "lead", "paragraph", "body", "caption"],
        },
      ],
      "text-color": [
        {
          text: [
            "background",
            "surface",
            "foreground",
            "gray",
            "rule",
            "green",
            "blue",
            "red",
            "yellow",
            "black",
          ],
        },
      ],
      "bg-color": [
        {
          bg: [
            "background",
            "surface",
            "foreground",
            "gray",
            "rule",
            "green",
            "blue",
            "red",
            "yellow",
            "black",
          ],
        },
      ],
      "border-color": [
        {
          border: [
            "background",
            "surface",
            "foreground",
            "gray",
            "rule",
            "green",
            "blue",
            "red",
            "yellow",
            "black",
          ],
        },
      ],
      rounded: [
        {
          rounded: ["xs", "sm", "md", "lg", "xl", "full"],
          "rounded-t": ["xs", "sm", "md", "lg", "xl", "full"],
          "rounded-r": ["xs", "sm", "md", "lg", "xl", "full"],
          "rounded-b": ["xs", "sm", "md", "lg", "xl", "full"],
          "rounded-l": ["xs", "sm", "md", "lg", "xl", "full"],
          "rounded-tl": ["xs", "sm", "md", "lg", "xl", "full"],
          "rounded-tr": ["xs", "sm", "md", "lg", "xl", "full"],
          "rounded-br": ["xs", "sm", "md", "lg", "xl", "full"],
          "rounded-bl": ["xs", "sm", "md", "lg", "xl", "full"],
        },
      ],
      h: [{ h: ["control", "control-lg", "control-icon", "header"] }],
      w: [{ w: ["control", "control-lg", "control-icon", "content"] }],
      size: [{ size: ["control", "control-lg", "control-icon"] }],
      "max-w": [{ "max-w": ["content"] }],
      pt: [{ pt: ["header"] }],
      "scroll-pt": [{ "scroll-pt": ["header"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return customTwMerge(clsx(inputs));
}

export type WithClassName<P> = Omit<P, "className"> & {
  className?: string;
};
