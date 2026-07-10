import { Navigate, useParams } from "react-router-dom";
import { useSite } from "../context/SiteContext";
import { findFloor } from "../lib/site";
import FloorRail from "../components/FloorRail";
import UnitHotspots from "../components/UnitHotspots";
import { ROUTES } from "../config/config";
import { PageLoading } from "./Home";

// Pisos: floorplan del piso activo a pantalla completa, con las unidades como
// hotspots clickeables (→ Tour 360) y un rail delgado de pisos a la derecha.
// /pisos redirige al piso más alto.
export default function Building() {
  const site = useSite();
  const { floorId } = useParams();

  if (!site) return <PageLoading />;

  // Sin floorId: ir al piso más alto (orden del rail).
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
      className="flex"
      style={{ height: "calc(100dvh - var(--nav-h))" }}
    >
      <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-[var(--muted-bg)]">
        {/* Wrapper ajustado a la imagen: los hotspots se posicionan respecto de él. */}
        <div className="relative">
          <img
            src={floor.floorplanImage}
            alt={`Plano ${floor.label}`}
            className="block max-h-[calc(100dvh-var(--nav-h))] max-w-[calc(100vw-3rem)] object-contain"
          />
          <UnitHotspots floor={floor} />
        </div>

        {/* Contexto del piso, sin robar espacio al plano. */}
        <div className="pointer-events-none absolute left-4 top-4 bg-[var(--bg)] px-3 py-2 u-border">
          <span className="u-label">{floor.label}</span>
        </div>
      </div>

      <FloorRail
        floors={site.floors}
        to={ROUTES.floor}
        selectedFloorId={floor.floorId}
      />
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
