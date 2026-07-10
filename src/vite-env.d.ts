/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base de PocketBase, ej. https://pocketbase.vmoliver.cloud */
  readonly VITE_PB_URL?: string;
  /** Nombre de la colección con la fila única del sitio. */
  readonly VITE_PB_COLLECTION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
