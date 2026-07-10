import { Link, NavLink } from "react-router-dom";
import { NAV_ITEMS, ROUTES, SITE } from "../config/config";

// NavBar minimal brutalista: wordmark a la izquierda, items inline a la derecha.
// Con pocos items (Home, Pisos) se muestran en todos los dispositivos; sin burger.
export default function NavBar() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg)] u-border-b"
      style={{ height: "var(--nav-h)" }}
    >
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        <Link to={ROUTES.home} className="u-wordmark text-lg leading-none">
          {SITE.wordmark}
        </Link>

        <nav className="flex items-center gap-6 md:gap-8">
          {NAV_ITEMS.map((item) => (
            <NavItemLink key={item.to} to={item.to} label={item.label} />
          ))}
        </nav>
      </div>
    </header>
  );
}

function NavItemLink({ to, label }: { to: string; label: string }) {
  // Enlaces con hash (secciones del Home, ej. #galeria) no tienen estado activo
  // por ruta: se renderizan como Link simple.
  if (to.includes("#")) {
    return (
      <Link
        to={to}
        className="u-label pb-1 border-b-2 border-transparent transition-colors hover:border-[var(--muted)]"
      >
        {label}
      </Link>
    );
  }
  return (
    <NavLink
      to={to}
      end={to === ROUTES.home}
      className={({ isActive }) =>
        `u-label pb-1 border-b-2 transition-colors ${
          isActive ? "border-[var(--fg)]" : "border-transparent hover:border-[var(--muted)]"
        }`
      }
    >
      {label}
    </NavLink>
  );
}
