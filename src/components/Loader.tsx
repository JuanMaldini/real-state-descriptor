// Loader minimal: tres puntos rebotando (bouncing dots). Hereda color vía
// currentColor, así sirve sobre fondo claro (negro) o sobre el tour (blanco).
// `label` opcional para texto accesible / contexto.
export default function Loader({
  label,
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-4 ${className}`}
    >
      <span className="u-dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      {label ? (
        <span className="u-label text-[var(--muted)]">{label}</span>
      ) : null}
      <span className="sr-only">{label ?? "Cargando"}</span>
    </div>
  );
}
