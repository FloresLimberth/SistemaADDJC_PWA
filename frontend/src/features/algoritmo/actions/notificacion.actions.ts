'use server';

import { authFetch, getAuthToken } from './base';

// Marcar una notificacion como leida
// Verificado: notificaciones.controller.ts PATCH /notificaciones/:id/leer
// Roles: todos
export async function marcarNotificacionLeida(id: string) {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, error: 'No autenticado' };
    }

    const response = await authFetch(`/notificaciones/${id}/leer`, {
      method: 'PATCH',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return {
        success: false,
        error: errorData?.message || `Error ${response.status}`,
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('[marcarNotificacionLeida] Error:', error);
    return { success: false, error: 'Error al marcar como leida' };
  }
}

// Marcar todas las notificaciones como leidas
// Verificado: notificaciones.controller.ts POST /notificaciones/leer-todas
// Roles: todos
export async function marcarTodasNotificacionesLeidas() {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, error: 'No autenticado' };
    }

    const response = await authFetch('/notificaciones/leer-todas', {
      method: 'POST',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return {
        success: false,
        error: errorData?.message || `Error ${response.status}`,
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('[marcarTodasNotificacionesLeidas] Error:', error);
    return { success: false, error: 'Error al marcar todas como leidas' };
  }
}

// Eliminar una notificacion
// Verificado: notificaciones.controller.ts DELETE /notificaciones/:id
// Roles: todos
export async function eliminarNotificacion(id: string) {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, error: 'No autenticado' };
    }

    const response = await authFetch(`/notificaciones/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return {
        success: false,
        error: errorData?.message || `Error ${response.status}`,
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('[eliminarNotificacion] Error:', error);
    return { success: false, error: 'Error al eliminar notificacion' };
  }
}

// Marcar una alerta como leida
// Verificado: notificaciones.controller.ts PATCH /notificaciones/alertas/:alertaId/leer
// Roles: COMITE_TECNICO, ENTRENADOR
export async function marcarAlertaLeida(alertaId: string) {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, error: 'No autenticado' };
    }

    const response = await authFetch(
      `/notificaciones/alertas/${alertaId}/leer`,
      { method: 'PATCH' }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return {
        success: false,
        error: errorData?.message || `Error ${response.status}`,
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('[marcarAlertaLeida] Error:', error);
    return { success: false, error: 'Error al marcar alerta como leida' };
  }
}

// Marcar todas las alertas como leidas
// Verificado: notificaciones.controller.ts POST /notificaciones/alertas/leer-todas
// Roles: COMITE_TECNICO, ENTRENADOR
export async function marcarTodasAlertasLeidas() {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, error: 'No autenticado' };
    }

    const response = await authFetch('/notificaciones/alertas/leer-todas', {
      method: 'POST',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return {
        success: false,
        error: errorData?.message || `Error ${response.status}`,
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('[marcarTodasAlertasLeidas] Error:', error);
    return { success: false, error: 'Error al marcar alertas como leidas' };
  }
}
