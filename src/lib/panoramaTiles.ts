// =============================================================================
// TILES MULTIRESOLUCIÓN de las panorámicas 360 (generados por
// scripts/build-tiles.mjs en cada build, a partir de los originales intactos).
// El visor baja sólo los tiles que se ven, al nivel de detalle que necesita.
// El manifest no se commitea: si falta (dev sin correr `pnpm tiles`) el glob no
// encuentra nada y el visor usa la imagen equirectangular original.
// =============================================================================

export interface PanoramaTiles {
  /** Carpeta de los tiles: `${base}/{z}/{f}/{y}/{x}.jpg` y `${base}/preview.jpg`. */
  base: string;
  /** Ancho del equirect original (px): define el zoom máximo. */
  width: number;
  faceSize: number;
  /** Niveles de Marzipano.CubeGeometry; el primero es el preview. */
  levels: { tileSize: number; size: number; fallbackOnly?: boolean }[];
}

const manifest: Record<string, PanoramaTiles> =
  (Object.values(
    import.meta.glob("../data/tiles.manifest.json", { eager: true, import: "default" }),
  )[0] as Record<string, PanoramaTiles> | undefined) ?? {};

/** Tiles de una panorámica, o null si no tiene. */
export function panoramaTiles(imageUrl: string): PanoramaTiles | null {
  return manifest[imageUrl] ?? null;
}

/** Lo mínimo para mostrar la escena enseguida: el preview de 6 caras si hay
 *  tiles, si no el original completo. */
export function panoramaStartUrl(imageUrl: string): string {
  const tiles = panoramaTiles(imageUrl);
  return tiles ? `${tiles.base}/preview.jpg` : imageUrl;
}
