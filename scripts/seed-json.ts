// =============================================================================
// SEED:JSON — actualiza SOLO el campo json del registro de PocketBase, sin tocar
// las imágenes. Mergea la metadata de unidades (info) desde el data local
// (src/data/site.ts, fuente canónica) al json vivo de PB, por unitId, preservando
// las URLs de imágenes ya resueltas.
//
// Usar cuando cambian datos (info de unidades, labels, etc.), no imágenes:
//   pnpm seed:json
// Para cambios de imágenes, usar el seed completo: pnpm seed
// =============================================================================
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { site } from "../src/data/site";
import type { Site } from "../src/types/site";

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

function curl(args: string[]): string {
  return execFileSync("curl", ["-s", "--max-time", "60", ...args], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
}
function curlJson<T = unknown>(args: string[]): T {
  const out = curl(args);
  try {
    return JSON.parse(out) as T;
  } catch {
    throw new Error(`Respuesta no-JSON de PB: ${out.slice(0, 300)}`);
  }
}

function main() {
  // Metadata canónica local: unitId -> info.
  const infoByUnit = new Map<string, unknown>();
  for (const f of site.floors)
    for (const u of f.units) if (u.info) infoByUnit.set(u.unitId, u.info);

  // Registro actual de PB (json con URLs de imágenes ya resueltas).
  const list = curlJson<{ items: { id: string; json: Site }[] }>([
    `${RECORDS}?perPage=1`,
  ]);
  const rec = list.items?.[0];
  if (!rec) throw new Error("No hay registro en PB. Corré `pnpm seed` primero.");

  const json = rec.json;
  let count = 0;
  for (const f of json.floors) {
    for (const u of f.units) {
      const info = infoByUnit.get(u.unitId);
      if (info) {
        (u as { info?: unknown }).info = info;
        count++;
      }
    }
  }

  const tmp = join(mkdtempSync(join(tmpdir(), "seedjson-")), "body.json");
  writeFileSync(tmp, JSON.stringify({ json }), "utf8");
  curl([
    "-X",
    "PATCH",
    `${RECORDS}/${rec.id}`,
    "-H",
    "Content-Type: application/json",
    "--data-binary",
    `@${tmp.replace(/\\/g, "/")}`,
  ]);

  console.log(`✔ json actualizado en ${rec.id}: info de ${count} unidad(es)`);
}

main();
