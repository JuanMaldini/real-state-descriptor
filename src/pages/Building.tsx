import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useSite } from "../context/SiteContext";
import { findFloor } from "../lib/site";
import { prioritizeFloor } from "../lib/preload";
import FloorRail from "../components/FloorRail";
import UnitHotspots from "../components/UnitHotspots";
import Loader from "../components/Loader";
import { ROUTES } from "../config/config";
import { PageLoading } from "./Home";

// Pisos: floorplan del piso activo a pantalla completa, con las unidades como
// hotspots clickeables (→ Tour 360) y un rail delgado de pisos a la derecha.
// /pisos redirige al piso más alto.
export default function Building() {
  const site = useSite();
  const { floorId } = useParams();

  // Al entrar a un piso, subilo al frente de la cola de precarga.
  useEffect(() => {
    if (floorId) prioritizeFloor(floorId);
  }, [floorId]);

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
      <FloorplanImage src={floor.floorplanImage} label={floor.label}>
        {/* Hotspots: sólo cuando el plano cargó (bloquea la interacción). */}
        <UnitHotspots floor={floor} />
      </FloorplanImage>

      <FloorRail
        floors={site.floors}
        to={ROUTES.floor}
        selectedFloorId={floor.floorId}
      />
    </div>
  );
}

// Floorplan a pantalla completa con loader hasta que la imagen carga. El
// `key={src}` (en el <img>) reinicia el estado al cambiar de piso; el ref
// detecta imágenes ya cacheadas (precargadas) cuyo onLoad podría no dispararse.
// Mientras carga: plano oculto (opacity 0), loader visible y children (hotspots)
// sin renderizar → no se puede accionar hasta que termina.
function FloorplanImage({
  src,
  label,
  children,
}: {
  src: string;
  label: string;
  children?: React.ReactNode;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-[var(--muted-bg)]">
      <div className="relative">
        <img
          key={src}
          src={src}
          alt={`Plano ${label}`}
          className="block max-h-[calc(100dvh-var(--nav-h))] max-w-[calc(100vw-3rem)] object-contain"
          onLoad={() => setLoaded(true)}
          ref={(el) => {
            if (el && el.complete && el.naturalWidth > 0) setLoaded(true);
          }}
          style={{ opacity: loaded ? 1 : 0, transition: "opacity 200ms ease" }}
          draggable={false}
        />
        {loaded && children}
      </div>

      {/* Contexto del piso, sin robar espacio al plano. */}
      <div className="pointer-events-none absolute left-4 top-4 bg-[var(--bg)] px-3 py-2 u-border">
        <span className="u-label">{label}</span>
      </div>

      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader />
        </div>
      )}
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
