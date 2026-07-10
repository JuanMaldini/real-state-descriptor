import { Link } from "react-router-dom";
import type { Floor } from "../types/site";
import { ROUTES } from "../config/config";

// Marcadores clickeables de las unidades sobre el floorplan. Se posicionan en
// coordenadas relativas (0..1) respecto de la imagen, por lo que el contenedor
// padre debe envolver AJUSTADO a la imagen (mismo alto/ancho) y ser `relative`.
// Fase 1: hover = mini-tooltip con el label. Click = Tour 360.
// Fase 2 (pendiente): el tooltip crece a mini-modal con render + info.
export default function UnitHotspots({ floor }: { floor: Floor }) {
  const units = floor.units.filter((u) => u.hotspot);
  if (units.length === 0) return null;

  return (
    <>
      {units.map((unit) => (
        <Link
          key={unit.unitId}
          to={ROUTES.tour(floor.floorId, unit.unitId)}
          aria-label={`${unit.label} — Tour 360`}
          className="group absolute -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${unit.hotspot!.x * 100}%`,
            top: `${unit.hotspot!.y * 100}%`,
          }}
        >
          {/* Marcador */}
          <span className="block h-4 w-4 rounded-full border-2 border-[var(--fg)] bg-[var(--bg)] shadow transition-transform group-hover:scale-125" />

          {/* Tooltip hint */}
          <span className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap bg-[var(--fg)] px-2 py-1 u-label text-[var(--fg-inverse)] opacity-0 transition-opacity group-hover:opacity-100">
            {unit.label}
          </span>
        </Link>
      ))}
    </>
  );
}
