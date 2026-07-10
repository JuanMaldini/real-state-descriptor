import { MARZIPANO } from "../../config/config";

// Carga el script vendored de Marzipano una sola vez y resuelve cuando
// window.Marzipano está disponible.
let promise: Promise<any> | null = null;

export function loadMarzipano(): Promise<any> {
  if (window.Marzipano) return Promise.resolve(window.Marzipano);
  if (promise) return promise;

  promise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-marzipano="core"]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(window.Marzipano), {
        once: true,
      });
      existing.addEventListener("error", reject, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = MARZIPANO.scriptSrc;
    script.async = true;
    script.dataset.marzipano = "core";
    script.addEventListener("load", () => resolve(window.Marzipano), {
      once: true,
    });
    script.addEventListener("error", reject, { once: true });
    document.head.appendChild(script);
  });

  return promise;
}
