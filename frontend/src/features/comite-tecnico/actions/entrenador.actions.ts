'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  createEntrenadorSchema,
  updateEntrenadorSchema,
} from '../schemas/entrenador.schema';
import type { ActionResult } from '@/types/action-result';
import { COMITE_TECNICO_ROUTES } from '@/lib/routes';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Server Action para crear un entrenador
// Endpoint: POST /api/entrenadores
export async function createEntrenador(
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
      ci: formData.get('ci'),
      nombreCompleto: formData.get('nombreCompleto'),
      email: formData.get('email'),
      contrasena: formData.get('contrasena'),
      municipio: formData.get('municipio'),
      especialidad: formData.get('especialidad') || undefined,
    };

    // Validar con Zod
    const validation = createEntrenadorSchema.safeParse(rawData);

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

    const response = await fetch(`${API_URL}/entrenadores`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validation.data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('[createEntrenador] Error:', response.status, errorData);

      if (response.status === 403) {
        return {
          success: false,
          error: 'No tienes permiso para crear entrenadores',
          submittedData: rawData as Record<string, unknown>,
        };
      }

      if (response.status === 409) {
        return {
          success: false,
          error: errorData?.message || 'El email o CI ya estan registrados',
          submittedData: rawData as Record<string, unknown>,
        };
      }

      return {
        success: false,
        error: errorData?.message || 'Error al crear el entrenador',
        submittedData: rawData as Record<string, unknown>,
      };
    }

    const result = await response.json();
    console.log('[createEntrenador] Entrenador creado:', result.id);

    revalidatePath('/comite-tecnico/entrenadores');
    revalidatePath('/comite-tecnico');
  } catch (error) {
    console.error('[createEntrenador] Error:', error);
    return {
      success: false,
      error: 'Error de conexion. Intenta nuevamente.',
      submittedData: {},
    };
  }

  redirect(COMITE_TECNICO_ROUTES.entrenadores.list);
}

// Server Action para actualizar un entrenador
// Endpoint: PATCH /api/entrenadores/:id
export async function updateEntrenador(
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

    // Campos obligatorios
    const municipio = formData.get('municipio');
    if (municipio) rawData.municipio = municipio;

    // Campos opcionales
    const especialidad = formData.get('especialidad');
    if (especialidad) rawData.especialidad = especialidad;

    const estado = formData.get('estado');
    if (estado !== null) rawData.estado = estado === 'true';

    // Validar con Zod
    const validation = updateEntrenadorSchema.safeParse(rawData);

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
        submittedData: rawData,
      };
    }

    const response = await fetch(`${API_URL}/entrenadores/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validation.data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('[updateEntrenador] Error:', response.status, errorData);

      if (response.status === 403) {
        return {
          success: false,
          error: 'No tienes permiso para editar entrenadores',
          submittedData: rawData,
        };
      }

      if (response.status === 404) {
        return {
          success: false,
          error: 'Entrenador no encontrado',
          submittedData: rawData,
        };
      }

      return {
        success: false,
        error: errorData?.message || 'Error al actualizar el entrenador',
        submittedData: rawData,
      };
    }

    console.log('[updateEntrenador] Entrenador actualizado:', id);

    revalidatePath(`/comite-tecnico/entrenadores/${id}`);
    revalidatePath('/comite-tecnico/entrenadores');
    revalidatePath('/comite-tecnico');

    return {
      success: true,
      data: undefined,
      message: 'Entrenador actualizado exitosamente',
    };
  } catch (error) {
    console.error('[updateEntrenador] Error:', error);
    return {
      success: false,
      error: 'Error de conexion. Intenta nuevamente.',
      submittedData: {},
    };
  }
}

// Server Action para eliminar un entrenador
// Endpoint: DELETE /api/entrenadores/:id
export async function deleteEntrenador(id: string): Promise<ActionResult> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return {
        success: false,
        error: 'No autenticado. Por favor inicia sesion.',
      };
    }

    const response = await fetch(`${API_URL}/entrenadores/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('[deleteEntrenador] Error:', response.status, errorData);

      if (response.status === 403) {
        return {
          success: false,
          error: 'No tienes permiso para eliminar entrenadores',
        };
      }

      if (response.status === 404) {
        return {
          success: false,
          error: 'Entrenador no encontrado',
        };
      }

      if (response.status === 400) {
        return {
          success: false,
          error:
            errorData?.message ||
            'No se puede eliminar el entrenador porque tiene atletas asignados',
        };
      }

      return {
        success: false,
        error: errorData?.message || 'Error al eliminar el entrenador',
      };
    }

    console.log('[deleteEntrenador] Entrenador eliminado:', id);

    revalidatePath('/comite-tecnico/entrenadores');
    revalidatePath('/comite-tecnico');

    return {
      success: true,
      data: undefined,
      message: 'Entrenador eliminado exitosamente',
    };
  } catch (error) {
    console.error('[deleteEntrenador] Error:', error);
    return {
      success: false,
      error: 'Error de conexion. Intenta nuevamente.',
    };
  }
}
