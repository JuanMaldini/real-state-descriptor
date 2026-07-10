// =============================================================================
// CLIENTE POCKETBASE — instancia única para toda la app.
// La URL sale de VITE_PB_URL (sin barra final). Si no hay URL, PB_ENABLED es
// false y el loader (src/lib/site.ts) cae a los datos locales.
// El frontend es de SOLO LECTURA: no autentica; las reglas List/View de la
// colección deben ser públicas.
// =============================================================================
import PocketBase from "pocketbase";

const url = (import.meta.env.VITE_PB_URL ?? "").trim().replace(/\/+$/, "");

const pb = new PocketBase(url);
// Evita abortos por lecturas concurrentes (varias páginas montan a la vez).
pb.autoCancellation(false);

export default pb;

/** Colección con la fila única del sitio (su campo `json` = objeto Site). */
export const PB_COLLECTION = (
  import.meta.env.VITE_PB_COLLECTION ?? "rsdescriptor"
).trim();

/** true si hay una URL de PocketBase configurada. */
export const PB_ENABLED = url.length > 0;
