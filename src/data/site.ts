// =============================================================================
// DATOS DEMO — el "único JSON" (fuente de la verdad) mientras no hay PocketBase.
// Se sirve tal cual vía src/lib/site.ts. En la migración, este objeto pasa a
// ser una fila en PocketBase con exactamente la misma forma (ver types/site.ts).
// Assets de demo: 360 de woloviz/Apartment2 copiados a public/assets/demo/.
// =============================================================================
import type { Site, Tour360 } from "../types/site";

// Tour 360 de demo (reusa las escenas y hotspots de Apartment2 de woloviz).
// Ángulos en GRADOS; el visor los convierte a radianes.
const demoTour: Tour360 = {
  scenes: [
    {
      id: "scene-1",
      name: "Acceso",
      imageUrl: "/assets/demo/tour/Apartment2_360_01.jpg",
      equirectWidth: 4000,
      initialViewParameters: { pitch: 5, yaw: 295, fov: 100 },
      linkHotspots: [
        { yaw: -1.65732, pitch: -22.765205, target: "scene-2" },
        { yaw: -42.054088, pitch: -14.062712, target: "scene-3" },
      ],
      infoHotspots: [],
    },
    {
      id: "scene-2",
      name: "Estar",
      imageUrl: "/assets/demo/tour/Apartment2_360_02.jpg",
      equirectWidth: 4000,
      linkHotspots: [
        { yaw: 178.901774, pitch: -21.890689, target: "scene-1" },
        { yaw: -79.0674, pitch: -21.006124, target: "scene-3" },
        { yaw: -99.495114, pitch: -15.770656, target: "scene-4" },
      ],
      infoHotspots: [],
    },
    {
      id: "scene-3",
      name: "Oficina",
      imageUrl: "/assets/demo/tour/Apartment2_360_03.jpg",
      equirectWidth: 4000,
      linkHotspots: [
        { yaw: 133.139627, pitch: -17.155637, target: "scene-1" },
        { yaw: 85.68115, pitch: -23.16039, target: "scene-2" },
        { yaw: -114.628321, pitch: -38.19572, target: "scene-4" },
      ],
      infoHotspots: [],
    },
    {
      id: "scene-4",
      name: "Sala reuniones",
      imageUrl: "/assets/demo/tour/Apartment2_360_04.jpg",
      equirectWidth: 4000,
      linkHotspots: [
        { yaw: 117.383696, pitch: -12.720225, target: "scene-1" },
        { yaw: 79.303294, pitch: -15.399052, target: "scene-2" },
        { yaw: 51.74327, pitch: -34.171095, target: "scene-3" },
      ],
      infoHotspots: [],
    },
  ],
  floorplanScenePositions: [
    { id: "scene-1", x: 0.938, y: 0.401 },
    { id: "scene-2", x: 0.589, y: 0.283 },
    { id: "scene-3", x: 0.776, y: 0.58 },
    { id: "scene-4", x: 0.5, y: 0.5 },
  ],
};

const demoRenders = [
  { id: "r1", imageUrl: "/assets/demo/renders/r1.jpg", caption: "Vista 1" },
  { id: "r2", imageUrl: "/assets/demo/renders/r2.jpg", caption: "Vista 2" },
];

export const site: Site = {
  building: {
    id: "edificio-demo",
    name: "Edificio Demo",
    heroRenders: [
      { id: "hero-1", imageUrl: "/assets/demo/renders/r1.jpg", caption: "" },
      { id: "hero-2", imageUrl: "/assets/demo/renders/r2.jpg", caption: "" },
      { id: "hero-3", imageUrl: "/assets/demo/renders/r3.jpg", caption: "" },
    ],
  },
  floors: [
    {
      floorNumber: 0,
      floorId: "floor-0",
      label: "Planta Baja",
      floorplanImage: "/assets/demo/floorplans/floor-0.jpg",
      units: [
        {
          unitId: "floor-0-unit-01",
          label: "Oficina 01",
          info: {
            areaM2: 45,
            orientation: "Norte",
            status: "disponible",
            rooms: 2,
            typology: "Oficina",
          },
          renders: demoRenders,
          tour360: demoTour,
          hotspot: { x: 0.35, y: 0.5 },
        },
        {
          unitId: "floor-0-unit-02",
          label: "Oficina 02",
          info: {
            areaM2: 62,
            orientation: "Sur",
            status: "reservado",
            rooms: 3,
            typology: "Oficina",
          },
          renders: demoRenders,
          tour360: demoTour,
          hotspot: { x: 0.65, y: 0.5 },
        },
      ],
    },
    {
      floorNumber: 1,
      floorId: "floor-1",
      label: "Piso 1",
      floorplanImage: "/assets/demo/floorplans/floor-0.jpg",
      units: [
        {
          unitId: "floor-1-unit-01",
          label: "Oficina 01",
          info: {
            areaM2: 48,
            orientation: "Este",
            status: "disponible",
            rooms: 2,
            typology: "Oficina",
          },
          renders: demoRenders,
          tour360: demoTour,
          hotspot: { x: 0.35, y: 0.5 },
        },
        {
          unitId: "floor-1-unit-02",
          label: "Oficina 02",
          info: {
            areaM2: 70,
            orientation: "Oeste",
            status: "vendido",
            rooms: 3,
            typology: "Oficina",
          },
          renders: demoRenders,
          tour360: demoTour,
          hotspot: { x: 0.65, y: 0.5 },
        },
      ],
    },
    {
      floorNumber: 2,
      floorId: "floor-2",
      label: "Piso 2",
      floorplanImage: "/assets/demo/floorplans/floor-0.jpg",
      units: [
        {
          unitId: "floor-2-unit-01",
          label: "Oficina 01",
          info: {
            areaM2: 95,
            orientation: "N/E",
            status: "disponible",
            rooms: 4,
            typology: "Oficina premium",
          },
          renders: demoRenders,
          tour360: demoTour,
          hotspot: { x: 0.5, y: 0.5 },
        },
      ],
    },
  ],
  renderGallery: [
    { id: "gallery-1", imageUrl: "/assets/demo/renders/r1.jpg", title: "Render 1", tags: ["fachada"] },
    { id: "gallery-2", imageUrl: "/assets/demo/renders/r2.jpg", title: "Render 2", tags: ["interior"] },
    { id: "gallery-3", imageUrl: "/assets/demo/renders/r3.jpg", title: "Render 3", tags: ["interior"] },
    { id: "gallery-4", imageUrl: "/assets/demo/renders/r4.jpg", title: "Render 4", tags: ["común"] },
  ],
};
