import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { LAYOUT, NAV_ITEMS, ROUTES, SITE } from "../config/config";
import { useMediaQuery } from "../hooks/useMediaQuery";

// NavBar minimal brutalista: wordmark a la izquierda. En desktop (>= navInlineMinPx)
// los items van inline; en tablet/móvil, burger con panel desplegable.
export default function NavBar() {
  const inline = useMediaQuery(`(min-width: ${LAYOUT.navInlineMinPx}px)`);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Cerrar el panel al navegar.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Si pasamos a desktop, no dejar el panel abierto.
  useEffect(() => {
    if (inline) setOpen(false);
  }, [inline]);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg)] u-border-b"
      style={{ height: "var(--nav-h)" }}
    >
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        <Link to={ROUTES.home} className="u-wordmark text-lg leading-none">
          {SITE.wordmark}
        </Link>

        {inline ? (
          <nav className="flex items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <NavItemLink key={item.to} to={item.to} label={item.label} />
            ))}
          </nav>
        ) : (
          <button
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex flex-col justify-center gap-[5px] w-9 h-9 -mr-1"
          >
            <span
              className="block h-[2px] bg-[var(--fg)] transition-transform"
              style={{
                transitionDuration: "var(--motion-panel)",
                transform: open ? "translateY(7px) rotate(45deg)" : "none",
              }}
            />
            <span
              className="block h-[2px] bg-[var(--fg)] transition-opacity"
              style={{
                transitionDuration: "var(--motion-ui)",
                opacity: open ? 0 : 1,
              }}
            />
            <span
              className="block h-[2px] bg-[var(--fg)] transition-transform"
              style={{
                transitionDuration: "var(--motion-panel)",
                transform: open ? "translateY(-7px) rotate(-45deg)" : "none",
              }}
            />
          </button>
        )}
      </div>

      {/* Panel burger (tablet/móvil) */}
      {!inline && open && (
        <nav
          className="absolute left-0 right-0 bg-[var(--bg)] u-border-b flex flex-col"
          style={{ top: "var(--nav-h)" }}
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === ROUTES.home}
              className={({ isActive }) =>
                `u-label py-4 px-6 u-border-b last:border-b-0 ${
                  isActive ? "bg-[var(--fg)] text-[var(--fg-inverse)]" : ""
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}

function NavItemLink({ to, label }: { to: string; label: string }) {
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
