import { useEffect, useState } from "react";

// 不蒜子 (busuanzi) counter. It only answers JSONP, so the count arrives through a script tag.
const endpoint = "https://busuanzi.ibruce.info/busuanzi";

interface BusuanziResponse {
  site_pv?: number;
}

let requestId = 0;

function fetchSitePageViews(): Promise<number> {
  return new Promise((resolve, reject) => {
    const callbackName = `BusuanziCallback_${Date.now()}_${requestId++}`;
    const callbacks = window as unknown as Record<string, unknown>;
    const script = document.createElement("script");
    const cleanup = () => {
      delete callbacks[callbackName];
      script.remove();
    };
    callbacks[callbackName] = (data: BusuanziResponse) => {
      cleanup();
      if (typeof data.site_pv === "number") resolve(data.site_pv);
      else reject(new Error("busuanzi: missing site_pv"));
    };
    script.src = `${endpoint}?jsonpCallback=${callbackName}`;
    script.async = true;
    script.referrerPolicy = "strict-origin-when-cross-origin";
    script.onerror = () => {
      cleanup();
      reject(new Error("busuanzi: request failed"));
    };
    document.body.appendChild(script);
  });
}

/** Total site page views, counted once per page visited. `null` until loaded or if it fails. */
export function useSitePageViews(pathname: string): number | null {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    fetchSitePageViews()
      .then((value) => {
        if (active) setViews(value);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [pathname]);

  return views;
}
