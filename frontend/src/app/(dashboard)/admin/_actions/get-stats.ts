'use server';

import { cookies } from 'next/headers';
import { usuariosStatsSchema, type UsuariosStats } from '@/lib/usuarios-schema';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

type GetStatsSuccess = {
  success: true;
  data: UsuariosStats;
};

type GetStatsError = {
  success: false;
  error: string;
};

type GetStatsResult = GetStatsSuccess | GetStatsError;

export async function getStatsAction(): Promise<GetStatsResult> {
  try {
    // Obtener token de autenticacion desde cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return {
        success: false,
        error: 'No autorizado. Por favor inicia sesion nuevamente',
      };
    }

    // Hacer GET al backend /api/users/stats
    const response = await fetch(`${API_URL}/users/stats`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store', // No cachear para obtener datos frescos siempre
    });

    // Si la respuesta no es exitosa, manejar error
    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || 'Error al obtener estadisticas',
      };
    }

    // Parsear respuesta del backend
    const stats = await response.json();

    // Validar que la respuesta coincida con el schema
    const validatedStats = usuariosStatsSchema.parse(stats);

    return {
      success: true,
      data: validatedStats,
    };
  } catch (error) {
    // Manejar otros errores
    console.error('[getStatsAction]', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
