import { Link, Navigate, useParams } from "react-router-dom";
import { useSite } from "../context/SiteContext";
import { findFloor } from "../lib/site";
import FloorSidebar from "../components/FloorSidebar";
import { ROUTES } from "../config/config";
import { PageLoading } from "./Home";

// Pisos: sidebar de pisos + floorplan del piso activo + grilla de unidades.
// /pisos redirige al piso más alto. Cada unidad enlaza a su tour 360.
export default function Building() {
  const site = useSite();
  const { floorId } = useParams();

  if (!site) return <PageLoading />;

  // Sin floorId: ir al piso más alto (orden de la sidebar).
  if (!floorId) {
    const top = [...site.floors].sort(
      (a, b) => b.floorNumber - a.floorNumber,
    )[0];
    if (!top) return <EmptyState label="Sin pisos cargados." />;
    return <Navigate to={ROUTES.floor(top.floorId)} replace />;
  }

  const floor = findFloor(site, floorId);
  if (!floor) return <Navigate to="/404" replace />;

  return (
    <div
      className="flex flex-col md:flex-row"
      style={{ minHeight: "calc(100dvh - var(--nav-h))" }}
    >
      <FloorSidebar
        floors={site.floors}
        to={ROUTES.floor}
        selectedFloorId={floor.floorId}
      />

      <div className="flex-1 p-4 md:p-8">
        <h1 className="u-wordmark mb-6 text-2xl md:text-3xl">{floor.label}</h1>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Floorplan */}
          <div className="u-border">
            <img
              src={floor.floorplanImage}
              alt={`Plano ${floor.label}`}
              className="w-full object-contain"
            />
          </div>

          {/* Unidades */}
          <div>
            <h2 className="u-label mb-3 text-[var(--muted)]">Unidades</h2>
            {floor.units.length === 0 ? (
              <p className="u-label text-[var(--muted)]">
                Sin unidades en este piso.
              </p>
            ) : (
              <ul className="flex flex-col">
                {floor.units.map((unit) => (
                  <li key={unit.unitId}>
                    <Link
                      to={ROUTES.tour(floor.floorId, unit.unitId)}
                      className="flex items-center justify-between gap-3 u-border-b py-4 u-label transition-colors hover:bg-[var(--muted-bg)]"
                    >
                      <span>{unit.label}</span>
                      <span aria-hidden className="text-[var(--muted)]">
                        Tour 360 ›
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div
      className="flex items-center justify-center u-label text-[var(--muted)]"
      style={{ height: "calc(100dvh - var(--nav-h))" }}
    >
      {label}
    </div>
  );
}
