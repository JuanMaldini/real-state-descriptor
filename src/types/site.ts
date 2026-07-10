// Tipos del dominio. El sitio entero se describe con un único objeto `Site`
// (la "fuente de la verdad"). Hoy vive en src/data/site.ts; mañana viene de
// PocketBase con exactamente esta forma. Ver src/lib/site.ts.

export interface ImageRef {
  id: string;
  imageUrl: string;
  caption?: string;
}

export interface GalleryItem {
  id: string;
  imageUrl: string;
  title?: string;
  tags?: string[];
}

/** Parámetros de vista de Marzipano, en GRADOS (se convierten a rad en el visor). */
export interface ViewParameters {
  pitch: number;
  yaw: number;
  fov: number;
}

/** Hotspot que salta a otra escena del mismo tour. yaw/pitch en grados. */
export interface LinkHotspot {
  yaw: number;
  pitch: number;
  target: string; // id de la escena destino
  rotation?: number;
}

/** Hotspot informativo (título + texto). yaw/pitch en grados. */
export interface InfoHotspot {
  yaw: number;
  pitch: number;
  title: string;
  text: string;
}

export interface TourScene {
  id: string;
  name?: string;
  imageUrl: string;
  equirectWidth: number;
  initialViewParameters?: ViewParameters;
  linkHotspots: LinkHotspot[];
  infoHotspots: InfoHotspot[];
}

/** Posición relativa (0..1) de una escena sobre el floorplan, para el mini-mapa. */
export interface FloorplanScenePosition {
  id: string; // id de la escena
  x: number;
  y: number;
}

export interface Tour360 {
  scenes: TourScene[];
  floorplanScenePositions: FloorplanScenePosition[];
}

/** Posición relativa (0..1) de una unidad sobre el floorplan del piso, para el
 *  hotspot clickeable que la abre. Origen arriba-izquierda de la imagen. */
export interface UnitHotspot {
  x: number;
  y: number;
}

/** Estado comercial de la unidad (colorea el marcador y el badge del modal). */
export type UnitStatus = "disponible" | "reservado" | "vendido";

/** Metadata de la unidad, mostrada en el mini-modal del hotspot. El "nivel" NO
 *  va acá: se deriva del piso al que pertenece la unidad (Floor.floorNumber). */
export interface UnitInfo {
  areaM2?: number;
  orientation?: string; // "Norte", "N/E", "Sur"…
  status?: UnitStatus;
  rooms?: number; // ambientes/dormitorios
  typology?: string; // "Monoambiente", "2 ambientes", "Oficina"…
}

export interface Unit {
  unitId: string;
  label: string;
  info?: UnitInfo;
  renders: ImageRef[];
  tour360: Tour360;
  /** Ubicación del hotspot sobre el floorplan. Sin esto, la unidad no dibuja
   *  marcador (queda accesible sólo cuando se le asignan coordenadas). */
  hotspot?: UnitHotspot;
}

export interface Floor {
  floorNumber: number;
  floorId: string;
  label: string;
  floorplanImage: string;
  units: Unit[];
}

export interface Building {
  id: string;
  name: string;
  heroRenders: ImageRef[];
}

export interface Site {
  building: Building;
  floors: Floor[];
  renderGallery: GalleryItem[];
}
