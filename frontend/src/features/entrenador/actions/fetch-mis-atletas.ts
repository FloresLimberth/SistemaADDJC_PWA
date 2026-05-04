'use server';

import { cookies } from 'next/headers';
import { z } from 'zod';
import {
  atletaResumenSchema,
  AtletaResumen,
  AtletasListResponse,
} from '../types/entrenador.types';

interface FetchMisAtletasParams {
  page?: number;
  limit?: number;
}

// Server Action para obtener la lista de atletas asignados al entrenador
// Endpoint: GET /atletas (filtrado automatico por entrenador)
export async function fetchMisAtletas(
  params: FetchMisAtletasParams = {}
): Promise<AtletasListResponse | null> {
  const { page = 1, limit = 50 } = params;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      console.error('[fetchMisAtletas] No se encontro token');
      return null;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

    const response = await fetch(
      `${API_URL}/atletas?page=${page}&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      console.error('[fetchMisAtletas] Error:', response.status);
      return null;
    }

    const result = await response.json();

    // Validar con Zod (estructura paginada)
    const validation = z.object({
      data: z.array(atletaResumenSchema),
      meta: z.object({
        total: z.number(),
        page: z.number(),
        limit: z.number(),
        totalPages: z.number(),
      }),
    }).safeParse(result);

    if (!validation.success) {
      console.error('[fetchMisAtletas] Error de validacion:', validation.error.issues);
      // Log para debug en desarrollo
      if (process.env.NODE_ENV === 'development') {
        console.error('[fetchMisAtletas] Datos recibidos:', JSON.stringify(result, null, 2));
      }
      // Intentar retornar los datos sin validar
      return {
        data: result.data || [],
        meta: result.meta || { total: 0 },
      };
    }

    console.log('[fetchMisAtletas] Atletas obtenidos:', validation.data.data.length);
    return validation.data;
  } catch (error) {
    console.error('[fetchMisAtletas] Error:', error);
    return null;
  }
}

// Obtener solo los atletas para selectores (version simplificada)
export async function fetchAtletasParaSelector(): Promise<
  { id: string; nombreCompleto: string }[] | null
> {
  const result = await fetchMisAtletas({ limit: 100 });

  if (!result) return null;

  return result.data.map((atleta) => ({
    id: atleta.id,
    nombreCompleto: atleta.usuario.nombreCompleto,
  }));
}
