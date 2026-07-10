// =============================================================================
// PRECARGA EN BACKGROUND — "calienta" la caché del navegador con las imágenes
// pesadas (floorplans, panorámicas 360, renders) para que navegar sea instantáneo.
//
// Orden alternado ends-inward: último piso, primero, penúltimo, segundo, …
// De a una imagen, baja prioridad. Arranca cuando el navegador está idle (tras
// cargar la Home). Si entrás a un piso aún no precargado, salta al frente.
//
// crossOrigin: las panorámicas se precargan con crossOrigin="anonymous" para que
// la entrada de caché coincida con la que pide Marzipano (WebGL). El resto
// (floorplans/renders) se precarga SIN crossOrigin, para matchear los <img>.
// =============================================================================
import type { Floor, Site } from "../types/site";

type Asset = { url: string; cors: boolean };
type FloorQueue = { floorId: string; assets: Asset[] };

let started = false;
let running = false;
let queue: FloorQueue[] = [];
let priorityFloorId: string | null = null;
const doneFloors = new Set<string>();
const loaded = new Set<string>();

const keyOf = (a: Asset) => (a.cors ? "c|" : "") + a.url;

// Orden alternado desde los extremos hacia el centro, empezando por el final:
// [f0,f1,f2,f3] -> [f3,f0,f2,f1].
function alternating<T>(arr: T[]): T[] {
  const out: T[] = [];
  let i = 0;
  let j = arr.length - 1;
  let takeEnd = true;
  while (i <= j) {
    if (i === j) {
      out.push(arr[i]);
      break;
    }
    out.push(takeEnd ? arr[j--] : arr[i++]);
    takeEnd = !takeEnd;
  }
  return out;
}

function floorAssets(floor: Floor): Asset[] {
  const out: Asset[] = [{ url: floor.floorplanImage, cors: false }];
  for (const unit of floor.units) {
    for (const scene of unit.tour360.scenes) {
      out.push({ url: scene.imageUrl, cors: true }); // panorámica → Marzipano/WebGL
    }
    for (const render of unit.renders) {
      out.push({ url: render.imageUrl, cors: false });
    }
  }
  return out;
}

function preload(asset: Asset): Promise<void> {
  return new Promise((resolve) => {
    const k = keyOf(asset);
    if (loaded.has(k)) return resolve();
    const img = new Image();
    if (asset.cors) img.crossOrigin = "anonymous";
    img.decoding = "async";
    try {
      (img as unknown as { fetchPriority: string }).fetchPriority = "low";
    } catch {
      /* navegador sin soporte */
    }
    const done = () => {
      loaded.add(k);
      resolve();
    };
    img.onload = done;
    img.onerror = done; // no bloquear la cola por una imagen que falle
    img.src = asset.url;
  });
}

async function run() {
  if (running) return;
  running = true;
  while (queue.length) {
    // Un piso prioritario pendiente salta al frente (entre imágenes).
    if (priorityFloorId) {
      const idx = queue.findIndex((f) => f.floorId === priorityFloorId);
      if (idx > 0) queue.unshift(queue.splice(idx, 1)[0]);
      priorityFloorId = null;
    }
    const floor = queue[0];
    const asset = floor.assets.shift();
    if (!asset) {
      doneFloors.add(floor.floorId);
      queue.shift();
      continue;
    }
    await preload(asset);
  }
  running = false;
}

function kick() {
  const w = window as unknown as {
    requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => void;
  };
  if (w.requestIdleCallback) w.requestIdleCallback(() => run(), { timeout: 2000 });
  else setTimeout(() => run(), 800);
}

/** Arranca la precarga una sola vez (idempotente). Llamar tras cargar la Home. */
export function startPreload(site: Site) {
  if (started) return;
  started = true;
  const ascending = [...site.floors].sort(
    (a, b) => a.floorNumber - b.floorNumber,
  );
  queue = alternating(ascending).map((f) => ({
    floorId: f.floorId,
    assets: floorAssets(f),
  }));
  kick();
}

/** Sube un piso al frente de la cola (al entrar a Pisos/Tour de ese piso). */
export function prioritizeFloor(floorId: string) {
  if (doneFloors.has(floorId)) return;
  priorityFloorId = floorId;
  if (!running && queue.length) run();
}
