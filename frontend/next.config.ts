import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  // Cachear paginas automaticamente al navegar
  cacheOnNavigation: true,
  // No recargar automaticamente al volver online (preservar datos del usuario)
  reloadOnOnline: false,
});

export default withSerwist({
  // standalone genera una carpeta autocontenida para deployment en VM/Docker
  output: 'standalone',
});
