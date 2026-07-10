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

export interface Unit {
  unitId: string;
  label: string;
  renders: ImageRef[];
  tour360: Tour360;
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
