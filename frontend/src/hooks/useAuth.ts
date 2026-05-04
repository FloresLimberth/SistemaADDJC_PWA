'use client';

import { useEffect, useState } from 'react';
import { getCurrentUserAction } from '@/app/actions/auth.actions';
import type { Usuario } from '@/types/auth';

interface UseAuthReturn {
  user: Usuario | null;
  isLoading: boolean;
  error: string | null;
}

// Hook para obtener el usuario actual en Client Components
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const result = await getCurrentUserAction();

        if (result.success && result.user) {
          setUser(result.user);
        } else {
          setError(result.error || 'Error al obtener usuario');
        }
      } catch (err) {
        console.error('Error en useAuth:', err);
        setError('Error inesperado');
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  return { user, isLoading, error };
}
