'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Tipo para cada ejercicio a asignar
export interface EjercicioParaAsignar {
  ejercicioId: string;
  orden: number;
  duracionMinutos?: number;
  repeticiones?: number;
  series?: number;
  intensidad?: number;
  observaciones?: string;
}

// Server Action para asignar ejercicios a una sesion
// Endpoint: PATCH /api/sesiones/:id/ejercicios
export async function updateEjerciciosSesion(
  sesionId: string,
  ejercicios: EjercicioParaAsignar[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return { success: false, error: 'No autenticado' };
    }

    const response = await fetch(`${API_URL}/sesiones/${sesionId}/ejercicios`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ejercicios }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('[updateEjerciciosSesion] Error:', response.status, errorData);
      return {
        success: false,
        error: errorData?.message || 'Error al asignar ejercicios',
      };
    }

    revalidatePath('/comite-tecnico/sesiones');
    revalidatePath('/entrenador/sesiones');

    return { success: true };
  } catch (error) {
    console.error('[updateEjerciciosSesion] Error:', error);
    return { success: false, error: 'Error de conexion' };
  }
}
