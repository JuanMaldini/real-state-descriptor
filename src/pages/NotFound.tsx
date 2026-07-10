import { Link } from "react-router-dom";
import { ROUTES } from "../config/config";

export default function NotFound() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-6 text-center"
      style={{ height: "calc(100dvh - var(--nav-h))" }}
    >
      <h1 className="u-wordmark text-6xl">404</h1>
      <p className="u-label text-[var(--muted)]">Página no encontrada</p>
      <Link
        to={ROUTES.home}
        className="u-label u-border px-5 py-3 transition-colors hover:bg-[var(--fg)] hover:text-[var(--fg-inverse)]"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
