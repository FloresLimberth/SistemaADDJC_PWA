'use server';

import { authFetch, getAuthToken } from './base';
import type {
  Recomendacion,
  RecomendacionesPaginadas,
  EstadisticasRecomendaciones,
  HistorialRecomendacion,
  FeedbackRechazo,
} from '../types/algoritmo.types';

// Parametros para listar recomendaciones
export interface FetchRecomendacionesParams {
  page?: number;
  limit?: number;
  estado?: string;
  atletaId?: string;
}

// Parametros para listar pendientes
export interface FetchPendientesParams {
  page?: number;
  limit?: number;
  prioridad?: string;
  atletaId?: string;
}

// Listar todas las recomendaciones con filtros
// Verificado: recomendaciones.controller.ts GET /recomendaciones
// Roles: COMITE_TECNICO, ENTRENADOR
export async function fetchRecomendaciones(
  params: FetchRecomendacionesParams = {}
): Promise<RecomendacionesPaginadas | null> {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.error('[fetchRecomendaciones] No autenticado');
      return null;
    }

    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.estado) searchParams.set('estado', params.estado);
    if (params.atletaId) searchParams.set('atletaId', params.atletaId);

    const queryString = searchParams.toString();
    const endpoint = `/recomendaciones${queryString ? `?${queryString}` : ''}`;

    const response = await authFetch(endpoint);

    if (!response.ok) {
      console.error('[fetchRecomendaciones] Error:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('[fetchRecomendaciones] Error:', error);
    return null;
  }
}

// Listar recomendaciones pendientes de revision
// Verificado: recomendaciones.controller.ts GET /recomendaciones/pendientes
// Roles: COMITE_TECNICO
export async function fetchRecomendacionesPendientes(
  params: FetchPendientesParams = {}
): Promise<RecomendacionesPaginadas | null> {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.error('[fetchRecomendacionesPendientes] No autenticado');
      return null;
    }

    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.prioridad) searchParams.set('prioridad', params.prioridad);
    if (params.atletaId) searchParams.set('atletaId', params.atletaId);

    const queryString = searchParams.toString();
    const endpoint = `/recomendaciones/pendientes${queryString ? `?${queryString}` : ''}`;

    const response = await authFetch(endpoint);

    if (!response.ok) {
      console.error('[fetchRecomendacionesPendientes] Error:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('[fetchRecomendacionesPendientes] Error:', error);
    return null;
  }
}

// Obtener detalle de una recomendacion
// Verificado: recomendaciones.controller.ts GET /recomendaciones/:id
// Roles: COMITE_TECNICO, ENTRENADOR
export async function fetchRecomendacion(
  id: string
): Promise<Recomendacion | null> {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.error('[fetchRecomendacion] No autenticado');
      return null;
    }

    const response = await authFetch(`/recomendaciones/${id}`);

    if (!response.ok) {
      console.error('[fetchRecomendacion] Error:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('[fetchRecomendacion] Error:', error);
    return null;
  }
}

// Obtener historial de una recomendacion (Audit Trail)
// Verificado: recomendaciones.controller.ts GET /recomendaciones/:id/historial
// Roles: COMITE_TECNICO
export async function fetchRecomendacionHistorial(
  id: string
): Promise<HistorialRecomendacion[] | null> {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.error('[fetchRecomendacionHistorial] No autenticado');
      return null;
    }

    const response = await authFetch(`/recomendaciones/${id}/historial`);

    if (!response.ok) {
      console.error('[fetchRecomendacionHistorial] Error:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('[fetchRecomendacionHistorial] Error:', error);
    return null;
  }
}

// Obtener estadisticas de recomendaciones
// Verificado: recomendaciones.controller.ts GET /recomendaciones/estadisticas
// Roles: COMITE_TECNICO
export async function fetchRecomendacionesEstadisticas(): Promise<EstadisticasRecomendaciones | null> {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.error('[fetchRecomendacionesEstadisticas] No autenticado');
      return null;
    }

    const response = await authFetch('/recomendaciones/estadisticas');

    if (!response.ok) {
      console.error('[fetchRecomendacionesEstadisticas] Error:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('[fetchRecomendacionesEstadisticas] Error:', error);
    return null;
  }
}

// Obtener feedback de rechazos
// Verificado: recomendaciones.controller.ts GET /recomendaciones/feedback
// Roles: COMITE_TECNICO
export async function fetchFeedbackRechazos(
  limit: number = 50
): Promise<FeedbackRechazo[] | null> {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.error('[fetchFeedbackRechazos] No autenticado');
      return null;
    }

    const response = await authFetch(`/recomendaciones/feedback?limit=${limit}`);

    if (!response.ok) {
      console.error('[fetchFeedbackRechazos] Error:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('[fetchFeedbackRechazos] Error:', error);
    return null;
  }
}
