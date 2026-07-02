'use server';

import { authFetch, getAuthToken } from './base';
import type { TestFisico, Dolencia, PaginatedResponse } from '@/features/atleta/types/atleta.types';

// ===================================
// TESTS FISICOS
// ===================================

export interface FetchTestsFisicosParams {
  page?: number;
  limit?: number;
  atletaId?: string;
  microcicloId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  asistio?: string;
}

// Obtener lista paginada de tests fisicos
// COMITE_TECNICO ve todos los tests
export async function fetchTestsFisicos(
  params: FetchTestsFisicosParams = {}
): Promise<PaginatedResponse<TestFisico> | null> {
  try {
    const token = await getAuthToken();

    if (!token) {
      console.error('[fetchTestsFisicos] No autenticado');
      return null;
    }

    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.atletaId) searchParams.set('atletaId', params.atletaId);
    if (params.microcicloId) searchParams.set('microcicloId', params.microcicloId);
    if (params.fechaDesde) searchParams.set('fechaDesde', params.fechaDesde);
    if (params.fechaHasta) searchParams.set('fechaHasta', params.fechaHasta);
    if (params.asistio) searchParams.set('asistio', params.asistio);

    const queryString = searchParams.toString();
    const endpoint = `/tests-fisicos${queryString ? `?${queryString}` : ''}`;

    const response = await authFetch(endpoint);

    if (!response.ok) {
      console.error('[fetchTestsFisicos] Error:', response.status);
      return null;
    }

    const data = await response.json();
    return data as PaginatedResponse<TestFisico>;
  } catch (error) {
    console.error('[fetchTestsFisicos] Error:', error);
    return null;
  }
}

// Obtener detalle de un test fisico por ID
export async function fetchTestFisico(id: string): Promise<TestFisico | null> {
  try {
    const token = await getAuthToken();

    if (!token) {
      console.error('[fetchTestFisico] No autenticado');
      return null;
    }

    const response = await authFetch(`/tests-fisicos/${id}`);

    if (!response.ok) {
      console.error('[fetchTestFisico] Error:', response.status);
      return null;
    }

    const data = await response.json();
    return data as TestFisico;
  } catch (error) {
    console.error('[fetchTestFisico] Error:', error);
    return null;
  }
}

// Obtener tests de un atleta especifico
export async function fetchTestsByAtleta(atletaId: string): Promise<TestFisico[] | null> {
  try {
    const token = await getAuthToken();

    if (!token) {
      console.error('[fetchTestsByAtleta] No autenticado');
      return null;
    }

    const response = await authFetch(`/tests-fisicos/atleta/${atletaId}`);

    if (!response.ok) {
      console.error('[fetchTestsByAtleta] Error:', response.status);
      return null;
    }

    const data = await response.json();
    return data as TestFisico[];
  } catch (error) {
    console.error('[fetchTestsByAtleta] Error:', error);
    return null;
  }
}

// ===================================
// DOLENCIAS
// ===================================

export interface FetchDolenciasParams {
  page?: number;
  limit?: number;
  atletaId?: string;
  recuperado?: boolean;
}

// Obtener lista paginada de dolencias
// COMITE_TECNICO ve todas las dolencias
export async function fetchDolencias(
  params: FetchDolenciasParams = {}
): Promise<PaginatedResponse<Dolencia> | null> {
  try {
    const token = await getAuthToken();

    if (!token) {
      console.error('[fetchDolencias] No autenticado');
      return null;
    }

    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.atletaId) searchParams.set('atletaId', params.atletaId);
    if (params.recuperado !== undefined) searchParams.set('recuperado', params.recuperado.toString());

    const queryString = searchParams.toString();
    const endpoint = `/dolencias${queryString ? `?${queryString}` : ''}`;

    const response = await authFetch(endpoint);

    if (!response.ok) {
      console.error('[fetchDolencias] Error:', response.status);
      return null;
    }

    const data = await response.json();
    return data as PaginatedResponse<Dolencia>;
  } catch (error) {
    console.error('[fetchDolencias] Error:', error);
    return null;
  }
}

// Obtener detalle de una dolencia por ID
export async function fetchDolencia(id: string): Promise<Dolencia | null> {
  try {
    const token = await getAuthToken();

    if (!token) {
      console.error('[fetchDolencia] No autenticado');
      return null;
    }

    const response = await authFetch(`/dolencias/${id}`);

    if (!response.ok) {
      console.error('[fetchDolencia] Error:', response.status);
      return null;
    }

    const data = await response.json();
    return data as Dolencia;
  } catch (error) {
    console.error('[fetchDolencia] Error:', error);
    return null;
  }
}

// Obtener dolencias activas de un atleta especifico
export async function fetchDolenciasActivasByAtleta(atletaId: string): Promise<Dolencia[] | null> {
  try {
    const token = await getAuthToken();

    if (!token) {
      console.error('[fetchDolenciasActivasByAtleta] No autenticado');
      return null;
    }

    const response = await authFetch(`/dolencias/atleta/${atletaId}/activas`);

    if (!response.ok) {
      console.error('[fetchDolenciasActivasByAtleta] Error:', response.status);
      return null;
    }

    const data = await response.json();
    return data as Dolencia[];
  } catch (error) {
    console.error('[fetchDolenciasActivasByAtleta] Error:', error);
    return null;
  }
}
