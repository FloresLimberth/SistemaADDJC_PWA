'use server';

import { cookies } from 'next/headers';
import { z } from 'zod';
import {
  dolenciaSchema,
  Dolencia,
  PaginatedResponse,
} from '@/features/atleta/types/atleta.types';

interface FetchDolenciasParams {
  atletaId?: string;
  soloActivas?: boolean;
  page?: number;
  limit?: number;
}

// Server Action para obtener la lista de dolencias
// Endpoint: GET /dolencias (filtrado automatico por entrenador)
export async function fetchDolenciasEntrenador(
  params: FetchDolenciasParams = {}
): Promise<PaginatedResponse<Dolencia> | null> {
  const { atletaId, soloActivas, page = 1, limit = 50 } = params;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      console.error('[fetchDolenciasEntrenador] No se encontro token');
      return null;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

    // Construir query params
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    if (atletaId) queryParams.append('atletaId', atletaId);
    if (soloActivas !== undefined) queryParams.append('recuperado', soloActivas ? 'false' : 'true');

    const response = await fetch(
      `${API_URL}/dolencias?${queryParams.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      console.error('[fetchDolenciasEntrenador] Error:', response.status);
      return null;
    }

    const result = await response.json();

    // Validar con Zod
    const validation = z.object({
      data: z.array(dolenciaSchema),
      meta: z.object({
        total: z.number(),
        page: z.number(),
        limit: z.number(),
        totalPages: z.number(),
      }),
    }).safeParse(result);

    if (!validation.success) {
      console.error('[fetchDolenciasEntrenador] Error de validacion:', validation.error.issues);
      if (process.env.NODE_ENV === 'development') {
        console.error('[fetchDolenciasEntrenador] Datos:', JSON.stringify(result.data?.[0], null, 2));
      }
      // Retornar sin validar
      return {
        data: result.data || [],
        meta: result.meta || { total: 0 },
      };
    }

    console.log('[fetchDolenciasEntrenador] Dolencias obtenidas:', validation.data.data.length);
    return validation.data;
  } catch (error) {
    console.error('[fetchDolenciasEntrenador] Error:', error);
    return null;
  }
}

// Obtener dolencias activas de un atleta especifico
// Endpoint: GET /dolencias/atleta/:atletaId/activas
export async function fetchDolenciasActivasPorAtleta(
  atletaId: string
): Promise<Dolencia[] | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      console.error('[fetchDolenciasActivasPorAtleta] No se encontro token');
      return null;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

    const response = await fetch(
      `${API_URL}/dolencias/atleta/${atletaId}/activas`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      console.error('[fetchDolenciasActivasPorAtleta] Error:', response.status);
      return null;
    }

    const result = await response.json();

    // Validar con Zod (retorna array directo, no paginado)
    const validation = z.array(dolenciaSchema).safeParse(result);

    if (!validation.success) {
      console.error('[fetchDolenciasActivasPorAtleta] Error de validacion:', validation.error.issues);
      return result || [];
    }

    return validation.data;
  } catch (error) {
    console.error('[fetchDolenciasActivasPorAtleta] Error:', error);
    return null;
  }
}
