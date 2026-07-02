'use server';

import { authFetch, getAuthToken } from './base';
import type {
  CatalogoEjerciciosResponse,
  EjerciciosPorTipoResponse,
} from '../types/algoritmo.types';

// Parametros para listar ejercicios del catalogo
export interface FetchCatalogoParams {
  tipo?: string;
  dificultad?: number; // 1=Facil, 2=Intermedio, 3=Avanzado
  activo?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

// Listar ejercicios del catalogo con filtros
// Verificado: catalogo-ejercicios.controller.ts GET /catalogo-ejercicios
// Query: tipo, activo (default true), search
// Roles: COMITE_TECNICO, ENTRENADOR
export async function fetchCatalogoEjercicios(
  params: FetchCatalogoParams = {}
): Promise<CatalogoEjerciciosResponse | null> {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.error('[fetchCatalogoEjercicios] No autenticado');
      return null;
    }

    const searchParams = new URLSearchParams();
    if (params.tipo) searchParams.set('tipo', params.tipo);
    if (params.dificultad) searchParams.set('dificultad', params.dificultad.toString());
    if (params.activo === false) searchParams.set('activo', 'false');
    if (params.search) searchParams.set('search', params.search);
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());

    const queryString = searchParams.toString();
    const endpoint = `/catalogo-ejercicios${queryString ? `?${queryString}` : ''}`;

    const response = await authFetch(endpoint);

    if (!response.ok) {
      console.error('[fetchCatalogoEjercicios] Error:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('[fetchCatalogoEjercicios] Error:', error);
    return null;
  }
}

// Listar ejercicios agrupados por tipo
// Verificado: catalogo-ejercicios.controller.ts GET /catalogo-ejercicios/por-tipo
// Roles: COMITE_TECNICO, ENTRENADOR
export async function fetchEjerciciosPorTipo(): Promise<EjerciciosPorTipoResponse | null> {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.error('[fetchEjerciciosPorTipo] No autenticado');
      return null;
    }

    const response = await authFetch('/catalogo-ejercicios/por-tipo');

    if (!response.ok) {
      console.error('[fetchEjerciciosPorTipo] Error:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('[fetchEjerciciosPorTipo] Error:', error);
    return null;
  }
}
