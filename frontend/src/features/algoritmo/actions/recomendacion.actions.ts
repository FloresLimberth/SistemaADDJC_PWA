'use server';

import { authFetch, getAuthToken } from './base';

// Iniciar revision de una recomendacion (PENDIENTE -> EN_PROCESO)
// Verificado: recomendaciones.controller.ts POST /recomendaciones/:id/revisar
// Roles: COMITE_TECNICO
export async function revisarRecomendacion(id: string) {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, error: 'No autenticado' };
    }

    const response = await authFetch(`/recomendaciones/${id}/revisar`, {
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
    console.error('[revisarRecomendacion] Error:', error);
    return { success: false, error: 'Error al iniciar revision' };
  }
}

// Aprobar recomendacion
// Verificado: recomendaciones.controller.ts POST /recomendaciones/:id/aprobar
// Body: { comentario?: string } (max 500 chars)
// Roles: COMITE_TECNICO
export async function aprobarRecomendacion(
  id: string,
  comentario?: string
) {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, error: 'No autenticado' };
    }

    const body: { comentario?: string } = {};
    if (comentario) {
      body.comentario = comentario;
    }

    const response = await authFetch(`/recomendaciones/${id}/aprobar`, {
      method: 'POST',
      body: JSON.stringify(body),
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
    console.error('[aprobarRecomendacion] Error:', error);
    return { success: false, error: 'Error al aprobar recomendacion' };
  }
}

// Rechazar recomendacion
// Verificado: recomendaciones.controller.ts POST /recomendaciones/:id/rechazar
// Body: { motivo?: string (max 1000), accionAlternativa?: string (max 500) }
// Roles: COMITE_TECNICO
export async function rechazarRecomendacion(
  id: string,
  motivo?: string,
  accionAlternativa?: string
) {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, error: 'No autenticado' };
    }

    const body: { motivo?: string; accionAlternativa?: string } = {};
    if (motivo) {
      body.motivo = motivo;
    }
    if (accionAlternativa) {
      body.accionAlternativa = accionAlternativa;
    }

    const response = await authFetch(`/recomendaciones/${id}/rechazar`, {
      method: 'POST',
      body: JSON.stringify(body),
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
    console.error('[rechazarRecomendacion] Error:', error);
    return { success: false, error: 'Error al rechazar recomendacion' };
  }
}

// Modificar y aprobar recomendacion
// Verificado: recomendaciones.controller.ts POST /recomendaciones/:id/modificar
// Verificado: dto/modificar-recomendacion.dto.ts
// Roles: COMITE_TECNICO
export interface ModificarRecomendacionData {
  modificaciones: Record<string, unknown>;
  justificacion: string;
  comentarioAdicional?: string;
}

export async function modificarRecomendacion(
  id: string,
  data: ModificarRecomendacionData
) {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, error: 'No autenticado' };
    }

    const response = await authFetch(`/recomendaciones/${id}/modificar`, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return {
        success: false,
        error: errorData?.message || `Error ${response.status}`,
      };
    }

    const responseData = await response.json();
    return { success: true, data: responseData };
  } catch (error) {
    console.error('[modificarRecomendacion] Error:', error);
    return { success: false, error: 'Error al modificar recomendacion' };
  }
}
