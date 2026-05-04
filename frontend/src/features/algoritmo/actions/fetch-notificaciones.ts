'use server';

import { authFetch, getAuthToken } from './base';
import type {
  NotificacionAlgoritmo,
  NotificacionesPaginadas,
  ResumenNotificaciones,
  AlertasPaginadas,
  AlertaAtleta,
  CentroNotificacionesTotal,
} from '../types/algoritmo.types';

// Parametros para listar notificaciones
export interface FetchNotificacionesParams {
  soloNoLeidas?: boolean;
  page?: number;
  limit?: number;
}

// Obtener notificaciones del usuario actual
// Verificado: notificaciones.controller.ts GET /notificaciones
// Roles: todos
export async function fetchNotificaciones(
  params: FetchNotificacionesParams = {}
): Promise<NotificacionesPaginadas | null> {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.error('[fetchNotificaciones] No autenticado');
      return null;
    }

    const searchParams = new URLSearchParams();
    if (params.soloNoLeidas) searchParams.set('soloNoLeidas', 'true');
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());

    const queryString = searchParams.toString();
    const endpoint = `/notificaciones${queryString ? `?${queryString}` : ''}`;

    const response = await authFetch(endpoint);

    if (!response.ok) {
      console.error('[fetchNotificaciones] Error:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('[fetchNotificaciones] Error:', error);
    return null;
  }
}

// Contar notificaciones no leidas
// Verificado: notificaciones.controller.ts GET /notificaciones/no-leidas/count
// Respuesta: { noLeidas: number }
// Roles: todos
export async function fetchNotificacionesNoLeidasCount(): Promise<number> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return 0;
    }

    const response = await authFetch('/notificaciones/no-leidas/count');

    if (!response.ok) {
      console.error('[fetchNotificacionesNoLeidasCount] Error:', response.status);
      return 0;
    }

    const data = await response.json();
    return data.noLeidas ?? 0;
  } catch (error) {
    console.error('[fetchNotificacionesNoLeidasCount] Error:', error);
    return 0;
  }
}

// Obtener una notificacion por ID
// Verificado: notificaciones.controller.ts GET /notificaciones/:id
// Roles: todos
export async function fetchNotificacion(
  id: string
): Promise<NotificacionAlgoritmo | null> {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.error('[fetchNotificacion] No autenticado');
      return null;
    }

    const response = await authFetch(`/notificaciones/${id}`);

    if (!response.ok) {
      console.error('[fetchNotificacion] Error:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('[fetchNotificacion] Error:', error);
    return null;
  }
}

// Obtener resumen de notificaciones y alertas
// Verificado: notificaciones.controller.ts GET /notificaciones/resumen/general
// Roles: todos
export async function fetchResumenNotificaciones(): Promise<ResumenNotificaciones | null> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return null;
    }

    const response = await authFetch('/notificaciones/resumen/general');

    if (!response.ok) {
      console.error('[fetchResumenNotificaciones] Error:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('[fetchResumenNotificaciones] Error:', error);
    return null;
  }
}

// Parametros para listar alertas
export interface FetchAlertasParams {
  soloNoLeidas?: boolean;
  page?: number;
  limit?: number;
}

// Obtener alertas del usuario actual
// Verificado: notificaciones.controller.ts GET /notificaciones/alertas/mis-alertas
// Roles: COMITE_TECNICO, ENTRENADOR
export async function fetchMisAlertas(
  params: FetchAlertasParams = {}
): Promise<AlertasPaginadas | null> {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.error('[fetchMisAlertas] No autenticado');
      return null;
    }

    const searchParams = new URLSearchParams();
    if (params.soloNoLeidas) searchParams.set('soloNoLeidas', 'true');
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());

    const queryString = searchParams.toString();
    const endpoint = `/notificaciones/alertas/mis-alertas${queryString ? `?${queryString}` : ''}`;

    const response = await authFetch(endpoint);

    if (!response.ok) {
      console.error('[fetchMisAlertas] Error:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('[fetchMisAlertas] Error:', error);
    return null;
  }
}

// Contar alertas no leidas
// Verificado: notificaciones.controller.ts GET /notificaciones/alertas/no-leidas/count
// Respuesta: { noLeidas: number }
// Roles: COMITE_TECNICO, ENTRENADOR
export async function fetchAlertasNoLeidasCount(): Promise<number> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return 0;
    }

    const response = await authFetch('/notificaciones/alertas/no-leidas/count');

    if (!response.ok) {
      console.error('[fetchAlertasNoLeidasCount] Error:', response.status);
      return 0;
    }

    const data = await response.json();
    return data.noLeidas ?? 0;
  } catch (error) {
    console.error('[fetchAlertasNoLeidasCount] Error:', error);
    return 0;
  }
}

// Obtener alertas de un atleta
// Verificado: notificaciones.controller.ts GET /notificaciones/alertas/atleta/:atletaId
// Roles: COMITE_TECNICO, ENTRENADOR
export async function fetchAlertasAtleta(
  atletaId: string,
  soloNoLeidas: boolean = false
): Promise<AlertaAtleta[] | null> {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.error('[fetchAlertasAtleta] No autenticado');
      return null;
    }

    const params = soloNoLeidas ? '?soloNoLeidas=true' : '';
    const response = await authFetch(
      `/notificaciones/alertas/atleta/${atletaId}${params}`
    );

    if (!response.ok) {
      console.error('[fetchAlertasAtleta] Error:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('[fetchAlertasAtleta] Error:', error);
    return null;
  }
}

// Obtener total para badge del Centro de Notificaciones (sidebar)
// Verificado: notificaciones.controller.ts GET /notificaciones/centro/total
// Roles: COMITE_TECNICO, ENTRENADOR
export async function fetchCentroNotificacionesTotal(): Promise<CentroNotificacionesTotal | null> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return null;
    }

    const response = await authFetch('/notificaciones/centro/total');

    if (!response.ok) {
      console.error('[fetchCentroNotificacionesTotal] Error:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('[fetchCentroNotificacionesTotal] Error:', error);
    return null;
  }
}
