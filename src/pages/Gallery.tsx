import { useSite } from "../context/SiteContext";
import { PageLoading } from "./Home";

// Galería: grilla de renders (renderGallery). Cada item muestra imagen, título
// y tags. Brutalista: borde 1px, sin sombras.
export default function Gallery() {
  const site = useSite();
  if (!site) return <PageLoading />;

  const items = site.renderGallery;

  return (
    <div className="mx-auto w-full max-w-[var(--content-max,1600px)] p-4 md:p-8">
      <h1 className="u-wordmark mb-6 text-2xl md:text-3xl">Galería</h1>

      {items.length === 0 ? (
        <p className="u-label text-[var(--muted)]">Sin renders todavía.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.id} className="u-border">
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
