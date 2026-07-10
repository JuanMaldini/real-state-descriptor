import { NavLink } from "react-router-dom";
import type { Floor } from "../types/site";

// Rail de pisos: columna delgada fija a la derecha, siempre visible y scrolleable.
// Muestra sólo un identificador corto por piso ("PB", "1", "2"...) para cambiar
// de planta sin robar ancho al floorplan. Usada por Building (Pisos).
// Orden: piso más alto arriba. Responsivo: mismo ancho en móvil y desktop.
export default function FloorRail({
  floors,
  to,
  selectedFloorId,
}: {
  floors: Floor[];
  to: (floorId: string) => string;
  selectedFloorId?: string;
}) {
  const ordered = [...floors].sort((a, b) => b.floorNumber - a.floorNumber);

  return (
    <nav
      aria-label="Pisos"
      data-floor-rail
      className="shrink-0 w-11 md:w-12 overflow-y-auto border-l border-[var(--line)] bg-[var(--bg)]"
    >
      <ul className="flex flex-col">
        {ordered.map((floor) => {
          const active = floor.floorId === selectedFloorId;
          const short = floor.floorNumber === 0 ? "PB" : String(floor.floorNumber);
          return (
            <li
              key={floor.floorId}
              className="border-b border-[var(--line)] last:border-b-0"
            >
              <NavLink
                to={to(floor.floorId)}
                title={floor.label}
                aria-label={floor.label}
                className={`flex items-center justify-center py-4 u-label transition-colors ${
                  active ? "" : "hover:bg-[var(--muted-bg)]"
                }`}
                style={
                  active ? { background: "#000000", color: "#ffffff" } : undefined
                }
              >
                {short}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
