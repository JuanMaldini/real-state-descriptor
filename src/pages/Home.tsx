import { useState } from "react";
import { Link } from "react-router-dom";
import { useSite } from "../context/SiteContext";
import { firstUnit } from "../lib/site";
import { HERO, MOTION, ROUTES } from "../config/config";

// Home: hero navegable a pantalla completa (bajo el nav). Crossfade entre los
// heroRenders del edificio; zonas laterales clickeables prev/next; dos CTAs:
// Interiores (→ primer unit tour) y Aerial.
export default function Home() {
  const site = useSite();
  const [index, setIndex] = useState(0);

  if (!site) return <PageLoading />;

  const images = site.building.heroRenders;
  const count = images.length;
  const go = (dir: 1 | -1) =>
    setIndex((i) => (count ? (i + dir + count) % count : 0));

  const first = firstUnit(site);
  const interioresTo = first
    ? ROUTES.tour(first.floor.floorId, first.unit.unitId)
    : ROUTES.building;

  return (
    <section
      className="relative overflow-hidden bg-[var(--bg-inverse)] text-[var(--fg-inverse)]"
      style={{ height: "calc(100dvh - var(--nav-h))" }}
    >
      {/* Capas de imagen con crossfade */}
      {images.map((img, i) => (
        <img
          key={img.id}
          src={img.imageUrl}
          alt={img.caption ?? site.building.name}
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            opacity: i === index ? 1 : 0,
            transition: `opacity ${MOTION.heroFadeMs}ms ease`,
          }}
          draggable={false}
        />
      ))}

      {/* Zonas laterales prev/next */}
      {count > 1 && (
        <>
          <button
            aria-label="Anterior"
            onClick={() => go(-1)}
            className="group absolute left-0 top-0 bottom-0 z-10 flex items-center justify-start pl-4"
            style={{ width: `${HERO.navZoneWidthPct}%` }}
          >
            <span className="u-label text-2xl opacity-60 transition-opacity group-hover:opacity-100">
              ‹
            </span>
          </button>
          <button
            aria-label="Siguiente"
            onClick={() => go(1)}
            className="group absolute right-0 top-0 bottom-0 z-10 flex items-center justify-end pr-4"
            style={{ width: `${HERO.navZoneWidthPct}%` }}
          >
            <span className="u-label text-2xl opacity-60 transition-opacity group-hover:opacity-100">
              ›
            </span>
          </button>
        </>
      )}

      {/* Título + CTAs */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col gap-6 p-6 md:p-10">
        <h1 className="u-wordmark text-3xl md:text-5xl leading-none">
          {site.building.name}
        </h1>
        <div className="pointer-events-auto flex flex-wrap gap-3">
          <Link
            to={interioresTo}
            className="u-label border border-[var(--fg-inverse)] bg-[var(--fg-inverse)] px-5 py-3 text-[var(--bg-inverse)] transition-opacity hover:opacity-80"
          >
            {HERO.ctas.interiores}
          </Link>
          <Link
            to={ROUTES.aerial}
            className="u-label border border-[var(--fg-inverse)] px-5 py-3 transition-colors hover:bg-[var(--fg-inverse)] hover:text-[var(--bg-inverse)]"
          >
            {HERO.ctas.aerial}
          </Link>
        </div>
      </div>

      {/* Indicador de posición */}
      {count > 1 && (
        <div className="absolute right-6 top-6 z-20 u-label text-sm">
          {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
        </div>
      )}
    </section>
  );
}

export function PageLoading() {
  return (
    <div
      className="flex items-center justify-center u-label"
      style={{ height: "calc(100dvh - var(--nav-h))" }}
    >
      Cargando…
    </div>
  );
}
