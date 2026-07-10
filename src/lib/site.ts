// =============================================================================
// LOADER DEL SITE — capa única de acceso a datos.
// Lee la fila única de la colección PocketBase (campo `json` = objeto Site).
// Si PB no está configurado o falla, cae a los datos locales (src/data/site.ts)
// para no romper dev/demo. Nadie más en la app toca la fuente de datos: todas
// las páginas y componentes consumen desde acá.
// =============================================================================
import type { Floor, Site, Unit } from "../types/site";
import { site as localSite } from "../data/site";
import pb, { PB_COLLECTION, PB_ENABLED } from "./pocketbase";

let cache: Site | null = null;

/** Carga (y cachea) el JSON único del sitio desde PocketBase, con fallback local. */
export async function loadSite(): Promise<Site> {
  if (cache) return cache;
  if (PB_ENABLED) {
    try {
      const rec = await pb.collection(PB_COLLECTION).getFirstListItem("");
      cache = rec.json as Site;
      return cache;
    } catch (err) {
      console.warn("[site] PocketBase no disponible; uso datos locales.", err);
    }
  }
  cache = localSite;
  return cache;
}

/** Acceso síncrono al site ya cargado (o al local). Útil en render tras el fetch. */
export function getSite(): Site {
  return cache ?? localSite;
}

// ---- Selectores derivados (no repetir lógica de búsqueda en cada página) ----

export function findFloor(site: Site, floorId: string): Floor | undefined {
  return site.floors.find((f) => f.floorId === floorId);
}

export function findUnit(
  site: Site,
  floorId: string,
  unitId: string,
): Unit | undefined {
  return findFloor(site, floorId)?.units.find((u) => u.unitId === unitId);
}

/** Primera unidad del primer piso — destino del CTA "Iniciar recorrido Interiores". */
export function firstUnit(
  site: Site,
): { floor: Floor; unit: Unit } | undefined {
  for (const floor of site.floors) {
    if (floor.units.length > 0) {
      return { floor, unit: floor.units[0] };
    }
  }
  return undefined;
}
