import { Link, Navigate, useParams } from "react-router-dom";
import { useSite } from "../context/SiteContext";
import { findFloor, findUnit } from "../lib/site";
import UnitTour from "../components/UnitTour/UnitTour";
import { ROUTES } from "../config/config";
import { PageLoading } from "./Home";

// Tour: visor 360 a pantalla completa (bajo el nav). Overlay con el piso/unidad
// y un enlace de vuelta al piso. El .unit-tour se posiciona absolute:inset-0
// dentro de este contenedor relativo.
export default function Tour() {
  const site = useSite();
  const { floorId, unitId } = useParams();

  if (!site) return <PageLoading />;
  if (!floorId || !unitId) return <Navigate to="/404" replace />;

  const floor = findFloor(site, floorId);
  const unit = findUnit(site, floorId, unitId);
  if (!floor || !unit) return <Navigate to="/404" replace />;

  return (
    <div
      className="relative overflow-hidden"
      style={{ height: "calc(100dvh - var(--nav-h))" }}
    >
      <UnitTour tour={unit.tour360} />

      {/* Overlay superior: contexto + volver */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-30 flex items-center justify-between gap-3 p-4">
        <div className="pointer-events-auto bg-[var(--bg)] px-3 py-2 u-border">
          <span className="u-label">
            {floor.label} — {unit.label}
          </span>
        </div>
        <Link
          to={ROUTES.floor(floor.floorId)}
          className="pointer-events-auto bg-[var(--bg)] px-3 py-2 u-label u-border transition-colors hover:bg-[var(--muted-bg)]"
        >
          ‹ Volver
        </Link>
      </div>
    </div>
  );
}
