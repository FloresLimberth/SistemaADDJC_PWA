'use server';

import { getCurrentUserAction } from '@/app/actions/auth.actions';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { dolenciaSchema } from '@/features/atleta/types/atleta.types';

// Tipo para los filtros de dolencias
export interface FetchDolenciasParams {
  recuperado?: boolean;
  page?: number;
  limit?: number;
}

// Tipo para la respuesta paginada
export interface DolenciasResponse {
  dolencias: z.infer<typeof dolenciaSchema>[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Server Action para obtener las dolencias del atleta
// Endpoint: GET /api/dolencias
// El backend filtra automaticamente por atletaId cuando el rol es ATLETA
// Verificado en: backend/src/modules/dolencias/dolencias.service.ts lineas 98-109
export async function fetchDolencias(
  params: FetchDolenciasParams = {}
): Promise<DolenciasResponse | null> {
  try {
    // Obtener el usuario actual
    const userResult = await getCurrentUserAction();

    if (!userResult.success || !userResult.user) {
      console.error('[fetchDolencias] Usuario no autenticado');
      return null;
    }

    const user = userResult.user;
    console.log('[fetchDolencias] Usuario autenticado:', user.email, 'ID:', user.id);

    // Obtener el token para hacer la peticion
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      console.error('[fetchDolencias] No se encontro token');
      return null;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

    // Construir query params
    const queryParams = new URLSearchParams();
    if (params.recuperado !== undefined) {
      queryParams.append('recuperado', String(params.recuperado));
    }
    queryParams.append('page', String(params.page || 1));
    queryParams.append('limit', String(params.limit || 50));

    const url = `${API_URL}/dolencias?${queryParams.toString()}`;
    console.log('[fetchDolencias] URL:', url);

    // Llamar al endpoint del backend
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      console.error('[fetchDolencias] Error en respuesta:', response.status);
      const errorText = await response.text();
      console.error('[fetchDolencias] Error detalle:', errorText);
      return null;
    }

    const responseData = await response.json();
    console.log('[fetchDolencias] Dolencias obtenidas:', responseData.data?.length || 0);

    // El backend devuelve { data: [...], meta: {...} }
    const dolenciasData = responseData.data || [];
    const meta = responseData.meta || { total: 0, page: 1, limit: 50, totalPages: 0 };

    // Validar la respuesta con Zod
    const validationResult = z.array(dolenciaSchema).safeParse(dolenciasData);

    if (!validationResult.success) {
      console.error('[fetchDolencias] Error de validacion:', validationResult.error.issues);
      if (process.env.NODE_ENV === 'development') {
        console.error('[fetchDolencias] Datos que fallaron validacion:', JSON.stringify(dolenciasData, null, 2));
      }
      return null;
    }

    return {
      dolencias: validationResult.data,
      meta,
    };
  } catch (error) {
    console.error('[fetchDolencias] Error:', error);
    return null;
  }
}
