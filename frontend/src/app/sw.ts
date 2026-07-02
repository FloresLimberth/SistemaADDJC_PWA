import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import {
  Serwist,
  StaleWhileRevalidate,
  NetworkFirst,
  ExpirationPlugin,
  type RuntimeCaching,
} from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: WorkerGlobalScope & typeof globalThis;

// Estrategias de cache para paginas y datos visitados
const offlineCacheStrategies: RuntimeCaching[] = [
  // RSC prefetch (hover sobre links) - cache agresivo
  {
    matcher({ request, sameOrigin }) {
      return (
        sameOrigin &&
        request.headers.get("RSC") === "1" &&
        request.headers.get("Next-Router-Prefetch") === "1"
      );
    },
    handler: new StaleWhileRevalidate({
      cacheName: "pages-rsc-prefetch",
      plugins: [
        new ExpirationPlugin({
          maxEntries: 200,
          maxAgeSeconds: 24 * 60 * 60,
        }),
      ],
    }),
  },
  // RSC navegacion (click real) - datos de paginas visitadas
  {
    matcher({ request, sameOrigin }) {
      return sameOrigin && request.headers.get("RSC") === "1";
    },
    handler: new NetworkFirst({
      cacheName: "pages-rsc",
      networkTimeoutSeconds: 5,
      plugins: [
        new ExpirationPlugin({
          maxEntries: 200,
          maxAgeSeconds: 24 * 60 * 60,
        }),
      ],
    }),
  },
  // Paginas HTML - documentos visitados
  {
    matcher({ request, sameOrigin }) {
      return sameOrigin && request.destination === "document";
    },
    handler: new NetworkFirst({
      cacheName: "pages-html",
      networkTimeoutSeconds: 5,
      plugins: [
        new ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60,
        }),
      ],
    }),
  },
  // Assets estaticos (imagenes, fuentes, etc.)
  {
    matcher({ request, sameOrigin }) {
      return (
        sameOrigin &&
        (request.destination === "image" ||
          request.destination === "font" ||
          request.destination === "style" ||
          request.destination === "script")
      );
    },
    handler: new StaleWhileRevalidate({
      cacheName: "static-assets",
      plugins: [
        new ExpirationPlugin({
          maxEntries: 500,
          maxAgeSeconds: 7 * 24 * 60 * 60,
        }),
      ],
    }),
  },
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: offlineCacheStrategies,
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();
