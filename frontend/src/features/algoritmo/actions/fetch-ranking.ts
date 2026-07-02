'use server';

import { authFetch, getAuthToken } from './base';
import type {
  RankingGlobal,
  RankingCategoria,
  RankingIndividual,
  MejoresAtletas,
  EstadisticasRanking,
} from '../types/algoritmo.types';

// Obtener ranking global (todas las categorias)
// Verificado: ranking.controller.ts GET /ranking
// Roles: COMITE_TECNICO
export async function fetchRankingGlobal(): Promise<RankingGlobal | null> {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.error('[fetchRankingGlobal] No autenticado');
      return null;
    }

    const response = await authFetch('/ranking');

    if (!response.ok) {
      console.error('[fetchRankingGlobal] Error:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('[fetchRankingGlobal] Error:', error);
    return null;
  }
}

// Obtener ranking de una categoria de peso
// Verificado: ranking.controller.ts GET /ranking/categoria/:categoria
// Roles: COMITE_TECNICO, ENTRENADOR
export async function fetchRankingCategoria(
  categoria: string
): Promise<RankingCategoria | null> {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.error('[fetchRankingCategoria] No autenticado');
      return null;
    }

    const response = await authFetch(`/ranking/categoria/${categoria}`);

    if (!response.ok) {
      console.error('[fetchRankingCategoria] Error:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('[fetchRankingCategoria] Error:', error);
    return null;
  }
}

// Obtener top N mejores atletas de una categoria
// Verificado: ranking.controller.ts GET /ranking/categoria/:categoria/mejores
// Query: cantidad (5-20)
// Roles: COMITE_TECNICO, ENTRENADOR
export async function fetchMejoresCategoria(
  categoria: string,
  cantidad: number = 5
): Promise<MejoresAtletas | null> {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.error('[fetchMejoresCategoria] No autenticado');
      return null;
    }

    const response = await authFetch(
      `/ranking/categoria/${categoria}/mejores?cantidad=${cantidad}`
    );

    if (!response.ok) {
      console.error('[fetchMejoresCategoria] Error:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('[fetchMejoresCategoria] Error:', error);
    return null;
  }
}

// Obtener ranking de un atleta especifico
// Verificado: ranking.controller.ts GET /ranking/atleta/:id
// Roles: COMITE_TECNICO, ENTRENADOR, ATLETA
export async function fetchRankingAtleta(
  atletaId: string
): Promise<RankingIndividual | null> {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.error('[fetchRankingAtleta] No autenticado');
      return null;
    }

    const response = await authFetch(`/ranking/atleta/${atletaId}`);

    if (!response.ok) {
      console.error('[fetchRankingAtleta] Error:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('[fetchRankingAtleta] Error:', error);
    return null;
  }
}

// Obtener mi ranking (solo para ATLETA)
// Verificado: ranking.controller.ts GET /ranking/mi-ranking
// Roles: ATLETA
export async function fetchMiRanking(): Promise<RankingIndividual | null> {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.error('[fetchMiRanking] No autenticado');
      return null;
    }

    const response = await authFetch('/ranking/mi-ranking');

    if (!response.ok) {
      console.error('[fetchMiRanking] Error:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('[fetchMiRanking] Error:', error);
    return null;
  }
}

// Obtener estadisticas del ranking
// Verificado: ranking.controller.ts GET /ranking/estadisticas
// Roles: COMITE_TECNICO
export async function fetchRankingEstadisticas(): Promise<EstadisticasRanking | null> {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.error('[fetchRankingEstadisticas] No autenticado');
      return null;
    }

    const response = await authFetch('/ranking/estadisticas');

    if (!response.ok) {
      console.error('[fetchRankingEstadisticas] Error:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('[fetchRankingEstadisticas] Error:', error);
    return null;
  }
}
