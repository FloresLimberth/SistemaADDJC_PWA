'use server';

import { cookies } from 'next/headers';
import { z } from 'zod';
import {
  testFisicoSchema,
  TestFisico,
  PaginatedResponse,
} from '@/features/atleta/types/atleta.types';

interface FetchTestsFisicosParams {
  atletaId?: string;
  microcicloId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  asistio?: string;
  page?: number;
  limit?: number;
}

// Server Action para obtener la lista de tests fisicos
// Endpoint: GET /tests-fisicos (filtrado automatico por entrenador)
export async function fetchTestsFisicosEntrenador(
  params: FetchTestsFisicosParams = {}
): Promise<PaginatedResponse<TestFisico> | null> {
  const { atletaId, microcicloId, fechaDesde, fechaHasta, asistio, page = 1, limit = 20 } = params;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      console.error('[fetchTestsFisicosEntrenador] No se encontro token');
      return null;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

    // Construir query params
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    if (atletaId) queryParams.append('atletaId', atletaId);
    if (microcicloId) queryParams.append('microcicloId', microcicloId);
    if (fechaDesde) queryParams.append('fechaDesde', fechaDesde);
    if (fechaHasta) queryParams.append('fechaHasta', fechaHasta);
    if (asistio) queryParams.append('asistio', asistio);

    const response = await fetch(
      `${API_URL}/tests-fisicos?${queryParams.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      console.error('[fetchTestsFisicosEntrenador] Error:', response.status);
      return null;
    }

    const result = await response.json();

    // Validar con Zod
    const validation = z.object({
      data: z.array(testFisicoSchema),
      meta: z.object({
        total: z.number(),
        page: z.number(),
        limit: z.number(),
        totalPages: z.number(),
      }),
    }).safeParse(result);

    if (!validation.success) {
      console.error('[fetchTestsFisicosEntrenador] Error de validacion:', validation.error.issues);
      if (process.env.NODE_ENV === 'development') {
        console.error('[fetchTestsFisicosEntrenador] Datos:', JSON.stringify(result.data?.[0], null, 2));
      }
      // Retornar sin validar
      return {
        data: result.data || [],
        meta: result.meta || { total: 0 },
      };
    }

    console.log('[fetchTestsFisicosEntrenador] Tests obtenidos:', validation.data.data.length);
    return validation.data;
  } catch (error) {
    console.error('[fetchTestsFisicosEntrenador] Error:', error);
    return null;
  }
}

// Obtener un test fisico por ID
// Endpoint: GET /tests-fisicos/:id
export async function fetchTestFisicoEntrenador(
  id: string
): Promise<TestFisico | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      console.error('[fetchTestFisicoEntrenador] No se encontro token');
      return null;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

    const response = await fetch(
      `${API_URL}/tests-fisicos/${id}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      console.error('[fetchTestFisicoEntrenador] Error:', response.status);
      return null;
    }

    const result = await response.json();

    const validation = testFisicoSchema.safeParse(result);

    if (!validation.success) {
      console.error('[fetchTestFisicoEntrenador] Error de validacion:', validation.error.issues);
      return result as TestFisico;
    }

    return validation.data;
  } catch (error) {
    console.error('[fetchTestFisicoEntrenador] Error:', error);
    return null;
  }
}
