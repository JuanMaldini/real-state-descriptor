import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// SPA mínima (sin SSR). Marzipano se sirve vendored desde public/build.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // Solo local: no exponer el dev server en la red (LAN).
    host: "localhost",
  },
});
