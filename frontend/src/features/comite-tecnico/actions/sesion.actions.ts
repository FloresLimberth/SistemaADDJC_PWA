'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createSesionSchema, updateSesionSchema } from '../schemas/sesion.schema';
import type { ActionResult } from '@/types/action-result';
import { updateEjerciciosSesion } from './ejercicios-sesion.actions';
import type { EjercicioParaAsignar } from './ejercicios-sesion.actions';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Server Action para crear una sesion
// Endpoint: POST /api/sesiones
export async function createSesion(
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
      microcicloId: formData.get('microcicloId'),
      fecha: formData.get('fecha'),
      diaSemana: formData.get('diaSemana'),
      numeroSesion: formData.get('numeroSesion'),
      tipoSesion: formData.get('tipoSesion'),
      turno: formData.get('turno') || undefined,
      tipoPlanificacion: formData.get('tipoPlanificacion') || undefined,
      sesionBaseId: formData.get('sesionBaseId') || undefined,
      creadoPor: formData.get('creadoPor') || undefined,
      duracionPlanificada: formData.get('duracionPlanificada'),
      volumenPlanificado: formData.get('volumenPlanificado'),
      intensidadPlanificada: formData.get('intensidadPlanificada'),
      volumenReal: formData.get('volumenReal') || undefined,
      intensidadReal: formData.get('intensidadReal') || undefined,
      contenidoFisico: formData.get('contenidoFisico'),
      contenidoTecnico: formData.get('contenidoTecnico'),
      contenidoTactico: formData.get('contenidoTactico'),
      calentamiento: formData.get('calentamiento') || undefined,
      partePrincipal: formData.get('partePrincipal') || undefined,
      vueltaCalma: formData.get('vueltaCalma') || undefined,
      observaciones: formData.get('observaciones') || undefined,
      materialNecesario: formData.get('materialNecesario') || undefined,
    };

    // Validar con Zod
    const validation = createSesionSchema.safeParse(rawData);

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

    const response = await fetch(`${API_URL}/sesiones`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validation.data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('[createSesion] Error:', response.status, errorData);

      return {
        success: false,
        error: errorData?.message || 'Error al crear la sesion',
        submittedData: rawData as Record<string, unknown>,
      };
    }

    const result = await response.json();
    console.log('[createSesion] Sesion creada:', result.id);

    // Asignar ejercicios si se proporcionaron
    const ejerciciosJSON = formData.get('ejerciciosJSON') as string | null;
    if (ejerciciosJSON && result.id) {
      try {
        const ejercicios: EjercicioParaAsignar[] = JSON.parse(ejerciciosJSON);
        if (ejercicios.length > 0) {
          const ejResult = await updateEjerciciosSesion(String(result.id), ejercicios);
          if (!ejResult.success) {
            console.error('[createSesion] Error asignando ejercicios:', ejResult.error);
          }
        }
      } catch (parseError) {
        console.error('[createSesion] Error parseando ejercicios:', parseError);
      }
    }

    revalidatePath('/comite-tecnico/sesiones');
    revalidatePath('/comite-tecnico/planificacion');
    revalidatePath('/comite-tecnico');
    revalidatePath('/entrenador/sesiones');
    revalidatePath('/entrenador');

    return {
      success: true,
      data: result,
      message: 'Sesion creada correctamente',
    };
  } catch (error) {
    console.error('[createSesion] Error:', error);
    return {
      success: false,
      error: 'Error de conexion. Intenta nuevamente.',
      submittedData: {},
    };
  }
}

// Server Action para actualizar una sesion
// Endpoint: PATCH /api/sesiones/:id
export async function updateSesion(
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

    // Extraer datos del FormData (solo campos con valor)
    const rawData: Record<string, unknown> = {};
    const fields = [
      'microcicloId',
      'fecha',
      'diaSemana',
      'numeroSesion',
      'tipoSesion',
      'turno',
      'tipoPlanificacion',
      'sesionBaseId',
      'creadoPor',
      'duracionPlanificada',
      'volumenPlanificado',
      'intensidadPlanificada',
      'volumenReal',
      'intensidadReal',
      'contenidoFisico',
      'contenidoTecnico',
      'contenidoTactico',
      'calentamiento',
      'partePrincipal',
      'vueltaCalma',
      'observaciones',
      'materialNecesario',
    ];

    for (const field of fields) {
      const value = formData.get(field);
      if (value !== null && value !== '') {
        rawData[field] = value;
      }
    }

    // Validar con Zod
    const validation = updateSesionSchema.safeParse(rawData);

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

    const response = await fetch(`${API_URL}/sesiones/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validation.data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('[updateSesion] Error:', response.status, errorData);

      return {
        success: false,
        error: errorData?.message || 'Error al actualizar la sesion',
      };
    }

    // Asignar ejercicios si se proporcionaron
    const ejerciciosJSON = formData.get('ejerciciosJSON') as string | null;
    if (ejerciciosJSON) {
      try {
        const ejercicios: EjercicioParaAsignar[] = JSON.parse(ejerciciosJSON);
        const ejResult = await updateEjerciciosSesion(id, ejercicios);
        if (!ejResult.success) {
          console.error('[updateSesion] Error asignando ejercicios:', ejResult.error);
        }
      } catch (parseError) {
        console.error('[updateSesion] Error parseando ejercicios:', parseError);
      }
    }

    revalidatePath('/comite-tecnico/sesiones');
    revalidatePath('/comite-tecnico/planificacion');
    revalidatePath('/comite-tecnico');
    revalidatePath('/entrenador/sesiones');
    revalidatePath('/entrenador');

    return {
      success: true,
      data: undefined,
      message: 'Sesion actualizada correctamente',
    };
  } catch (error) {
    console.error('[updateSesion] Error:', error);
    return {
      success: false,
      error: 'Error de conexion. Intenta nuevamente.',
    };
  }
}

// Server Action para eliminar una sesion
// Endpoint: DELETE /api/sesiones/:id
export async function deleteSesion(id: string): Promise<ActionResult> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return {
        success: false,
        error: 'No autenticado. Por favor inicia sesion.',
      };
    }

    const response = await fetch(`${API_URL}/sesiones/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('[deleteSesion] Error:', response.status, errorData);

      return {
        success: false,
        error: errorData?.message || 'Error al eliminar la sesion',
      };
    }

    revalidatePath('/comite-tecnico/sesiones');
    revalidatePath('/comite-tecnico/planificacion');
    revalidatePath('/comite-tecnico');
    revalidatePath('/entrenador/sesiones');
    revalidatePath('/entrenador');

    return {
      success: true,
      data: undefined,
      message: 'Sesion eliminada correctamente',
    };
  } catch (error) {
    console.error('[deleteSesion] Error:', error);
    return {
      success: false,
      error: 'Error de conexion. Intenta nuevamente.',
    };
  }
}
