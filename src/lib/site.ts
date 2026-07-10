// =============================================================================
// LOADER DEL SITE — capa única de acceso a datos.
// Hoy devuelve el JSON local (src/data/site.ts). Mañana, migración a PocketBase:
// solo se cambia el cuerpo de `loadSite()` por el fetch de la fila única de PB,
// sin tocar páginas ni componentes (todos consumen desde acá).
//
//   // Futuro (PocketBase):
//   import pb from "./pocketbase";
//   const rec = await pb.collection("site").getFirstListItem("");
//   return rec.data as Site;
// =============================================================================
import type { Floor, Site, Unit } from "../types/site";
import { site as localSite } from "../data/site";

let cache: Site | null = null;

/** Carga (y cachea) el JSON único del sitio. Async para ser drop-in de PocketBase. */
export async function loadSite(): Promise<Site> {
  if (cache) return cache;
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
