// =============================================================================
// SEED — sube el sitio a PocketBase (colección `rsdescriptor`, fila única).
//   1. Junta todas las rutas de imagen del Site y las DEDUPLICA (sube 1 vez).
//   2. Crea el registro y sube las imágenes al campo `files` (de a una).
//   3. Lee los filenames que PB asignó y arma las URLs absolutas.
//   4. Reescribe cada `imageUrl` del Site con su URL de PB y lo guarda en `json`.
//
// Usa `curl` para todas las requests (sólido en Windows con archivos grandes;
// el SDK de PocketBase colgaba subiendo multipart pesado).
//
// Correr con:  pnpm seed
// Requiere PB con escritura abierta (hoy lo está). Cerrar Create/Update/Delete
// a superusers DESPUÉS del seed.
// =============================================================================
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { site } from "../src/data/site";
import type { Site } from "../src/types/site";

// ---- .env (Node no lo autocarga como Vite) ---------------------------------
function loadEnv(): Record<string, string> {
  const out: Record<string, string> = {};
  try {
    const raw = readFileSync(join(process.cwd(), ".env"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      if (line.trim().startsWith("#")) continue;
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (m) out[m[1]] = m[2].trim();
    }
  } catch {
    /* sin .env */
  }
  return { ...out, ...process.env } as Record<string, string>;
}

const env = loadEnv();
const PB_URL = (env.VITE_PB_URL ?? "").replace(/\/+$/, "");
const COLLECTION = env.VITE_PB_COLLECTION ?? "rsdescriptor";
if (!PB_URL) throw new Error("Falta VITE_PB_URL en .env");

const RECORDS = `${PB_URL}/api/collections/${COLLECTION}/records`;

// ---- Helpers curl ----------------------------------------------------------
function curl(args: string[]): string {
  return execFileSync("curl", ["-s", "--max-time", "180", ...args], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
}
function curlJson<T = any>(args: string[]): T {
  const out = curl(args);
  try {
    return JSON.parse(out) as T;
  } catch {
    throw new Error(`Respuesta no-JSON de PB: ${out.slice(0, 300)}`);
  }
}

// ---- Recolectar rutas de imagen locales (únicas) ---------------------------
function collectLocalImages(s: Site): string[] {
  const set = new Set<string>();
  const add = (u?: string) => {
    if (u && u.startsWith("/")) set.add(u);
  };
  s.building.heroRenders.forEach((r) => add(r.imageUrl));
  s.renderGallery.forEach((g) => add(g.imageUrl));
  s.floors.forEach((f) => {
    add(f.floorplanImage);
    f.units.forEach((u) => {
      u.renders.forEach((r) => add(r.imageUrl));
      u.tour360.scenes.forEach((sc) => add(sc.imageUrl));
    });
  });
  return [...set];
}

// ---- Reescribir el Site reemplazando cada imageUrl según el mapa -----------
function rewrite(s: Site, map: Map<string, string>): Site {
  const clone: Site = structuredClone(s);
  const fix = (u: string) => map.get(u) ?? u;
  clone.building.heroRenders.forEach((r) => (r.imageUrl = fix(r.imageUrl)));
  clone.renderGallery.forEach((g) => (g.imageUrl = fix(g.imageUrl)));
  clone.floors.forEach((f) => {
    f.floorplanImage = fix(f.floorplanImage);
    f.units.forEach((u) => {
      u.renders.forEach((r) => (r.imageUrl = fix(r.imageUrl)));
      u.tour360.scenes.forEach((sc) => (sc.imageUrl = fix(sc.imageUrl)));
    });
  });
  return clone;
}

function main() {
  // Limpiar registros previos (fila única).
  const list = curlJson<{ items: { id: string }[] }>([RECORDS + "?perPage=200"]);
  for (const rec of list.items ?? []) {
    curl(["-X", "DELETE", `${RECORDS}/${rec.id}`]);
  }
  if (list.items?.length) console.log(`· Borrados ${list.items.length} registro(s) previos`);

  // Crear registro vacío.
  const created = curlJson<{ id: string; files?: string[] }>([
    "-X", "POST", RECORDS,
    "-H", "Content-Type: application/json",
    "-d", "{}",
  ]);
  const id = created.id;
  if (!id) throw new Error("No se pudo crear el registro");
  console.log(`· Registro ${id} creado`);

  // Subir imágenes únicas, de a una (curl streamea el archivo desde disco).
  const paths = collectLocalImages(site);
  console.log(`· ${paths.length} imágenes únicas a subir`);
  const map = new Map<string, string>();
  let known = new Set<string>();
  for (const p of paths) {
    const filePath = join(process.cwd(), "public", p.replace(/^\//, "")).replace(/\\/g, "/");
    const name = p.split("/").pop()!;
    const rec = curlJson<{ files?: string[] }>([
      "-X", "PATCH", `${RECORDS}/${id}`,
      "-F", `files+=@${filePath};filename=${name}`,
    ]);
    const files = rec.files ?? [];
    const added = files.find((f) => !known.has(f));
    if (!added) throw new Error(`No se detectó el archivo subido para ${p}`);
    known = new Set(files);
    map.set(p, `${PB_URL}/api/files/${COLLECTION}/${id}/${added}`);
    console.log(`  ✔ ${name}`);
  }

  // Guardar el Site reescrito en el campo json (body grande → archivo temporal).
  const rewritten = rewrite(site, map);
  const tmp = join(mkdtempSync(join(tmpdir(), "seed-")), "body.json");
  writeFileSync(tmp, JSON.stringify({ json: rewritten }), "utf8");
  curl([
    "-X", "PATCH", `${RECORDS}/${id}`,
    "-H", "Content-Type: application/json",
    "--data-binary", `@${tmp.replace(/\\/g, "/")}`,
  ]);

  console.log(`✔ Registro ${id} listo con ${map.size} archivos y json`);
  console.log(`  ejemplo: ${map.get(paths[0])}`);
}

main();
