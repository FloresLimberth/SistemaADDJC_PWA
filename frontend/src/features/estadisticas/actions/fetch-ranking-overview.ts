'use server';

import { authFetch } from '@/features/comite-tecnico/actions/base';
import type { RankingGlobal, EstadisticasRanking, RankingAtleta } from '@/features/algoritmo/types/algoritmo.types';

// Resumen de un atleta para el chart de ranking comparativo
export interface RankingAtletaResumen {
  atletaId: string;
  nombreCompleto: string;
  categoriaPeso: string;
  puntuacion: number;
  aptoPara: 'COMPETIR' | 'RESERVA' | 'NO_APTO';
}

// Estadisticas por categoria para chart de aptitud
export interface EstadisticaCategoria {
  categoria: string;
  totalAtletas: number;
  aptos: number;
  reservas: number;
  noAptos: number;
  mejorPuntuacion: number;
}

// Respuesta combinada del overview
export interface RankingOverviewData {
  atletas: RankingAtletaResumen[];
  estadisticasCategorias: EstadisticaCategoria[];
  totalGeneral: number;
}

// Obtener datos de ranking global + estadisticas por categoria en paralelo
export async function fetchRankingOverview(): Promise<RankingOverviewData | null> {
  try {
    const [rankingResponse, statsResponse] = await Promise.all([
      authFetch('/ranking'),
      authFetch('/ranking/estadisticas'),
    ]);

    if (!rankingResponse.ok || !statsResponse.ok) {
      console.error('[fetchRankingOverview] Error:', rankingResponse.status, statsResponse.status);
      return null;
    }

    const [rankingData, statsData]: [RankingGlobal, EstadisticasRanking] = await Promise.all([
      rankingResponse.json(),
      statsResponse.json(),
    ]);

    // Extraer todos los atletas del ranking global (aplanar categorias)
    const atletas: RankingAtletaResumen[] = [];
    for (const categoria of Object.values(rankingData)) {
      for (const atleta of (categoria.ranking || [])) {
        atletas.push({
          atletaId: atleta.atletaId,
          nombreCompleto: atleta.nombreCompleto,
          categoriaPeso: atleta.categoriaPeso,
          puntuacion: atleta.puntuacion,
          aptoPara: atleta.aptoPara,
        });
      }
    }

    // Ordenar por puntuacion descendente
    atletas.sort((a, b) => b.puntuacion - a.puntuacion);

    return {
      atletas,
      estadisticasCategorias: statsData.estadisticas || [],
      totalGeneral: statsData.totalGeneral || 0,
    };
  } catch (error) {
    console.error('[fetchRankingOverview] Error:', error);
    return null;
  }
}
