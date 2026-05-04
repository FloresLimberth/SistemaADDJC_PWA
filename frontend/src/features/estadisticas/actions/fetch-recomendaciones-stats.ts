'use server';

import { authFetch } from '@/features/comite-tecnico/actions/base';
import type { EstadisticasRecomendaciones } from '@/features/algoritmo/types/algoritmo.types';

// Re-exportar el tipo para uso en componentes
export type { EstadisticasRecomendaciones };

// Obtener estadisticas de recomendaciones del sistema
export async function fetchRecomendacionesStats(): Promise<EstadisticasRecomendaciones | null> {
  try {
    const response = await authFetch('/recomendaciones/estadisticas');

    if (!response.ok) {
      console.error('[fetchRecomendacionesStats] Error:', response.status);
      return null;
    }

    const data = await response.json();
    return data as EstadisticasRecomendaciones;
  } catch (error) {
    console.error('[fetchRecomendacionesStats] Error:', error);
    return null;
  }
}
