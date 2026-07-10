import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSite } from "../context/SiteContext";
import { firstUnit } from "../lib/site";
import { CONTACT, HERO, MOTION, ROUTES, SITE } from "../config/config";

// Home: página única scrolleable. Hero navegable a pantalla completa, luego una
// sección de descripción y, al fondo, la galería de renders (antes página aparte).
// El nav "Galería" apunta a /#galeria; el efecto de abajo hace el scroll suave.
export default function Home() {
  const site = useSite();
  const location = useLocation();
  const [index, setIndex] = useState(0);
  // Lightbox de galería: URL de la imagen abierta, o null.
  const [lightbox, setLightbox] = useState<string | null>(null);

  // Cerrar el lightbox con Escape (además del click).
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setLightbox(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  // Scroll a la sección indicada por el hash (#info, #galeria), también al llegar
  // desde otra ruta. Depende de `site` para correr una vez cargados los datos.
  useEffect(() => {
    if (!location.hash) return;
    const el = document.querySelector(location.hash);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, [location.hash, site]);

  if (!site) return <PageLoading />;

  const images = site.building.heroRenders;
  const count = images.length;
  const go = (dir: 1 | -1) =>
    setIndex((i) => (count ? (i + dir + count) % count : 0));

  const first = firstUnit(site);
  const interioresTo = first
    ? ROUTES.tour(first.floor.floorId, first.unit.unitId)
    : ROUTES.building;

  const gallery = site.renderGallery;

  return (
    <>
      {/* HERO — pantalla completa */}
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
              to={ROUTES.building}
              className="u-label border border-[var(--fg-inverse)] px-5 py-3 transition-colors hover:bg-[var(--fg-inverse)] hover:text-[var(--bg-inverse)]"
            >
              {HERO.ctas.pisos}
            </Link>
          </div>
        </div>

        {/* Indicador de posición */}
        {count > 1 && (
          <div className="absolute right-6 top-6 z-20 u-label text-sm">
            {String(index + 1).padStart(2, "0")} /{" "}
            {String(count).padStart(2, "0")}
          </div>
        )}
      </section>

      {/* INFO / DESCRIPCIÓN — entre hero y galería */}
      <section
        id="info"
        className="flex min-h-[60dvh] items-center px-6 py-20 md:px-10"
        style={{ scrollMarginTop: "var(--nav-h)" }}
      >
        <div className="mx-auto w-full max-w-[var(--content-max,1600px)]">
          <h2 className="u-wordmark mb-6 text-2xl md:text-4xl">
            {site.building.name}
          </h2>
          <p className="max-w-2xl text-base leading-relaxed text-[var(--muted)] md:text-lg">
            {/* Placeholder: reemplazar por la descripción real del edificio. */}
            Espacios pensados para vivir y trabajar. Descubrí las plantas, los
            recorridos 360 y los renders del proyecto. Una propuesta sobria,
            luminosa y funcional en cada piso.
          </p>
        </div>
      </section>

      {/* GALERÍA — pantalla completa, al fondo */}
      <section
        id="galeria"
        className="min-h-[calc(100dvh-var(--nav-h))] bg-[var(--muted-bg)] px-4 py-12 md:px-8"
        style={{ scrollMarginTop: "var(--nav-h)" }}
      >
        <div className="mx-auto w-full max-w-[var(--content-max,1600px)]">
          <h2 className="u-wordmark mb-6 text-2xl md:text-3xl">Galería</h2>

          {gallery.length === 0 ? (
            <p className="u-label text-[var(--muted)]">Sin renders todavía.</p>
          ) : (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setLightbox(item.imageUrl)}
                    aria-label={`Ampliar ${item.title ?? item.id}`}
                    className="block w-full border border-[var(--line)] bg-[var(--bg)] text-left transition-colors hover:border-[var(--muted)]"
                  >
                    <div className="aspect-[4/3] bg-[var(--muted-bg)]">
                      <img
                        src={item.imageUrl}
                        alt={item.title ?? item.id}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    {(item.title || item.tags?.length) && (
                      <div className="flex items-center justify-between gap-3 border-t border-[var(--line)] px-3 py-2">
                        <span className="u-label">{item.title}</span>
                        {item.tags?.length ? (
                          <span className="u-label text-[var(--muted)]">
                            {item.tags.join(" · ")}
                          </span>
                        ) : null}
                      </div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* CONTACTO — sección al fondo del Home (antes página aparte). */}
      <section
        id="contacto"
        className="px-6 py-20 md:px-10"
        style={{ scrollMarginTop: "var(--nav-h)" }}
      >
        <div className="mx-auto w-full max-w-[900px]">
          <h2 className="u-wordmark mb-6 text-2xl md:text-3xl">Contacto</h2>

          <dl className="u-border">
            <ContactRow term="Proyecto" desc={SITE.name} />
            <ContactRow term="Dirección" desc={CONTACT.address} />
            <ContactRow
              term="Teléfono"
              desc={
                <a href={`tel:${CONTACT.phone.replace(/\s+/g, "")}`}>
                  {CONTACT.phone}
                </a>
              }
            />
            <ContactRow
              term="Email"
              desc={<a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>}
              last
            />
          </dl>

          {CONTACT.mapEmbedUrl ? (
            <div className="mt-6 u-border">
              <iframe
                title="Mapa"
                src={CONTACT.mapEmbedUrl}
                className="h-[380px] w-full"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="mt-6 flex h-[220px] items-center justify-center u-border bg-[var(--muted-bg)] u-label text-[var(--muted)]">
              Mapa (pendiente)
            </div>
          )}
        </div>
      </section>

      {/* Lightbox: imagen completa. Click en cualquier parte (imagen o fuera)
          cierra. Sin texto ni botones. */}
      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(0,0,0,0.9)] p-4"
        >
          <img
            src={lightbox}
            alt=""
            className="max-h-full max-w-full object-contain"
          />
        </div>
      )}
    </>
  );
}

// Fila de la lista de contacto (término + valor), reutilizada en la sección.
function ContactRow({
  term,
  desc,
  last,
}: {
  term: string;
  desc: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-1 px-4 py-4 sm:flex-row sm:items-baseline sm:gap-6 ${
        last ? "" : "u-border-b"
      }`}
    >
      <dt className="u-label w-32 shrink-0 text-[var(--muted)]">{term}</dt>
      <dd className="text-base">{desc}</dd>
    </div>
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
