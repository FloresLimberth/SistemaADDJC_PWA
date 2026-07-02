'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createMicrocicloSchema, updateMicrocicloSchema } from '../schemas/microciclo.schema';
import type { ActionResult } from '@/types/action-result';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Server Action para crear un microciclo
// Endpoint: POST /api/microciclos
export async function createMicrociclo(
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
      mesocicloId: formData.get('mesocicloId') || undefined,
      codigoMicrociclo: formData.get('codigoMicrociclo'),
      fechaInicio: formData.get('fechaInicio'),
      fechaFin: formData.get('fechaFin'),
      tipoMicrociclo: formData.get('tipoMicrociclo'),
      volumenTotal: formData.get('volumenTotal'),
      intensidadPromedio: formData.get('intensidadPromedio'),
      objetivoSemanal: formData.get('objetivoSemanal'),
      observaciones: formData.get('observaciones') || undefined,
      creadoPor: formData.get('creadoPor') || undefined,
    };

    // Validar con Zod
    const validation = createMicrocicloSchema.safeParse(rawData);

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

    const response = await fetch(`${API_URL}/microciclos`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validation.data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('[createMicrociclo] Error:', response.status, errorData);

      return {
        success: false,
        error: errorData?.message || 'Error al crear el microciclo',
        submittedData: rawData as Record<string, unknown>,
      };
    }

    const result = await response.json();
    console.log('[createMicrociclo] Microciclo creado:', result.id);

    revalidatePath('/comite-tecnico/planificacion');
    revalidatePath('/comite-tecnico');

    return {
      success: true,
      data: result,
      message: 'Microciclo creado correctamente',
    };
  } catch (error) {
    console.error('[createMicrociclo] Error:', error);
    return {
      success: false,
      error: 'Error de conexion. Intenta nuevamente.',
      submittedData: {},
    };
  }
}

// Server Action para actualizar un microciclo
// Endpoint: PATCH /api/microciclos/:id
export async function updateMicrociclo(
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

    // Extraer datos del FormData
    const rawData: Record<string, unknown> = {};
    const fields = [
      'mesocicloId',
      'codigoMicrociclo',
      'fechaInicio',
      'fechaFin',
      'tipoMicrociclo',
      'volumenTotal',
      'intensidadPromedio',
      'objetivoSemanal',
      'observaciones',
      'creadoPor',
    ];

    for (const field of fields) {
      const value = formData.get(field);
      if (value !== null && value !== '') {
        rawData[field] = value;
      }
    }

    // Validar con Zod
    const validation = updateMicrocicloSchema.safeParse(rawData);

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

    const response = await fetch(`${API_URL}/microciclos/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validation.data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('[updateMicrociclo] Error:', response.status, errorData);

      return {
        success: false,
        error: errorData?.message || 'Error al actualizar el microciclo',
      };
    }

    revalidatePath('/comite-tecnico/planificacion');
    revalidatePath('/comite-tecnico');

    return {
      success: true,
      data: undefined,
      message: 'Microciclo actualizado correctamente',
    };
  } catch (error) {
    console.error('[updateMicrociclo] Error:', error);
    return {
      success: false,
      error: 'Error de conexion. Intenta nuevamente.',
    };
  }
}

// Tipos para delete info
export interface MicrocicloDeleteInfo {
  codigoMicrociclo: string;
  sesiones: number;
}

// Funcion para obtener informacion antes de eliminar
// Endpoint: GET /api/microciclos/:id/delete-info
export async function fetchMicrocicloDeleteInfo(id: string): Promise<MicrocicloDeleteInfo | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return null;
    }

    const response = await fetch(`${API_URL}/microciclos/${id}/delete-info`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('[fetchMicrocicloDeleteInfo] Error:', error);
    return null;
  }
}

// Server Action para eliminar un microciclo
// Endpoint: DELETE /api/microciclos/:id
export async function deleteMicrociclo(id: string): Promise<ActionResult> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return {
        success: false,
        error: 'No autenticado. Por favor inicia sesion.',
      };
    }

    const response = await fetch(`${API_URL}/microciclos/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('[deleteMicrociclo] Error:', response.status, errorData);

      return {
        success: false,
        error: errorData?.message || 'Error al eliminar el microciclo',
      };
    }

    revalidatePath('/comite-tecnico/planificacion');
    revalidatePath('/comite-tecnico');

    return {
      success: true,
      data: undefined,
      message: 'Microciclo eliminado correctamente',
    };
  } catch (error) {
    console.error('[deleteMicrociclo] Error:', error);
    return {
      success: false,
      error: 'Error de conexion. Intenta nuevamente.',
    };
  }
}
