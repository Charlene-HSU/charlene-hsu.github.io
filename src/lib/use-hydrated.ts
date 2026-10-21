import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * `false` during prerendering and the hydration render, `true` afterwards.
 * Use it for UI that depends on browser-only state (such as search params the
 * prerendered HTML did not have), so the first client render matches the HTML.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
