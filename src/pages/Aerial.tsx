import { Navigate, useParams } from "react-router-dom";
import { useSite } from "../context/SiteContext";
import { findFloor } from "../lib/site";
import FloorSidebar from "../components/FloorSidebar";
import { ROUTES } from "../config/config";
import { PageLoading } from "./Home";

// Aerial: vista de plano a gran tamaño por piso, con la sidebar de pisos.
// /aerial redirige al piso más alto. (Floorplan clickeable: FLAGS pendiente.)
export default function Aerial() {
  const site = useSite();
  const { floorId } = useParams();

  if (!site) return <PageLoading />;

  if (!floorId) {
    const top = [...site.floors].sort(
      (a, b) => b.floorNumber - a.floorNumber,
    )[0];
    if (!top) return <Navigate to="/404" replace />;
    return <Navigate to={ROUTES.aerialFloor(top.floorId)} replace />;
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
        to={ROUTES.aerialFloor}
        selectedFloorId={floor.floorId}
      />

      <div className="flex flex-1 flex-col p-4 md:p-8">
        <h1 className="u-wordmark mb-6 text-2xl md:text-3xl">
          Aerial — {floor.label}
        </h1>
        <div className="flex flex-1 items-center justify-center u-border bg-[var(--muted-bg)]">
          <img
            src={floor.floorplanImage}
            alt={`Aerial ${floor.label}`}
            className="max-h-[70dvh] w-auto object-contain"
          />
        </div>
      </div>
    </div>
  );
}
