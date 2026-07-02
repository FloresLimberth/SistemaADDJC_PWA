'use client';

import { useEffect, useState } from 'react';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      // Recargar automaticamente cuando vuelve la conexion
      window.location.reload();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1e3a5f"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto"
          >
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
            <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
            <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
            <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
            <line x1="12" y1="20" x2="12.01" y2="20" />
          </svg>
        </div>
        <h1 className="mb-3 text-2xl font-bold text-gray-900">
          Sin conexion a internet
        </h1>
        <p className="mb-2 text-gray-600">
          No se pudo cargar esta pagina porque no hay conexion a internet.
        </p>
        <p className="mb-6 text-sm text-gray-500">
          Las paginas que visitaste anteriormente pueden estar disponibles.
          Intenta navegar a una seccion que ya hayas visitado.
        </p>
        {isOnline ? (
          <p className="text-green-600 font-medium">
            Conexion restaurada. Recargando...
          </p>
        ) : (
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-[#1e3a5f] px-6 py-3 text-white font-medium hover:bg-[#2a4a6f] transition-colors"
          >
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
}
