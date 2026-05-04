'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createMesocicloSchema, updateMesocicloSchema } from '../schemas/mesociclo.schema';
import type { ActionResult } from '@/types/action-result';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Server Action para crear un mesociclo
// Endpoint: POST /api/mesociclos
export async function createMesociclo(
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
      macrocicloId: formData.get('macrocicloId'),
      nombre: formData.get('nombre'),
      codigoMesociclo: formData.get('codigoMesociclo'),
      etapa: formData.get('etapa'),
      fechaInicio: formData.get('fechaInicio'),
      fechaFin: formData.get('fechaFin'),
      objetivoFisico: formData.get('objetivoFisico'),
      objetivoTecnico: formData.get('objetivoTecnico'),
      objetivoTactico: formData.get('objetivoTactico'),
    };

    // Validar con Zod
    const validation = createMesocicloSchema.safeParse(rawData);

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

    const response = await fetch(`${API_URL}/mesociclos`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validation.data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('[createMesociclo] Error:', response.status, errorData);

      return {
        success: false,
        error: errorData?.message || 'Error al crear el mesociclo',
        submittedData: rawData as Record<string, unknown>,
      };
    }

    const result = await response.json();
    console.log('[createMesociclo] Mesociclo creado:', result.id);

    revalidatePath('/comite-tecnico/planificacion');
    revalidatePath(`/comite-tecnico/planificacion/${validation.data.macrocicloId}`);

    return {
      success: true,
      data: result,
      message: 'Mesociclo creado correctamente',
    };
  } catch (error) {
    console.error('[createMesociclo] Error:', error);
    return {
      success: false,
      error: 'Error de conexion. Intenta nuevamente.',
      submittedData: {},
    };
  }
}

// Server Action para actualizar un mesociclo
// Endpoint: PATCH /api/mesociclos/:id
export async function updateMesociclo(
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
      'macrocicloId',
      'nombre',
      'codigoMesociclo',
      'etapa',
      'fechaInicio',
      'fechaFin',
      'objetivoFisico',
      'objetivoTecnico',
      'objetivoTactico',
    ];

    for (const field of fields) {
      const value = formData.get(field);
      if (value !== null && value !== '') {
        rawData[field] = value;
      }
    }

    // Validar con Zod
    const validation = updateMesocicloSchema.safeParse(rawData);

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

    const response = await fetch(`${API_URL}/mesociclos/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validation.data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('[updateMesociclo] Error:', response.status, errorData);

      return {
        success: false,
        error: errorData?.message || 'Error al actualizar el mesociclo',
      };
    }

    revalidatePath('/comite-tecnico/planificacion');

    return {
      success: true,
      data: undefined,
      message: 'Mesociclo actualizado correctamente',
    };
  } catch (error) {
    console.error('[updateMesociclo] Error:', error);
    return {
      success: false,
      error: 'Error de conexion. Intenta nuevamente.',
    };
  }
}

// Tipos para delete info
export interface MesocicloDeleteInfo {
  nombre: string;
  microciclos: number;
  sesiones: number;
}

// Funcion para obtener informacion antes de eliminar
// Endpoint: GET /api/mesociclos/:id/delete-info
export async function fetchMesocicloDeleteInfo(id: string): Promise<MesocicloDeleteInfo | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return null;
    }

    const response = await fetch(`${API_URL}/mesociclos/${id}/delete-info`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('[fetchMesocicloDeleteInfo] Error:', error);
    return null;
  }
}

// Server Action para eliminar un mesociclo
// Endpoint: DELETE /api/mesociclos/:id
export async function deleteMesociclo(id: string): Promise<ActionResult> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return {
        success: false,
        error: 'No autenticado. Por favor inicia sesion.',
      };
    }

    const response = await fetch(`${API_URL}/mesociclos/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('[deleteMesociclo] Error:', response.status, errorData);

      return {
        success: false,
        error: errorData?.message || 'Error al eliminar el mesociclo',
      };
    }

    revalidatePath('/comite-tecnico/planificacion');

    return {
      success: true,
      data: undefined,
      message: 'Mesociclo eliminado correctamente',
    };
  } catch (error) {
    console.error('[deleteMesociclo] Error:', error);
    return {
      success: false,
      error: 'Error de conexion. Intenta nuevamente.',
    };
  }
}
