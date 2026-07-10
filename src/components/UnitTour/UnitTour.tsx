import { useEffect, useRef, useState } from "react";
import type { LinkHotspot, InfoHotspot, Tour360 } from "../../types/site";
import { MARZIPANO } from "../../config/config";
import { loadMarzipano } from "./loadMarzipano";
import "./unitTour.css";

const degToRad = (deg: number) => (deg * Math.PI) / 180;

// Pin SVG brutalista (relleno blanco, trazo negro) para los link-hotspots.
const PIN_SVG = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M12 1.5c-4 0-7 3-7 6.8C5 13.8 12 22.5 12 22.5s7-8.7 7-14.2c0-3.8-3-6.8-7-6.8z"
        fill="#fff" stroke="#000" stroke-width="1.4"/>
  <circle cx="12" cy="8.2" r="2.4" fill="#000"/>
</svg>`;

// Visor 360 minimal: reusa lo esencial del motor Marzipano de woloviz
// (Apartment2), sin preloader/topbar/zoom-buttons. Escenas y hotspots en grados.
export default function UnitTour({ tour }: { tour: Tour360 }) {
  const panoRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const switchRef = useRef<(id: string) => void>(() => {});
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [activeSceneId, setActiveSceneId] = useState<string>(
    tour.scenes[0]?.id ?? "",
  );

  useEffect(() => {
    let disposed = false;
    const panoEl = panoRef.current;
    if (!panoEl) return;

    setReady(false);
    setError(false);

    loadMarzipano()
      .then((Marzipano) => {
        if (disposed || !Marzipano) return;

        const viewer = new Marzipano.Viewer(panoEl, {
          controls: { mouseViewMode: MARZIPANO.mouseViewMode },
        });
        viewerRef.current = viewer;

        const limiter = Marzipano.RectilinearView.limit.traditional(
          10000,
          degToRad(MARZIPANO.maxFovDeg),
          degToRad(MARZIPANO.maxFovDeg),
        );

        const built = tour.scenes.map((sceneData) => {
          const source = Marzipano.ImageUrlSource.fromString(sceneData.imageUrl);
          const geometry = new Marzipano.EquirectGeometry([
            { width: sceneData.equirectWidth || 4000 },
          ]);
          const iv = sceneData.initialViewParameters;
          const view = new Marzipano.RectilinearView(
            {
              yaw: degToRad(iv?.yaw ?? 0),
              pitch: degToRad(iv?.pitch ?? 0),
              fov: degToRad(iv?.fov ?? MARZIPANO.defaultFovDeg),
            },
            limiter,
          );
          const scene = viewer.createScene({
            source,
            geometry,
            view,
            pinFirstLevel: true,
          });
          return { data: sceneData, scene, view };
        });

        const byId = new Map(built.map((s) => [s.data.id, s]));
        let active: (typeof built)[number] | null = null;

        const switchScene = (id: string) => {
          const target = byId.get(id);
          if (!target) return;
          // Mantener el ángulo de vista actual al saltar de escena.
          if (active) target.view.setParameters(active.view.parameters());
          target.scene.switchTo();
          active = target;
          if (!disposed) setActiveSceneId(id);
        };
        switchRef.current = switchScene;

        // Hotspots por escena.
        built.forEach(({ data, scene }) => {
          data.linkHotspots.forEach((h) => {
            scene
              .hotspotContainer()
              .createHotspot(makeLinkHotspot(h, switchScene), {
                yaw: degToRad(h.yaw),
                pitch: degToRad(h.pitch * MARZIPANO.hotspotPitchSign),
              });
          });
          data.infoHotspots.forEach((h) => {
            scene.hotspotContainer().createHotspot(makeInfoHotspot(h), {
              yaw: degToRad(h.yaw),
              pitch: degToRad(h.pitch * MARZIPANO.hotspotPitchSign),
            });
          });
        });

        if (built[0]) switchScene(built[0].data.id);
        if (!disposed) setReady(true);
      })
      .catch(() => {
        if (!disposed) setError(true);
      });

    return () => {
      disposed = true;
      switchRef.current = () => {};
      try {
        viewerRef.current?.destroy?.();
      } catch {
        /* noop */
      }
      viewerRef.current = null;
    };
  }, [tour]);

  return (
    <div className="unit-tour">
      <div ref={panoRef} className="unit-tour__pano" />

      {!ready && (
        <div className="unit-tour__status">
          {error ? "No se pudo cargar el recorrido" : "Cargando recorrido…"}
        </div>
      )}

      {ready && tour.scenes.length > 1 && (
        <div className="unit-tour__scenes">
          {tour.scenes.map((s) => (
            <button
              key={s.id}
              className={`unit-tour__scene ${
                s.id === activeSceneId ? "is-active" : ""
              }`}
              onClick={() => switchRef.current(s.id)}
            >
              {s.name ?? s.id}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Constructores de hotspots (elementos DOM que Marzipano posiciona) ---

function makeLinkHotspot(
  hotspot: LinkHotspot,
  onJump: (id: string) => void,
): HTMLElement {
  const el = document.createElement("div");
  el.className = "hotspot link-hotspot";
  el.innerHTML = PIN_SVG;
  el.style.setProperty(
    "transform",
    `translate(-50%, -50%) rotate(${hotspot.rotation ?? 0}rad)`,
  );
  el.addEventListener("click", (e) => {
    e.stopPropagation();
    onJump(hotspot.target);
  });
  stopPropagation(el);
  return el;
}

function makeInfoHotspot(hotspot: InfoHotspot): HTMLElement {
  const el = document.createElement("div");
  el.className = "hotspot info-hotspot";

  const dot = document.createElement("div");
  dot.className = "info-hotspot__dot";
  dot.textContent = "i";

  const box = document.createElement("div");
  box.className = "info-hotspot__box";
  box.innerHTML = `<div class="info-hotspot__title"></div><div class="info-hotspot__text"></div>`;
  (box.querySelector(".info-hotspot__title") as HTMLElement).textContent =
    hotspot.title;
  (box.querySelector(".info-hotspot__text") as HTMLElement).textContent =
    hotspot.text;

  dot.addEventListener("click", (e) => {
    e.stopPropagation();
    el.classList.toggle("is-open");
  });

  el.appendChild(dot);
  el.appendChild(box);
  stopPropagation(el);
  return el;
}

function stopPropagation(el: HTMLElement) {
  ["pointerdown", "pointermove", "pointerup", "wheel", "touchstart"].forEach(
    (evt) => el.addEventListener(evt, (e) => e.stopPropagation()),
  );
}
