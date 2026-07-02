'use server';

import { authFetch } from '@/features/comite-tecnico/actions/base';
import type { RankingIndividual } from '@/features/algoritmo/types/algoritmo.types';

// Re-exportar el tipo para uso en componentes
export type { RankingIndividual };

// Obtener ranking individual de un atleta (score desglosado + posicion)
export async function fetchRankingAtleta(atletaId: string): Promise<RankingIndividual | null> {
  try {
    const response = await authFetch(`/ranking/atleta/${atletaId}`);

    if (!response.ok) {
      console.error('[fetchRankingAtleta] Error:', response.status);
      return null;
    }

    const data = await response.json();
    return data as RankingIndividual;
  } catch (error) {
    console.error('[fetchRankingAtleta] Error:', error);
    return null;
  }
}
