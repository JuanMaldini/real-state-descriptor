import type { Site, Tour360 } from "../types/site";

const demoTour: Tour360 = {
  scenes: [
    {
      id: "scene-1",
      name: "Pasillo 2",
      imageUrl: "/assets/demo/tour/PASILLO2.jpg",
      equirectWidth: 4000,
      initialViewParameters: { pitch: 0, yaw: 0, fov: 110 },
      linkHotspots: [
        { yaw: -91.102272, pitch: -25.726284, target: "scene-3" },
        { yaw: -90.239367, pitch: -10.671879, target: "scene-4" },
        { yaw: -0.067802, pitch: -24.477396, target: "scene-2" },
      ],
      infoHotspots: [],
    },
    {
      id: "scene-2",
      name: "Pasillo 3",
      imageUrl: "/assets/demo/tour/PASILLO3.jpg",
      equirectWidth: 4000,
      linkHotspots: [
        { yaw: 65.299259, pitch: 5.710588, target: "scene-9" },
        { yaw: 135, pitch: 4.0, target: "scene-10" },
        { yaw: -179.963724, pitch: -26.897445, target: "scene-1" },
        { yaw: -62.368979, pitch: -13.518321, target: "scene-7" },
      ],
      infoHotspots: [],
    },
    {
      id: "scene-3",
      name: "Pasillo 1",
      imageUrl: "/assets/demo/tour/PASILLO1.jpg",
      equirectWidth: 4000,
      linkHotspots: [
        { yaw: 0.151722, pitch: -26.129494, target: "scene-1" },
        { yaw: -178.646272, pitch: -19.835634, target: "scene-4" },
      ],
      infoHotspots: [],
    },
    {
      id: "scene-4",
      name: "Cocina",
      imageUrl: "/assets/demo/tour/COCINA.jpg",
      equirectWidth: 4000,
      linkHotspots: [
        { yaw: -173.254996, pitch: -19.350127, target: "scene-5" },
        { yaw: 89.329722, pitch: -10.354048, target: "scene-1" },
        { yaw: 88.811116, pitch: -21.327851, target: "scene-3" },
        { yaw: 0.044744, pitch: -10.093202, target: "scene-6" },
      ],
      infoHotspots: [],
    },
    {
      id: "scene-5",
      name: "Cocina 1",
      imageUrl: "/assets/demo/tour/COCINA1.jpg",
      equirectWidth: 4000,
      linkHotspots: [
        { yaw: 2.363699, pitch: -18.788953, target: "scene-4" },
        { yaw: 0.266835, pitch: -1.34962, target: "scene-6" },
      ],
      infoHotspots: [],
    },
    {
      id: "scene-6",
      name: "Living",
      imageUrl: "/assets/demo/tour/LIVING.jpg",
      equirectWidth: 4000,
      linkHotspots: [
        { yaw: -176.944548, pitch: -13.907572, target: "scene-4" },
        { yaw: -176.640759, pitch: 0.152476, target: "scene-5" },
      ],
      infoHotspots: [],
    },
    {
      id: "scene-7",
      name: "Habitación",
      imageUrl: "/assets/demo/tour/HABITACION.jpg",
      equirectWidth: 4000,
      linkHotspots: [
        { yaw: -107.64571, pitch: -35.177651, target: "scene-8" },
        { yaw: 7.453017, pitch: -4.194306, target: "scene-2" },
      ],
      infoHotspots: [],
    },
    {
      id: "scene-8",
      name: "Habitación 2",
      imageUrl: "/assets/demo/tour/HABITACION2.jpg",
      equirectWidth: 4000,
      linkHotspots: [
        { yaw: 51.789679, pitch: -35.548295, target: "scene-7" },
        { yaw: 42.098609, pitch: -7.562748, target: "scene-2" },
      ],
      infoHotspots: [],
    },
    {
      id: "scene-9",
      name: "Habitación B",
      imageUrl: "/assets/demo/tour/HABITACIONB.jpg",
      equirectWidth: 4000,
      linkHotspots: [
        { yaw: 133.690591, pitch: -1.167238, target: "scene-2" },
      ],
      infoHotspots: [],
    },
    {
      id: "scene-10",
      name: "Baño 1",
      imageUrl: "/assets/demo/tour/BANO2.jpg",
      equirectWidth: 4000,
      linkHotspots: [
        { yaw: 10, pitch: 175, target: "scene-2" },
        { yaw: 150, pitch: -115, target: "scene-11" },
      ],
      infoHotspots: [],
    },
    {
      id: "scene-11",
      name: "Baño 2",
      imageUrl: "/assets/demo/tour/BANO1.jpg",
      equirectWidth: 4000,
      linkHotspots: [
        { yaw: 10, pitch: 175, target: "scene-2" },
        { yaw: 180, pitch: -70, target: "scene-10" },
      ],
      infoHotspots: [],
    },
  ],
  floorplanScenePositions: [
    { id: "scene-1", x: 0.4292763157894737, y: 0.2878289473684211 },
    { id: "scene-2", x: 0.45526315789473687, y: 0.4789473684210526 },
    { id: "scene-3", x: 0.5039473684210526, y: 0.45 },
    { id: "scene-4", x: 0.6092105263157894, y: 0.4842105263157895 },
    { id: "scene-5", x: 0.5605263157894737, y: 0.46578947368421053 },
    { id: "scene-6", x: 0.5026315789473684, y: 0.5986842105263158 },
    { id: "scene-7", x: 0.5842105263157895, y: 0.5460526315789473 },
    { id: "scene-8", x: 0.26644736842105265, y: 0.625 },
    { id: "scene-9", x: 0.22697368421052633, y: 0.6661184210526315 },
  ],
};

export const site: Site = {
  building: {
    id: "edificio-demo",
    name: "Edificio Demo",
    heroRenders: [],
    heroVideo: "/assets/demo/tour/ANIMACION3.1.mp4",
  },
  floors: [
    {
      floorNumber: 0,
      floorId: "floor-0",
      label: "Planta única",
      floorplanImage: "/assets/demo/tour/FLOORPLAN.png",
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
          renders: [],
          tour360: demoTour,
          hotspot: { x: 0.65, y: 0.4},
        },
      ],
    },
  ],
  renderGallery: [],
};
