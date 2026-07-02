'use server';

import { cookies } from 'next/headers';
import { z } from 'zod';
import {
  registroPostEntrenamientoSchema,
  RegistroPostEntrenamiento,
  PaginatedResponse,
} from '@/features/atleta/types/atleta.types';

interface FetchRegistrosParams {
  atletaId?: string;
  sesionId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  asistio?: string;
  rpeMin?: number;
  page?: number;
  limit?: number;
}

// Server Action para obtener la lista de registros post-entrenamiento
// Endpoint: GET /registros-post-entrenamiento (filtrado automatico por entrenador)
export async function fetchRegistrosEntrenador(
  params: FetchRegistrosParams = {}
): Promise<PaginatedResponse<RegistroPostEntrenamiento> | null> {
  const { atletaId, sesionId, fechaDesde, fechaHasta, asistio, rpeMin, page = 1, limit = 20 } = params;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      console.error('[fetchRegistrosEntrenador] No se encontro token');
      return null;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

    // Construir query params
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    if (atletaId) queryParams.append('atletaId', atletaId);
    if (sesionId) queryParams.append('sesionId', sesionId);
    if (fechaDesde) queryParams.append('fechaDesde', fechaDesde);
    if (fechaHasta) queryParams.append('fechaHasta', fechaHasta);
    if (asistio) queryParams.append('asistio', asistio);
    if (rpeMin !== undefined) queryParams.append('rpeMin', rpeMin.toString());

    const response = await fetch(
      `${API_URL}/registros-post-entrenamiento?${queryParams.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      console.error('[fetchRegistrosEntrenador] Error:', response.status);
      return null;
    }

    const result = await response.json();

    // Validar con Zod
    const validation = z.object({
      data: z.array(registroPostEntrenamientoSchema),
      meta: z.object({
        total: z.number(),
        page: z.number(),
        limit: z.number(),
        totalPages: z.number(),
      }),
    }).safeParse(result);

    if (!validation.success) {
      console.error('[fetchRegistrosEntrenador] Error de validacion:', validation.error.issues);
      if (process.env.NODE_ENV === 'development') {
        console.error('[fetchRegistrosEntrenador] Datos:', JSON.stringify(result.data?.[0], null, 2));
      }
      // Retornar sin validar
      return {
        data: result.data || [],
        meta: result.meta || { total: 0 },
      };
    }

    console.log('[fetchRegistrosEntrenador] Registros obtenidos:', validation.data.data.length);
    return validation.data;
  } catch (error) {
    console.error('[fetchRegistrosEntrenador] Error:', error);
    return null;
  }
}

// Obtener un registro post-entrenamiento por ID
// Endpoint: GET /registros-post-entrenamiento/:id
export async function fetchRegistroEntrenador(
  id: string
): Promise<RegistroPostEntrenamiento | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      console.error('[fetchRegistroEntrenador] No se encontro token');
      return null;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

    const response = await fetch(
      `${API_URL}/registros-post-entrenamiento/${id}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      console.error('[fetchRegistroEntrenador] Error:', response.status);
      return null;
    }

    const result = await response.json();

    const validation = registroPostEntrenamientoSchema.safeParse(result);

    if (!validation.success) {
      console.error('[fetchRegistroEntrenador] Error de validacion:', validation.error.issues);
      return result as RegistroPostEntrenamiento;
    }

    return validation.data;
  } catch (error) {
    console.error('[fetchRegistroEntrenador] Error:', error);
    return null;
  }
}
