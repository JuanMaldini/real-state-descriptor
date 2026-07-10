import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { Floor, Unit, UnitStatus } from "../types/site";
import { ROUTES } from "../config/config";

// Colores por estado comercial (excepción al b/n; el resto sigue brutalista).
const STATUS: Record<UnitStatus, { color: string; label: string }> = {
  disponible: { color: "#16a34a", label: "Disponible" },
  reservado: { color: "#d97706", label: "Reservado" },
  vendido: { color: "#dc2626", label: "Vendido" },
};

// Marcadores de unidades sobre el floorplan. Cada uno abre un mini-modal centrado
// con la info de la unidad (m², orientación, ambientes, nivel, estado) + CTA al
// tour 360. Desktop: hover abre / salir cierra. Móvil: tap abre / tocar fuera cierra.
export default function UnitHotspots({ floor }: { floor: Floor }) {
  const units = floor.units.filter((u) => u.hotspot);
  if (units.length === 0) return null;

  return (
    <>
      {units.map((unit) => (
        <Hotspot key={unit.unitId} floor={floor} unit={unit} />
      ))}
    </>
  );
}

function Hotspot({ floor, unit }: { floor: Floor; unit: Unit }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Cerrar al tocar/clickear fuera (móvil: "touch fuera cierra").
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const info = unit.info;
  const status = info?.status ? STATUS[info.status] : null;
  const nivel =
    floor.floorNumber === 0 ? "Planta Baja" : `Piso ${floor.floorNumber}`;

  return (
    <div
      ref={ref}
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{
        left: `${unit.hotspot!.x * 100}%`,
        top: `${unit.hotspot!.y * 100}%`,
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Marcador circular (doble de grande), coloreado por estado */}
      <button
        type="button"
        aria-label={unit.label}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="block h-8 w-8 rounded-full border-2 border-[var(--fg)] shadow transition-transform hover:scale-110"
        style={{ background: status?.color ?? "#ffffff" }}
      />

      {/* Mini-modal centrado sobre el botón */}
      {open && (
        <div
          role="dialog"
          aria-label={unit.label}
          className="absolute left-1/2 top-1/2 z-50 w-56 -translate-x-1/2 -translate-y-1/2 u-border text-left shadow-lg"
          style={{ background: "#ffffff", color: "#000000" }}
        >
          <div className="border-b border-[var(--line)] px-3 py-2">
            <div className="u-label">{unit.label}</div>
            {info?.typology ? (
              <div className="u-label text-[var(--muted)]">{info.typology}</div>
            ) : null}
          </div>

          <dl className="grid grid-cols-2 gap-x-3 gap-y-2 px-3 py-3 text-sm">
            {info?.areaM2 != null ? <Row k="m²" v={`${info.areaM2}`} /> : null}
            {info?.rooms != null ? <Row k="Ambientes" v={`${info.rooms}`} /> : null}
            {info?.orientation ? <Row k="Orientación" v={info.orientation} /> : null}
            <Row k="Nivel" v={nivel} />
            {status ? (
              <div className="col-span-2 flex items-center gap-2 pt-1">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ background: status.color }}
                />
                <span className="u-label">{status.label}</span>
              </div>
            ) : null}
          </dl>

          <Link
            to={ROUTES.tour(floor.floorId, unit.unitId)}
            className="block border-t border-[var(--line)] px-3 py-2 text-center u-label transition-opacity hover:opacity-80"
            style={{ background: "#000000", color: "#ffffff" }}
          >
            Ver recorrido 360
          </Link>
        </div>
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-col">
      <dt className="u-label text-[var(--muted)]">{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}
