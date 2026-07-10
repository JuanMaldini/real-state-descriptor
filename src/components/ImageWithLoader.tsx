import { useState } from "react";
import Loader from "./Loader";

// Imagen con loader (bouncing dots) hasta el onLoad. El contenedor padre debe ser
// `relative` y tener tamaño propio (el overlay usa inset-0). El ref detecta
// imágenes ya cacheadas (precargadas) cuyo onLoad podría no dispararse.
export default function ImageWithLoader({
  src,
  alt,
  className,
  loading,
}: {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <img
        src={src}
        alt={alt}
        className={className}
        loading={loading}
        onLoad={() => setLoaded(true)}
        ref={(el) => {
          if (el && el.complete && el.naturalWidth > 0) setLoaded(true);
        }}
        style={{ opacity: loaded ? 1 : 0, transition: "opacity 200ms ease" }}
        draggable={false}
      />
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader />
        </div>
      )}
    </>
  );
}
