'use server';

import { authFetch, getAuthToken } from './base';
import type { EntrenadorResumen } from '../types/planificacion.types';
import type { PaginatedResponse } from '@/features/atleta/types/atleta.types';

// Parametros de busqueda para entrenadores
export interface FetchEntrenadoresParams {
  page?: number;
  limit?: number;
  search?: string;
  municipio?: string;
}

// Obtener lista paginada de entrenadores
export async function fetchEntrenadores(
  params: FetchEntrenadoresParams = {}
): Promise<PaginatedResponse<EntrenadorResumen> | null> {
  try {
    const token = await getAuthToken();

    if (!token) {
      console.error('[fetchEntrenadores] No autenticado');
      return null;
    }

    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.search) searchParams.set('search', params.search);
    if (params.municipio) searchParams.set('municipio', params.municipio);

    const queryString = searchParams.toString();
    const endpoint = `/entrenadores${queryString ? `?${queryString}` : ''}`;

    const response = await authFetch(endpoint);

    if (!response.ok) {
      console.error('[fetchEntrenadores] Error:', response.status);
      return null;
    }

    const data = await response.json();
    return data as PaginatedResponse<EntrenadorResumen>;
  } catch (error) {
    console.error('[fetchEntrenadores] Error:', error);
    return null;
  }
}

// Obtener detalle de un entrenador por ID
export async function fetchEntrenador(id: string): Promise<EntrenadorResumen | null> {
  try {
    const token = await getAuthToken();

    if (!token) {
      console.error('[fetchEntrenador] No autenticado');
      return null;
    }

    const response = await authFetch(`/entrenadores/${id}`);

    if (!response.ok) {
      console.error('[fetchEntrenador] Error:', response.status);
      return null;
    }

    const data = await response.json();
    return data as EntrenadorResumen;
  } catch (error) {
    console.error('[fetchEntrenador] Error:', error);
    return null;
  }
}
