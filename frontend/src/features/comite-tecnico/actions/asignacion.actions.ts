'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createAsignacionSchema } from '../schemas/asignacion.schema';
import type { ActionResult } from '@/types/action-result';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Server Action para crear una asignacion atleta-microciclo
// Endpoint: POST /api/asignaciones
export async function createAsignacion(
  prevState: ActionResult,
  formData: FormData
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

    // Extraer datos del FormData
    const rawData = {
      atletaId: formData.get('atletaId'),
      microcicloId: formData.get('microcicloId'),
      observaciones: formData.get('observaciones') || undefined,
    };

    // Validar con Zod
    const validation = createAsignacionSchema.safeParse(rawData);

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
        error: 'Por favor corrige los errores del formulario',
        fieldErrors,
        submittedData: rawData as Record<string, unknown>,
      };
    }

    const response = await fetch(`${API_URL}/asignaciones`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validation.data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('[createAsignacion] Error:', response.status, errorData);

      if (response.status === 409) {
        return {
          success: false,
          error: errorData?.message || 'El atleta ya esta asignado a este microciclo',
          submittedData: rawData as Record<string, unknown>,
        };
      }

      return {
        success: false,
        error: errorData?.message || 'Error al crear la asignacion',
        submittedData: rawData as Record<string, unknown>,
      };
    }

    const result = await response.json();
    console.log('[createAsignacion] Asignacion creada:', result.id);

    revalidatePath('/comite-tecnico/asignaciones');
    revalidatePath('/comite-tecnico');

    return {
      success: true,
      data: result,
      message: 'Asignacion creada correctamente',
    };
  } catch (error) {
    console.error('[createAsignacion] Error:', error);
    return {
      success: false,
      error: 'Error de conexion. Intenta nuevamente.',
      submittedData: {},
    };
  }
}

// Server Action para eliminar una asignacion
// Endpoint: DELETE /api/asignaciones/:id
export async function deleteAsignacion(id: string): Promise<ActionResult> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return {
        success: false,
        error: 'No autenticado. Por favor inicia sesion.',
      };
    }

    const response = await fetch(`${API_URL}/asignaciones/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('[deleteAsignacion] Error:', response.status, errorData);

      return {
        success: false,
        error: errorData?.message || 'Error al eliminar la asignacion',
      };
    }

    revalidatePath('/comite-tecnico/asignaciones');
    revalidatePath('/comite-tecnico');

    return {
      success: true,
      data: undefined,
      message: 'Asignacion eliminada correctamente',
    };
  } catch (error) {
    console.error('[deleteAsignacion] Error:', error);
    return {
      success: false,
      error: 'Error de conexion. Intenta nuevamente.',
    };
  }
}

// Server Action para actualizar una asignacion (solo observaciones)
// Endpoint: PATCH /api/asignaciones/:id
export async function updateAsignacion(
  id: string,
  prevState: ActionResult,
  formData: FormData
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

    const observaciones = formData.get('observaciones') as string | null;

    const response = await fetch(`${API_URL}/asignaciones/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ observaciones: observaciones || null }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('[updateAsignacion] Error:', response.status, errorData);

      return {
        success: false,
        error: errorData?.message || 'Error al actualizar la asignacion',
      };
    }

    const result = await response.json();
    console.log('[updateAsignacion] Asignacion actualizada:', result.id);

    revalidatePath('/comite-tecnico/asignaciones');
    revalidatePath(`/comite-tecnico/asignaciones/${id}`);

    return {
      success: true,
      data: result,
      message: 'Asignacion actualizada correctamente',
    };
  } catch (error) {
    console.error('[updateAsignacion] Error:', error);
    return {
      success: false,
      error: 'Error de conexion. Intenta nuevamente.',
    };
  }
}
