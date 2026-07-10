// Marzipano se carga como script vendored (public/build/marzipano.js) y se
// expone en window.Marzipano. No hay tipos oficiales prácticos para el uso que
// hacemos; lo declaramos como `any` acotado a la superficie que tocamos.
declare global {
  interface Window {
    Marzipano?: any;
  }
}

export {};
