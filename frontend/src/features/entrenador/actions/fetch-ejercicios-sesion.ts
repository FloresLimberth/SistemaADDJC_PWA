'use server';

import { cookies } from 'next/headers';

// Tipo para cada ejercicio de una sesion
export interface EjercicioSesionItem {
  id: string;
  ejercicioId: string;
  nombre: string;
  tipo: string;
  subtipo: string | null;
  orden: number;
  duracionMinutos: number | null;
  repeticiones: number | null;
  series: number | null;
  intensidad: number | null;
  observaciones: string | null;
}

interface EjerciciosSesionResponse {
  sesionId: string;
  ejercicios: EjercicioSesionItem[];
  meta: {
    totalEjercicios: number;
    tieneEjerciciosRelacionales: boolean;
  };
}

// Server action para obtener los ejercicios asignados a una sesion
// Endpoint: GET /api/sesiones/:id/ejercicios
export async function fetchEjerciciosSesion(
  sesionId: string
): Promise<EjercicioSesionItem[]> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      console.error('[fetchEjerciciosSesion] No autenticado');
      return [];
    }

    const API_URL =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

    const response = await fetch(`${API_URL}/sesiones/${sesionId}/ejercicios`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(
        '[fetchEjerciciosSesion] Error:',
        response.status,
        response.statusText
      );
      return [];
    }

    const data: EjerciciosSesionResponse = await response.json();
    return data.ejercicios || [];
  } catch (error) {
    console.error('[fetchEjerciciosSesion] Error:', error);
    return [];
  }
}
