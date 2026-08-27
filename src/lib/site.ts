// =============================================================================
// LOADER DEL SITE — capa única de acceso a datos locales.
// Todas las páginas y componentes consumen la fuente canónica desde acá.
// =============================================================================
import type { Floor, Site, Unit } from "../types/site";
import { site as localSite } from "../data/site";

/** Carga los datos locales del sitio. */
export async function loadSite(): Promise<Site> {
  return localSite;
}

/** Acceso síncrono a los datos locales del sitio. */
export function getSite(): Site {
  return localSite;
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
