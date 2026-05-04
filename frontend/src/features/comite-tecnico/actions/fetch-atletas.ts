'use server';

import { authFetch, getAuthToken } from './base';
import type { AtletaResumen, AtletaDetalle } from '@/features/entrenador/types/entrenador.types';
import type { PaginatedResponse } from '@/features/atleta/types/atleta.types';

// Parametros de busqueda para atletas
export interface FetchAtletasParams {
  page?: number;
  limit?: number;
  search?: string;
  club?: string;
  categoria?: string;
  entrenadorId?: string;
}

// Obtener lista paginada de atletas
// COMITE_TECNICO ve todos los atletas
export async function fetchAtletas(
  params: FetchAtletasParams = {}
): Promise<PaginatedResponse<AtletaResumen> | null> {
  try {
    const token = await getAuthToken();

    if (!token) {
      console.error('[fetchAtletas] No autenticado');
      return null;
    }

    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.search) searchParams.set('search', params.search);
    if (params.club) searchParams.set('club', params.club);
    if (params.categoria) searchParams.set('categoria', params.categoria);
    if (params.entrenadorId) searchParams.set('entrenadorId', params.entrenadorId);

    const queryString = searchParams.toString();
    const endpoint = `/atletas${queryString ? `?${queryString}` : ''}`;

    const response = await authFetch(endpoint);

    if (!response.ok) {
      console.error('[fetchAtletas] Error:', response.status);
      return null;
    }

    const data = await response.json();
    return data as PaginatedResponse<AtletaResumen>;
  } catch (error) {
    console.error('[fetchAtletas] Error:', error);
    return null;
  }
}

// Obtener detalle de un atleta por ID
export async function fetchAtleta(id: string): Promise<AtletaDetalle | null> {
  try {
    const token = await getAuthToken();

    if (!token) {
      console.error('[fetchAtleta] No autenticado');
      return null;
    }

    const response = await authFetch(`/atletas/${id}`);

    if (!response.ok) {
      console.error('[fetchAtleta] Error:', response.status);
      return null;
    }

    const data = await response.json();
    return data as AtletaDetalle;
  } catch (error) {
    console.error('[fetchAtleta] Error:', error);
    return null;
  }
}
