'use server';

import { authFetch, getAuthToken } from './base';
import type {
  AnalisisRendimiento,
  RecomendacionesSimplificadas,
} from '../types/algoritmo.types';

// Obtener analisis completo de rendimiento de un atleta
// Verificado: analisis-rendimiento.controller.ts GET /algoritmo/analisis/:atletaId
// Query: dias (default 30)
// Roles: COMITE_TECNICO, ENTRENADOR, ADMINISTRADOR
export async function fetchAnalisisRendimiento(
  atletaId: string,
  dias: number = 30
): Promise<AnalisisRendimiento | null> {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.error('[fetchAnalisisRendimiento] No autenticado');
      return null;
    }

    const response = await authFetch(
      `/algoritmo/analisis/${atletaId}?dias=${dias}`
    );

    if (!response.ok) {
      console.error('[fetchAnalisisRendimiento] Error:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('[fetchAnalisisRendimiento] Error:', error);
    return null;
  }
}

// Obtener mi analisis de rendimiento (solo ATLETA)
// Verificado: analisis-rendimiento.controller.ts GET /algoritmo/analisis/mi-analisis
// El backend resuelve el atletaId a partir del userId del token JWT
// Roles: ATLETA
export async function fetchMiAnalisis(
  dias: number = 30
): Promise<AnalisisRendimiento | null> {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.error('[fetchMiAnalisis] No autenticado');
      return null;
    }

    const response = await authFetch(
      `/algoritmo/analisis/mi-analisis?dias=${dias}`
    );

    if (!response.ok) {
      console.error('[fetchMiAnalisis] Error:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('[fetchMiAnalisis] Error:', error);
    return null;
  }
}

// Obtener solo las recomendaciones de un atleta (version simplificada)
// Verificado: analisis-rendimiento.controller.ts GET /algoritmo/analisis/:atletaId/recomendaciones
// Query: dias (default 30)
// Roles: COMITE_TECNICO, ENTRENADOR, ADMINISTRADOR
export async function fetchAnalisisRecomendaciones(
  atletaId: string,
  dias: number = 30
): Promise<RecomendacionesSimplificadas | null> {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.error('[fetchAnalisisRecomendaciones] No autenticado');
      return null;
    }

    const response = await authFetch(
      `/algoritmo/analisis/${atletaId}/recomendaciones?dias=${dias}`
    );

    if (!response.ok) {
      console.error('[fetchAnalisisRecomendaciones] Error:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('[fetchAnalisisRecomendaciones] Error:', error);
    return null;
  }
}
