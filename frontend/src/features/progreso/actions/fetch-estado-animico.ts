'use server';

import { getCurrentUserAction } from '@/app/actions/auth.actions';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { registroPostEntrenamientoSchema } from '@/features/atleta/types/atleta.types';
import type { EstadoAnimicoDataPoint } from '../types/progreso.types';

// Server Action para obtener datos de estado animico del atleta
// Endpoint: GET /api/registros-post-entrenamiento
// Filtrado automatico por JWT para ATLETA
export async function fetchEstadoAnimico(): Promise<EstadoAnimicoDataPoint[] | null> {
  try {
    const userResult = await getCurrentUserAction();

    if (!userResult.success || !userResult.user) {
      console.error('[fetchEstadoAnimico] Usuario no autenticado');
      return null;
    }

    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      console.error('[fetchEstadoAnimico] No se encontro token');
      return null;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

    // Obtener registros post-entrenamiento (ultimos 50)
    const response = await fetch(`${API_URL}/registros-post-entrenamiento?page=1&limit=50`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      console.error('[fetchEstadoAnimico] Error:', response.status);
      return null;
    }

    const resultData = await response.json();

    const validationResult = z.array(registroPostEntrenamientoSchema).safeParse(resultData.data || []);

    if (!validationResult.success) {
      console.error('[fetchEstadoAnimico] Error de validacion:', validationResult.error.issues);
      return null;
    }

    const registros = validationResult.data;

    if (registros.length === 0) {
      return [];
    }

    // Transformar datos para el grafico
    const animicoData: EstadoAnimicoDataPoint[] = registros
      .map((registro) => {
        const fecha = new Date(registro.fechaRegistro);
        return {
          fecha: fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
          timestamp: fecha.getTime(),
          estadoAnimico: registro.estadoAnimico,
        };
      })
      .sort((a, b) => a.timestamp - b.timestamp);

    return animicoData;
  } catch (error) {
    console.error('[fetchEstadoAnimico] Error:', error);
    return null;
  }
}
