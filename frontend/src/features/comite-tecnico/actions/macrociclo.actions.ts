'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createMacrocicloSchema, updateMacrocicloSchema } from '../schemas/macrociclo.schema';
import type { ActionResult } from '@/types/action-result';
import { COMITE_TECNICO_ROUTES } from '@/lib/routes';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Server Action para crear un macrociclo
// Endpoint: POST /api/macrociclos
export async function createMacrociclo(
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
      nombre: formData.get('nombre'),
      temporada: formData.get('temporada'),
      equipo: formData.get('equipo'),
      categoriaObjetivo: formData.get('categoriaObjetivo'),
      objetivo1: formData.get('objetivo1'),
      objetivo2: formData.get('objetivo2'),
      objetivo3: formData.get('objetivo3'),
      fechaInicio: formData.get('fechaInicio'),
      fechaFin: formData.get('fechaFin'),
      estado: formData.get('estado') || undefined,
    };

    // Validar con Zod
    const validation = createMacrocicloSchema.safeParse(rawData);

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

    const response = await fetch(`${API_URL}/macrociclos`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validation.data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('[createMacrociclo] Error:', response.status, errorData);

      if (response.status === 403) {
        return {
          success: false,
          error: 'No tienes permiso para crear macrociclos',
          submittedData: rawData as Record<string, unknown>,
        };
      }

      return {
        success: false,
        error: errorData?.message || 'Error al crear el macrociclo',
        submittedData: rawData as Record<string, unknown>,
      };
    }

    const result = await response.json();
    console.log('[createMacrociclo] Macrociclo creado:', result.id);

    revalidatePath('/comite-tecnico/planificacion');
    revalidatePath('/comite-tecnico');
  } catch (error) {
    console.error('[createMacrociclo] Error:', error);
    return {
      success: false,
      error: 'Error de conexion. Intenta nuevamente.',
      submittedData: {},
    };
  }

  redirect(COMITE_TECNICO_ROUTES.planificacion.macrociclos.list);
}

// Server Action para actualizar un macrociclo
// Endpoint: PATCH /api/macrociclos/:id
export async function updateMacrociclo(
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
      'nombre',
      'temporada',
      'equipo',
      'categoriaObjetivo',
      'objetivo1',
      'objetivo2',
      'objetivo3',
      'fechaInicio',
      'fechaFin',
      'estado',
    ];

    for (const field of fields) {
      const value = formData.get(field);
      if (value !== null && value !== '') {
        rawData[field] = value;
      }
    }

    // Validar con Zod
    const validation = updateMacrocicloSchema.safeParse(rawData);

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

    const response = await fetch(`${API_URL}/macrociclos/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validation.data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('[updateMacrociclo] Error:', response.status, errorData);

      return {
        success: false,
        error: errorData?.message || 'Error al actualizar el macrociclo',
      };
    }

    revalidatePath('/comite-tecnico/planificacion');
    revalidatePath(`/comite-tecnico/planificacion/${id}`);
    revalidatePath('/comite-tecnico');

    return {
      success: true,
      data: undefined,
      message: 'Macrociclo actualizado correctamente',
    };
  } catch (error) {
    console.error('[updateMacrociclo] Error:', error);
    return {
      success: false,
      error: 'Error de conexion. Intenta nuevamente.',
    };
  }
}

// Tipos para delete info
export interface MacrocicloDeleteInfo {
  nombre: string;
  mesociclos: number;
  microciclos: number;
  sesiones: number;
}

// Funcion para obtener informacion antes de eliminar
// Endpoint: GET /api/macrociclos/:id/delete-info
export async function fetchMacrocicloDeleteInfo(id: string): Promise<MacrocicloDeleteInfo | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return null;
    }

    const response = await fetch(`${API_URL}/macrociclos/${id}/delete-info`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('[fetchMacrocicloDeleteInfo] Error:', error);
    return null;
  }
}

// Server Action para eliminar un macrociclo
// Endpoint: DELETE /api/macrociclos/:id
export async function deleteMacrociclo(id: string): Promise<ActionResult> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return {
        success: false,
        error: 'No autenticado. Por favor inicia sesion.',
      };
    }

    const response = await fetch(`${API_URL}/macrociclos/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('[deleteMacrociclo] Error:', response.status, errorData);

      return {
        success: false,
        error: errorData?.message || 'Error al eliminar el macrociclo',
      };
    }

    revalidatePath('/comite-tecnico/planificacion');
    revalidatePath('/comite-tecnico');

    return {
      success: true,
      data: undefined,
      message: 'Macrociclo eliminado correctamente',
    };
  } catch (error) {
    console.error('[deleteMacrociclo] Error:', error);
    return {
      success: false,
      error: 'Error de conexion. Intenta nuevamente.',
    };
  }
}
