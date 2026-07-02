'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  // Crear instancia de QueryClient solo una vez
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Los datos son frescos durante 1 minuto
            staleTime: 60 * 1000,
            // Los datos en cache duran 5 minutos
            gcTime: 5 * 60 * 1000,
            // No refrescar automaticamente al cambiar de ventana
            refetchOnWindowFocus: false,
            // Reintentar solo 1 vez en caso de error
            retry: 1,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
