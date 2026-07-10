import { NavLink } from "react-router-dom";
import type { Floor } from "../types/site";

// Sidebar de pisos, compartida por Building y Aerial. En desktop es una columna
// izquierda; en móvil, una fila con scroll horizontal arriba del contenido.
// Se muestran de arriba hacia abajo (piso más alto primero).
export default function FloorSidebar({
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
      className="shrink-0 md:u-border-b-0 md:border-r border-b border-[var(--line)] md:h-full overflow-auto"
      style={{ width: "100%", maxWidth: "100%" }}
      data-sidebar
    >
      <ul className="flex md:flex-col md:w-[var(--sidebar-w)]">
        {ordered.map((floor) => {
          const active = floor.floorId === selectedFloorId;
          return (
            <li key={floor.floorId} className="md:u-border-b md:border-r-0 border-r border-[var(--line)] last:border-0">
              <NavLink
                to={to(floor.floorId)}
                className={`block whitespace-nowrap px-5 py-4 u-label transition-colors ${
                  active
                    ? "bg-[var(--fg)] text-[var(--fg-inverse)]"
                    : "hover:bg-[var(--muted-bg)]"
                }`}
              >
                {floor.label}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
