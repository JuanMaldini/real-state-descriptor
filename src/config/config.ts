// =============================================================================
// CONFIG CENTRAL DEL SITIO
// -----------------------------------------------------------------------------
// Fuente única de "perillas" del proyecto: identidad, colores, tiempos de fade,
// breakpoints, navegación, defaults del visor 360 y datos de contacto.
// Los DATOS del edificio (pisos/unidades/renders) NO van acá: viven en
// src/data/site.ts (tipados en src/types/site.ts). Acá va lo que configura
// el comportamiento y el look, no el contenido.
// =============================================================================

/** Identidad / metadata del sitio. */
export const SITE = {
  /** Wordmark en texto (placeholder hasta que exista archivo de logo). */
  wordmark: "EDIFICIO",
  /** Nombre largo, para títulos. */
  name: "Real State Descriptor",
  /** Idioma de la UI. */
  lang: "es",
} as const;

// -----------------------------------------------------------------------------
// PALETA — brutalista, blanco y negro. Todo pasa por acá; nada de hex sueltos
// en los componentes. Se exponen también como CSS vars (ver src/index.css).
// -----------------------------------------------------------------------------
export const COLORS = {
  bg: "#ffffff",
  fg: "#000000",
  /** Invertido: fondo negro, texto blanco (hero, tour, secciones "dark"). */
  bgInverse: "#000000",
  fgInverse: "#ffffff",
  /** Líneas/bordes brutalistas. */
  line: "#000000",
  /** Gris de apoyo (placeholders, estados muted). */
  muted: "#8a8a8a",
  mutedBg: "#f2f2f2",
  /** Overlay para zonas navegables del hero. */
  overlay: "rgba(0,0,0,0.0)",
  overlayHover: "rgba(0,0,0,0.18)",
} as const;

// -----------------------------------------------------------------------------
// TIPOGRAFÍA — una sola familia, pesos extremos (brutalismo).
// -----------------------------------------------------------------------------
export const TYPO = {
  fontFamily:
    '"Helvetica Neue", Helvetica, Arial, "Segoe UI", system-ui, sans-serif',
  weightNormal: 400,
  weightBold: 700,
  /** Tracking amplio para wordmarks/labels en mayúsculas. */
  trackingWide: "0.18em",
} as const;

// -----------------------------------------------------------------------------
// MOTION — tiempos de fade/transición centralizados (ms).
// -----------------------------------------------------------------------------
export const MOTION = {
  /** Crossfade entre imágenes del hero. */
  heroFadeMs: 600,
  /** Transiciones de UI genéricas (hover, opacidad de zonas). */
  uiMs: 200,
  /** Apertura/cierre de menús y paneles. */
  panelMs: 300,
  /** Fundido al entrar/salir del visor 360. */
  tourFadeMs: 400,
} as const;

// -----------------------------------------------------------------------------
// LAYOUT / BREAKPOINTS — el nav pasa a burger por debajo de `navInlineMinPx`.
// Desktop: items inline. Tablet/móvil: burger.
// -----------------------------------------------------------------------------
export const LAYOUT = {
  /** A partir de este ancho (px) el nav muestra items inline; por debajo, burger. */
  navInlineMinPx: 1024,
  navHeightPx: 56,
  contentMaxPx: 1600,
} as const;

// -----------------------------------------------------------------------------
// NAVEGACIÓN — orden e items del menú. Rutas centralizadas en ROUTES.
// -----------------------------------------------------------------------------
export const ROUTES = {
  home: "/",
  /** La galería es una sección del Home; el nav hace scroll a #galeria. */
  gallery: "/#galeria",
  building: "/pisos",
  floor: (floorId: string) => `/pisos/${floorId}`,
  tour: (floorId: string, unitId: string) => `/tour/${floorId}/${unitId}`,
  /** Contacto es una sección del Home; el nav (si aplica) hace scroll a #contacto. */
  contact: "/#contacto",
} as const;

export interface NavItem {
  label: string;
  to: string;
}

/** Orden: Home, Pisos. Galería y Contacto son secciones del Home (no van en el nav). */
export const NAV_ITEMS: NavItem[] = [
  { label: "Home", to: ROUTES.home },
  { label: "Pisos", to: ROUTES.building },
];

// -----------------------------------------------------------------------------
// HERO — comportamiento del hero navegable del Home.
// -----------------------------------------------------------------------------
export const HERO = {
  /** Ancho (% de la pantalla) de cada zona lateral clickeable prev/next. */
  navZoneWidthPct: 22,
  ctas: {
    interiores: "Iniciar recorrido Interiores",
    pisos: "Ver plantas",
  },
} as const;

// -----------------------------------------------------------------------------
// VISOR 360 (Marzipano) — defaults del motor. Se reusa la lógica de woloviz
// (Apartment2), pero solo lo esencial. Ángulos de las escenas van en GRADOS.
// -----------------------------------------------------------------------------
export const MARZIPANO = {
  /** Script vendored (public/build/marzipano.js). */
  scriptSrc: "/build/marzipano.js",
  /** "drag" = arrastrar para mirar; "qtvr" = mover según posición del cursor. */
  mouseViewMode: "drag" as "drag" | "qtvr",
  /** Autorotación (por defecto off; look sobrio). */
  autorotateEnabled: false,
  autorotateYawSpeed: 0.03,
  /** FOV inicial por defecto si la escena no lo define (grados). */
  defaultFovDeg: 100,
  /** Límite de FOV (grados) para el zoom. */
  maxFovDeg: 120,
  /** Marzipano usa pitch positivo hacia abajo; invertimos para datos "naturales". */
  hotspotPitchSign: -1 as 1 | -1,
} as const;

// -----------------------------------------------------------------------------
// CONTACTO — info estática (placeholders; se cargan datos reales luego).
// -----------------------------------------------------------------------------
export const CONTACT = {
  address: "Dirección del edificio, Ciudad",
  phone: "+00 000 000 000",
  email: "info@edificio.com",
  /** URL de embed de mapa (Google Maps embed). Vacío = placeholder. */
  mapEmbedUrl: "",
} as const;
