# Real State Descriptor — Planificación

Sitio de presentación de un edificio de oficinas (real estate): imágenes que transicionan mostrando el edificio, renders, y tour virtual 360 por unidad. Uso interno / visualización — no se comparte como link público, no importa SEO.

Referencia de base: `woloviz` (página `/apartment-2`), de donde se reusa el motor de tours 360 y la estructura de páginas. Referencia de patrón de datos: `clothfigurator_web` (PocketBase mínimo) — **no conectado en esta sesión**, revisar el patrón exacto la próxima vez.

## Decisiones ya tomadas

- **Login**: ninguno por ahora. Sitio público sin gate. Los datos se editan directo desde el admin UI de PocketBase.
- **SEO / SSR**: no es prioridad, no se comparten links. Alcanza con SPA (Vite + React), igual que woloviz. No hace falta Next.js.
- **PocketBase**: guarda el JSON único (la "fuente de la verdad"). Se va a ir construyendo de a poco, no hace falta tenerlo completo ahora.
- **Alcance v1**: Navbar minimal (logo + burger) + Home (hero navegable + 2 CTAs) + Pisos/Unidades con tour 360 por unidad + Aerial (dollhouse por piso) + Galería general de renders + Contact (info estática).

## Stack propuesto

Igual que woloviz, sin lo que no aplica acá (sin AR, sin passcode/auth, sin generador de PDF):

- **Vite + React 18 + react-router-dom**
- **Tailwind CSS** (v4, `@tailwindcss/postcss`, como en woloviz)
- **Marzipano** (vendored, `public/build/marzipano.js`) para los tours 360 — se reusa tal cual el motor de escenas/hotspots que ya funciona en `Apartment2.jsx`
- **PocketBase** (instancia mínima local, patrón `clothfigurator_web`) como storage del JSON único
- Sin login, sin SSR, sin analytics/PDF

## Arquitectura de datos: un solo JSON

PocketBase guarda **un único JSON** (una o pocas filas) que es la fuente de la verdad de todo el sitio. Estructura organizada por piso, cada piso con sus unidades, cada unidad con sus renders y su tour 360:

```json
{
  "building": {
    "id": "edificio-slug",
    "name": "",
    "heroRenders": [
      { "id": "hero-1", "imageUrl": "", "caption": "" },
      { "id": "hero-2", "imageUrl": "", "caption": "" },
      { "id": "hero-3", "imageUrl": "", "caption": "" }
    ]
  },
  "floors": [
    {
      "floorNumber": 0,
      "floorId": "floor-0",
      "label": "Planta Baja",
      "floorplanImage": "",
      "units": [
        {
          "unitId": "floor-0-unit-01",
          "label": "Oficina 01",
          "renders": [
            { "id": "render-1", "imageUrl": "", "caption": "" }
          ],
          "tour360": {
            "scenes": [
              {
                "id": "scene-1",
                "imageUrl": "",
                "equirectWidth": 4000,
                "initialViewParameters": { "pitch": 0, "yaw": 0, "fov": 100 },
                "linkHotspots": [],
                "infoHotspots": []
              }
            ],
            "floorplanScenePositions": [
              { "id": "scene-1", "x": 0.5, "y": 0.5 }
            ]
          }
        }
      ]
    }
  ],
  "renderGallery": [
    { "id": "gallery-1", "imageUrl": "", "title": "", "tags": [] }
  ]
}
```

Notas sobre el schema (asunciones a confirmar, ver "Pendientes"):
- `floorNumber: 0` = planta baja, orden ascendente hacia arriba. El array `floors` se recorre en ese orden.
- `tour360` por unidad usa la misma forma que las `scenes` de Marzipano en woloviz (yaw/pitch/fov en grados, hotspots por escena), para poder reusar el componente del visor casi sin cambios.
- `renders` por unidad son las fotos/renders propias de esa oficina; `renderGallery` es la galería general del edificio (aparte del home).
- Campos de negocio (precio, m², disponibilidad, orientación, etc.) **no** están definidos todavía — se agregan cuando se arma el JSON real, no bloquean la planificación.

## Navegación y páginas (v1)

### Navbar

- Extremal minimal: **logo a la izquierda** (por ahora **wordmark en texto**, placeholder hasta que exista archivo de logo), **menú burger a la derecha**, responsive (mobile-first, el burger se despliega también en desktop si se decide mantener el look minimal — a confirmar visualmente cuando se construya).
- Links del menú, en este orden: **Home, Galería, Pisos, Contacto**.
- `Pisos` es la entrada directa al listado de pisos (no hace falta pasar por el Home para llegar ahí).

### Home

- Hero **full-bleed** con las imágenes de `building.heroRenders` (mismo array del JSON ya definido, no es un carrusel automático).
- Navegación del hero: a cada lado (izquierda/derecha) una **zona/botón del alto completo de la pantalla**, muy sutil (baja opacidad, se resalta al hover), que al click avanza/retrocede a la imagen siguiente/anterior del array `heroRenders`.
- Al centro de la pantalla, **2 CTAs**:
  - **"Iniciar recorrido Interiores"** → entra **directo al tour 360 de la primera unidad** del primer piso (sin pasar por el listado de Pisos). Depende de la convención de orden de piso/unidad aún pendiente de confirmar (ver Pendientes).
  - **"Aerial"** → entra a la página Aerial (ver abajo).

### Pisos (Building)

- Sidebar con el listado de **todos los números de piso** del edificio (usa `floors[].floorNumber` / `label`).
- Al elegir un piso en la sidebar: se muestra el **listado de unidades de ese piso** (grid o lista, a definir visualmente).
- Al elegir una unidad: entra al **tour 360** de esa unidad (visor Marzipano, componente `UnitTour`).
- Flujo: `Sidebar (piso) → Listado de unidades → Tour 360 de la unidad`.

### Aerial

- Misma idea de **sidebar con todos los pisos** que en Pisos, pero el contenido principal es distinto: por cada piso seleccionado se muestra la **imagen dollhouse/floorplan** de ese piso (vista desde arriba, edificio sin techo) — reusa el campo `floors[].floorplanImage` ya definido en el JSON.
- No es una galería de fotos de drone sueltas: es **una imagen top-down por piso**, navegable piso a piso desde la sidebar.
- Pendiente a confirmar (no bloquea el esqueleto): si esa imagen dollhouse es clickeable para saltar directo a una unidad/tour desde ahí, o si por ahora es solo visual y la interacción de entrar a unidades queda exclusiva de la página Pisos.

### Galería

- Página propia (`Gallery`) para el **render gallery general** del edificio (`renderGallery` del JSON). Página separada de Aerial (no comparten ruta ni contenido).

### Contact

- Solo **información estática**: dirección, teléfono, email, mapa embebido. Sin formulario, sin backend nuevo (no toca PocketBase).
- Los datos reales (dirección, teléfono, etc.) se cargan más adelante, no bloquean el esqueleto.

## Estructura de carpetas propuesta

```
real-state-descriptor/
├── README.md
├── package.json
├── vite.config.js
├── tailwind.config.cjs
├── index.html
├── public/
│   ├── build/marzipano.js        # vendored, copiado de woloviz
│   └── assets/                   # renders, 360, floorplans (por piso/unidad)
├── pocketbase/                   # instancia mínima (binario + pb_data), patrón clothfigurator_web
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── routes/AppRoutes.jsx
    ├── lib/pocketbase.js         # cliente PB, fetch del JSON único
    ├── components/
    │   ├── NavBar/                # logo (wordmark) izq + burger responsive
    │   └── FloorSidebar/          # sidebar de pisos, compartida por Building y Aerial
    ├── pages/
    │   ├── Home/                  # hero navegable (heroRenders) + 2 CTAs (Interiores / Aerial)
    │   ├── Building/               # FloorSidebar → listado de unidades del piso → link a UnitTour
    │   ├── UnitTour/               # visor 360 de una unidad (reusa lógica de Apartment2.jsx)
    │   ├── Aerial/                 # FloorSidebar → floorplanImage (dollhouse) del piso
    │   ├── Gallery/                # galería general de renders (renderGallery)
    │   └── Contact/                # info estática (dirección, teléfono, email, mapa)
    └── styles/
```

## Pendientes / a confirmar antes de programar

1. **Orden de pisos**: ¿planta baja = piso 0 o piso 1? ¿el edificio tiene subsuelo(s)? Definir la convención de `floorNumber` antes de cargar datos reales.
2. **Cantidad real de pisos y unidades por piso** (para saber si el JSON de ejemplo de arriba alcanza o hace falta anidar más).
3. **Patrón exacto de PocketBase mínimo**: revisar `clothfigurator_web` (conectar esa carpeta la próxima sesión) para copiar la config real (colección, campos, cómo se sirve el JSON).
4. **Campos por unidad**: confirmar qué datos de negocio van (precio, m², disponibilidad, orientación) cuando se arme el JSON real — no es necesario ahora.
5. **Convención de nombres/carpetas de assets** (renders y 360 por piso/unidad) para que coincida 1:1 con los `imageUrl` del JSON.
6. **Interactividad de Aerial**: la imagen dollhouse por piso, ¿es solo visual (navegación únicamente por la sidebar) o tiene hotspots clickeables para saltar directo a una unidad/tour desde ahí?
7. **Layout de Building**: el listado de unidades por piso (grid vs lista) y su diseño visual, a definir cuando se construya.
8. **Datos reales de Contact**: dirección, teléfono, email y el mapa a embeber — se cargan cuando se arme el contenido real, no bloquean el esqueleto.
9. **Burger en desktop**: confirmar si el menú burger se mantiene también en desktop (look extremal minimal) o si ahí se muestran los links inline y el burger es solo mobile.

## Próxima sesión

- Conectar `clothfigurator_web` para copiar el patrón exacto de PocketBase mínimo.
- Bootstrap del proyecto (Vite + Tailwind + react-router + cliente PocketBase).
- Armar el esqueleto de páginas y navegación: `NavBar` (logo texto + burger), rutas de `Home`, `Building`, `Aerial`, `Gallery`, `Contact`, y el componente compartido `FloorSidebar`.
- Vendorizar `marzipano.js` (copiado de woloviz) y adaptar el visor de `Apartment2.jsx` a `UnitTour`.
- Cargar el primer JSON real (aunque sea con 1 piso / 1 unidad de prueba) para validar el circuito completo: PocketBase → fetch → render de Home/Building/UnitTour/Aerial/Gallery/Contact.
