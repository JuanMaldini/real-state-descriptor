// Builds multiresolution cube tiles for every tour panorama, so the viewer only
// downloads (and uploads to the GPU) the tiles in view at the resolution it
// needs. The original equirectangular files in /public are only read, never
// modified; they stay as the source of truth and as fallback.
//
// For each 360 scene in src/data/site.ts (an `imageUrl` followed by its
// `equirectWidth`) it writes:
//   public/tiles/<path>/{z}/{f}/{y}/{x}.jpg   cube tiles, Marzipano layout
//   public/tiles/<path>/preview.jpg           6 small faces stacked (bdflru)
// and src/data/tiles.manifest.json, which the tour reads to pick tiles over the
// original image.
//
// Usage: pnpm tiles   (also runs as part of build)
import { readFile, writeFile, mkdir, rm, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import os from "node:os";
import { Worker, isMainThread, parentPort, workerData } from "node:worker_threads";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const TILES_DIR = "tiles";
const DATA_FILE = path.join(ROOT, "src/data/site.ts");
const MANIFEST = path.join(ROOT, "src/data/tiles.manifest.json");
// Per-panorama stamps for incremental rebuilds, kept out of /public so they
// are not deployed.
const CACHE_DIR = path.join(ROOT, "node_modules/.cache/build-tiles");
// Bump when the output changes for the same input, to force a rebuild.
const VERSION = 3;

// Tile edge range; the exact size is picked per panorama (see faceLayout).
const MIN_TILE = 256;
const MAX_TILE = 512;
// Faces are sampled at this multiple of their final size, then downscaled with
// lanczos3: antialiasing where the equirect is denser than the face (poles).
const SUPERSAMPLE = 2;
// libjpeg-turbo, no chroma subsampling. mozjpeg saves ~10% but is ~5x slower,
// and this runs on every build.
const JPEG = { quality: 92, chromaSubsampling: "4:4:4", optimiseCoding: true };
// One worker thread per panorama being processed (the reprojection is plain JS).
const CONCURRENCY = Math.max(1, Math.min(6, os.availableParallelism() - 1));

// Same face set and rotations as src/geometries/Cube.js.
const FACE_ROTATION = {
  b: { x: 0, y: Math.PI },
  d: { x: -Math.PI / 2, y: 0 },
  f: { x: 0, y: 0 },
  l: { x: 0, y: Math.PI / 2 },
  r: { x: 0, y: -Math.PI / 2 },
  u: { x: Math.PI / 2, y: 0 },
};
const PREVIEW_ORDER = "bdflru";

async function findPanoramas() {
  const text = await readFile(DATA_FILE, "utf8");
  const refs = new Set();
  // Only 360 scenes: renders also have an imageUrl, but no equirectWidth.
  for (const [, ref] of text.matchAll(/imageUrl:\s*["'`](\/[^"'`]+)["'`],\s*equirectWidth/g)) refs.add(ref);
  return [...refs].sort();
}

// Marzipano needs every cube level to be an exact multiple of the previous one
// (size and tile count), so levels are tile × 1, 2, 4, … The face must keep the
// equirect's angular resolution at its center (W / 2π px per radian, i.e. a
// face of W / π): pick the smallest tile × 2^n that reaches it, with tiles
// between MIN_TILE and MAX_TILE (multiples of 32). 3840 → 1280 (tile 320),
// 7680 → 2560 (tile 320). The preview is half a tile per face.
function faceLayout(equirectWidth) {
  const target = equirectWidth / Math.PI;
  let best = null;
  for (let tile = MIN_TILE; tile <= MAX_TILE; tile += 32) {
    let faceSize = tile;
    while (faceSize < target) faceSize *= 2;
    if (!best || faceSize < best.faceSize || (faceSize === best.faceSize && tile > best.tileSize)) {
      best = { faceSize, tileSize: tile };
    }
  }
  const sizes = [];
  for (let size = best.tileSize; size <= best.faceSize; size *= 2) sizes.push(size);
  return { ...best, sizes, previewSize: best.tileSize / 2 };
}

// Renders one cube face of `size` px from the equirect (bilinear, horizontal
// wrap). Direction math mirrors Marzipano: face-local (x, y, -0.5) rotated by
// X then Y; the equirect shader maps theta = atan2(x, -z), phi = acos(y / r).
function renderFace(src, face, size) {
  const { data, width: W, height: H, channels: C } = src;
  const { x: rx, y: ry } = FACE_ROTATION[face];
  const cx = Math.cos(rx), sx = Math.sin(rx), cy = Math.cos(ry), sy = Math.sin(ry);
  const out = Buffer.allocUnsafe(size * size * 3);
  const maxRow = H - 1;

  for (let j = 0; j < size; j++) {
    const ly = 0.5 - (j + 0.5) / size;
    for (let i = 0; i < size; i++) {
      const lx = (i + 0.5) / size - 0.5;
      // rotateX
      const y1 = ly * cx + 0.5 * sx;
      const z1 = ly * sx - 0.5 * cx;
      // rotateY
      const x2 = z1 * sy + lx * cy;
      const z2 = z1 * cy - lx * sy;
      const r = Math.sqrt(x2 * x2 + y1 * y1 + z2 * z2);

      const theta = Math.atan2(x2, -z2);
      const phi = Math.acos(y1 / r);
      const u = (0.5 + theta / (2 * Math.PI)) * W - 0.5;
      const v = Math.min(Math.max((phi / Math.PI) * H - 0.5, 0), maxRow);

      const u0f = Math.floor(u);
      const v0 = Math.floor(v);
      const fu = u - u0f;
      const fv = v - v0;
      const u0 = ((u0f % W) + W) % W;
      const u1 = (u0 + 1) % W;
      const v1 = Math.min(v0 + 1, maxRow);

      const p00 = (v0 * W + u0) * C;
      const p01 = (v0 * W + u1) * C;
      const p10 = (v1 * W + u0) * C;
      const p11 = (v1 * W + u1) * C;
      const w00 = (1 - fu) * (1 - fv);
      const w01 = fu * (1 - fv);
      const w10 = (1 - fu) * fv;
      const w11 = fu * fv;
      const o = (j * size + i) * 3;
      out[o] = data[p00] * w00 + data[p01] * w01 + data[p10] * w10 + data[p11] * w11 + 0.5;
      out[o + 1] = data[p00 + 1] * w00 + data[p01 + 1] * w01 + data[p10 + 1] * w10 + data[p11 + 1] * w11 + 0.5;
      out[o + 2] = data[p00 + 2] * w00 + data[p01 + 2] * w01 + data[p10 + 2] * w10 + data[p11 + 2] * w11 + 0.5;
    }
  }
  return out;
}

const raw = (buffer, size) => sharp(buffer, { raw: { width: size, height: size, channels: 3 } });

async function resizeRaw(buffer, from, to) {
  if (from === to) return buffer;
  return raw(buffer, from).resize(to, to, { kernel: "lanczos3" }).raw().toBuffer();
}

async function writeTiles(faceBuffer, faceSize, levelSize, tileSize, z, face, outDir) {
  const level = await resizeRaw(faceBuffer, faceSize, levelSize);
  const count = levelSize / tileSize;
  const jobs = [];
  for (let y = 0; y < count; y++) {
    const dir = path.join(outDir, String(z), face, String(y));
    await mkdir(dir, { recursive: true });
    for (let x = 0; x < count; x++) {
      // Copy the tile out in JS: handing sharp the whole level for every tile
      // costs a full-level copy each time.
      const tile = Buffer.allocUnsafe(tileSize * tileSize * 3);
      const rowBytes = tileSize * 3;
      for (let row = 0; row < tileSize; row++) {
        const start = ((y * tileSize + row) * levelSize + x * tileSize) * 3;
        level.copy(tile, row * rowBytes, start, start + rowBytes);
      }
      jobs.push(raw(tile, tileSize).jpeg(JPEG).toFile(path.join(dir, `${x}.jpg`)));
    }
  }
  await Promise.all(jobs);
}

async function buildPanorama(ref) {
  const input = path.join(PUBLIC, ref);
  const relative = ref.replace(/^\//, "").replace(/\.[^.]+$/, "");
  const base = `/${TILES_DIR}/${relative}`;
  const outDir = path.join(PUBLIC, TILES_DIR, relative);
  const stampFile = path.join(CACHE_DIR, `${relative.replace(/[\/]/g, "__")}.json`);

  const srcStat = await stat(input);
  const key = crypto
    .createHash("sha1")
    .update(JSON.stringify({ VERSION, MIN_TILE, MAX_TILE, SUPERSAMPLE, JPEG, size: srcStat.size, mtime: srcStat.mtimeMs }))
    .digest("hex");

  if (existsSync(stampFile) && existsSync(path.join(outDir, "preview.jpg"))) {
    const stamp = JSON.parse(await readFile(stampFile, "utf8"));
    if (stamp.key === key) return { ref, entry: stamp.entry, cached: true };
  }

  const started = Date.now();
  const src = await sharp(input, { limitInputPixels: false })
    .removeAlpha()
    .toColourspace("srgb")
    .raw()
    .toBuffer({ resolveWithObject: true });
  const source = { data: src.data, width: src.info.width, height: src.info.height, channels: src.info.channels };

  const { faceSize, tileSize, sizes, previewSize } = faceLayout(source.width);

  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  const previews = {};
  for (const face of PREVIEW_ORDER) {
    const sampled = renderFace(source, face, faceSize * SUPERSAMPLE);
    const full = await resizeRaw(sampled, faceSize * SUPERSAMPLE, faceSize);
    previews[face] = await resizeRaw(full, faceSize, previewSize);
    // z = 0 is the preview level (served from preview.jpg), tiles start at 1.
    for (let i = 0; i < sizes.length; i++) {
      await writeTiles(full, faceSize, sizes[i], tileSize, i + 1, face, outDir);
    }
  }

  const strip = Buffer.concat([...PREVIEW_ORDER].map((face) => previews[face]));
  await sharp(strip, { raw: { width: previewSize, height: previewSize * 6, channels: 3 } })
    .jpeg(JPEG)
    .toFile(path.join(outDir, "preview.jpg"));

  const entry = {
    base,
    width: source.width,
    faceSize,
    levels: [
      { tileSize: previewSize, size: previewSize, fallbackOnly: true },
      ...sizes.map((size) => ({ tileSize, size })),
    ],
  };
  await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(stampFile, JSON.stringify({ key, entry }));
  console.log(`${ref} -> ${base} (face ${faceSize}, tile ${tileSize}, levels ${sizes.join("/")}) ${((Date.now() - started) / 1000).toFixed(1)}s`);
  return { ref, entry, cached: false };
}

if (!isMainThread) {
  sharp.concurrency(1);
  parentPort.postMessage(await buildPanorama(workerData.ref));
} else {
  await main();
}

function runWorker(ref) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL(import.meta.url), { workerData: { ref } });
    worker.once("message", resolve);
    worker.once("error", reject);
    worker.once("exit", (code) => code !== 0 && reject(new Error(`worker for ${ref} exited with ${code}`)));
  });
}

async function main() {
  const started = Date.now();
  const refs = await findPanoramas();
  const results = [];
  const queue = [...refs];
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (queue.length) {
        const ref = queue.shift();
        if (!existsSync(path.join(PUBLIC, ref))) {
          console.warn(`skip (missing): ${ref}`);
          continue;
        }
        results.push(await runWorker(ref));
      }
    }),
  );

  const manifest = {};
  for (const { ref, entry } of results.sort((a, b) => a.ref.localeCompare(b.ref))) manifest[ref] = entry;
  await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}
`);
  const cached = results.filter((r) => r.cached).length;
  console.log(
    `
${results.length} panoramas (${cached} up to date) in ${((Date.now() - started) / 1000).toFixed(1)}s -> ${path.relative(ROOT, MANIFEST)}`,
  );
}
