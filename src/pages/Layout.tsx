import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar";

// Layout raíz: NavBar fija arriba + main. El main reserva el alto del nav con
// padding-top (border-box), de modo que un hijo con height:calc(100dvh - nav-h)
// llena exactamente el viewport visible (hero, tour, building a pantalla).
export default function Layout() {
  return (
    <div className="min-h-full">
      <NavBar />
      <main
        style={{ paddingTop: "var(--nav-h)", minHeight: "100dvh" }}
        className="bg-[var(--bg)]"
      >
        <Outlet />
      </main>
    </div>
  );
}
