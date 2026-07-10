import { Navigate, Route, Routes } from "react-router-dom";
import { SiteProvider } from "./context/SiteContext";
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import Building from "./pages/Building";
import Tour from "./pages/Tour";
import NotFound from "./pages/NotFound";
import { ROUTES } from "./config/config";

// Router raíz. Envuelve todo en SiteProvider (carga el JSON único una vez) y en
// Layout (NavBar + main). La ruta del tour es full-screen: usa el mismo Layout
// pero su contenido ocupa todo el alto disponible.
export default function App() {
  return (
    <SiteProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path={ROUTES.home} element={<Home />} />
          <Route path={ROUTES.building} element={<Building />} />
          <Route path="/pisos/:floorId" element={<Building />} />
          <Route path="/tour/:floorId/:unitId" element={<Tour />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
      </Routes>
    </SiteProvider>
  );
}
