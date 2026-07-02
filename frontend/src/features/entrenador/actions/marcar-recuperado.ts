'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { marcarRecuperadoSchema, MarcarRecuperadoPayload } from '../schemas/marcar-recuperado.schema';
import { ActionResult } from '@/types/action-result';

// Server Action para marcar una dolencia como recuperada
// Endpoint: PATCH /api/dolencias/:id/marcar-recuperado
export async function marcarRecuperado(
  dolenciaId: number,
  notasRecuperacion?: string
): Promise<ActionResult> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return {
        success: false,
        error: 'No autenticado. Por favor inicia sesion.',
      };
    }

    // Validar con Zod
    const validation = marcarRecuperadoSchema.safeParse({
      dolenciaId,
      notasRecuperacion,
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of validation.error.issues) {
        const path = issue.path.join('.');
        if (!fieldErrors[path]) {
          fieldErrors[path] = [];
        }
        fieldErrors[path].push(issue.message);
      }

      return {
        success: false,
        error: 'Datos invalidos',
        fieldErrors,
      };
    }

    // Construir payload para el backend (sin dolenciaId, va en la URL)
    const payload: MarcarRecuperadoPayload = {};
    if (validation.data.notasRecuperacion && validation.data.notasRecuperacion.trim() !== '') {
      payload.notasRecuperacion = validation.data.notasRecuperacion.trim();
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

    const response = await fetch(`${API_URL}/dolencias/${validation.data.dolenciaId}/marcar-recuperado`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('[marcarRecuperado] Error del backend:', response.status, errorData);

      if (response.status === 403) {
        return {
          success: false,
          error: 'No tienes permiso para modificar esta dolencia',
        };
      }
      if (response.status === 404) {
        return {
          success: false,
          error: 'Dolencia no encontrada',
        };
      }
      if (response.status === 400) {
        return {
          success: false,
          error: errorData?.message || 'La dolencia ya fue marcada como recuperada',
        };
      }

      return {
        success: false,
        error: errorData?.message || 'Error al marcar como recuperado',
      };
    }

    const result = await response.json();
    console.log('[marcarRecuperado] Dolencia marcada como recuperada:', result.id);

    // Revalidar las rutas afectadas
    revalidatePath('/entrenador/dolencias');
    revalidatePath('/entrenador');

    return {
      success: true,
      data: result,
    };

  } catch (error) {
    console.error('[marcarRecuperado] Error:', error);
    return {
      success: false,
      error: 'Error de conexion. Intenta nuevamente.',
    };
  }
}
