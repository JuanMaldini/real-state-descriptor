import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Volume2, VolumeX } from "lucide-react";
import { useSite } from "../context/SiteContext";
import { firstUnit } from "../lib/site";
import { CONTACT, HERO, ROUTES, SITE } from "../config/config";
import Loader from "../components/Loader";
import ImageWithLoader from "../components/ImageWithLoader";
import { startPreload } from "../lib/preload";

// Home: página única scrolleable. Hero navegable a pantalla completa, luego una
// sección de descripción y, al fondo, la galería de renders (antes página aparte).
// El nav "Galería" apunta a /#galeria; el efecto de abajo hace el scroll suave.
export default function Home() {
  const site = useSite();
  const location = useLocation();
  // Lightbox de galería: URL de la imagen abierta, o null.
  const [lightbox, setLightbox] = useState<string | null>(null);
  // El autoplay con sonido es bloqueado por los navegadores en la primera visita.
  const [videoMuted, setVideoMuted] = useState(true);

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

  // Con el sitio cargado, arranca la precarga en background del resto de assets.
  useEffect(() => {
    if (site) startPreload(site);
  }, [site]);

  if (!site) return <PageLoading />;

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
        {site.building.heroVideo ? (
          <video
            src={site.building.heroVideo}
            className="absolute inset-0 h-full w-full object-cover object-top"
            autoPlay
            loop
            muted={videoMuted}
            playsInline
            aria-label={site.building.name}
            onCanPlay={(event) => {
              event.currentTarget.play().catch(() => undefined);
            }}
          />
        ) : null}

        {site.building.heroVideo ? (
          <button
            type="button"
            onClick={() => setVideoMuted((muted) => !muted)}
            aria-label={videoMuted ? "Activar sonido" : "Silenciar"}
            title={videoMuted ? "Activar sonido" : "Silenciar"}
            className="group absolute bottom-6 right-6 z-30 flex h-10 w-10 items-center justify-center u-border bg-white transition-colors hover:bg-black"
          >
            {videoMuted ? (
              <VolumeX size={18} className="text-black group-hover:text-white" />
            ) : (
              <Volume2 size={18} className="text-black group-hover:text-white" />
            )}
          </button>
        ) : null}

        {/* Título + CTAs */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col gap-6 p-6 md:p-10">
          <h1 className="u-wordmark text-3xl md:text-5xl leading-none">
            {site.building.name}
          </h1>
          <div className="pointer-events-auto flex flex-wrap gap-3">
            <Link
              to={interioresTo}
              className="u-label border px-5 py-3 transition-opacity hover:opacity-80"
              style={{ background: "#ffffff", color: "#000000", borderColor: "#000000" }}
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

      {/* GALERÍA — full-bleed, al fondo. Máx 2 por fila (desktop), 1 en tablet/móvil. */}
      <section
        id="galeria"
        className="bg-[var(--muted-bg)]"
        style={{ scrollMarginTop: "var(--nav-h)" }}
      >
        <h2 className="u-wordmark px-4 py-8 text-2xl md:px-8 md:text-3xl">
          Galería
        </h2>

        {gallery.length === 0 ? (
          <p className="u-label px-4 pb-12 text-[var(--muted)] md:px-8">
            Sin renders todavía.
          </p>
        ) : (
          <ul className="grid grid-cols-1 lg:grid-cols-2">
            {gallery.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setLightbox(item.imageUrl)}
                  aria-label={`Ampliar ${item.title ?? item.id}`}
                  className="group relative block w-full overflow-hidden"
                >
                  <div className="relative aspect-[3/2] bg-[var(--muted-bg)]">
                    <ImageWithLoader
                      src={item.imageUrl}
                      alt={item.title ?? item.id}
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
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
      className="flex items-center justify-center"
      style={{ height: "calc(100dvh - var(--nav-h))" }}
    >
      <Loader />
    </div>
  );
}
