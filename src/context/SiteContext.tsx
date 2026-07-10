import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Site } from "../types/site";
import { loadSite } from "../lib/site";

const SiteContext = createContext<Site | null>(null);

/** Carga el JSON único una vez y lo provee a toda la app. */
export function SiteProvider({ children }: { children: ReactNode }) {
  const [site, setSite] = useState<Site | null>(null);

  useEffect(() => {
    let alive = true;
    loadSite().then((s) => {
      if (alive) setSite(s);
    });
    return () => {
      alive = false;
    };
  }, []);

  return <SiteContext.Provider value={site}>{children}</SiteContext.Provider>;
}

/** Devuelve el site (o null mientras carga). */
export function useSite(): Site | null {
  return useContext(SiteContext);
}
