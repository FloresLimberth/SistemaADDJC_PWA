'use server';

import { authFetch, getAuthToken } from './base';
import type { AtletaEstadisticas, AtletaEvolucion, TipoTest } from './estadisticas.types';

// Re-export types for convenience
export type { AtletaEstadisticas, AtletaEvolucion, TipoTest };

// Obtener estadisticas de un atleta para un tipo de test
export async function fetchAtletaEstadisticas(
  atletaId: string,
  tipoTest: string
): Promise<AtletaEstadisticas | null> {
  try {
    const token = await getAuthToken();

    if (!token) {
      console.error('[fetchAtletaEstadisticas] No autenticado');
      return null;
    }

    const response = await authFetch(
      `/tests-fisicos/atleta/${atletaId}/estadisticas?tipoTest=${tipoTest}`
    );

    if (!response.ok) {
      console.error('[fetchAtletaEstadisticas] Error:', response.status);
      return null;
    }

    const data = await response.json();
    return data as AtletaEstadisticas;
  } catch (error) {
    console.error('[fetchAtletaEstadisticas] Error:', error);
    return null;
  }
}

// Obtener evolucion temporal de un atleta para un tipo de test
export async function fetchAtletaEvolucion(
  atletaId: string,
  tipoTest: string
): Promise<AtletaEvolucion | null> {
  try {
    const token = await getAuthToken();

    if (!token) {
      console.error('[fetchAtletaEvolucion] No autenticado');
      return null;
    }

    const response = await authFetch(
      `/tests-fisicos/atleta/${atletaId}/evolution?tipoTest=${tipoTest}`
    );

    if (!response.ok) {
      console.error('[fetchAtletaEvolucion] Error:', response.status);
      return null;
    }

    const data = await response.json();
    return data as AtletaEvolucion;
  } catch (error) {
    console.error('[fetchAtletaEvolucion] Error:', error);
    return null;
  }
}

// Obtener multiples estadisticas de un atleta (todos los tipos de test)
export async function fetchAtletaEstadisticasCompletas(
  atletaId: string
): Promise<Record<string, AtletaEstadisticas | null>> {
  // Lista de tipos de test (hardcoded para evitar importar constante en 'use server')
  const tiposTest = [
    'pressBanca',
    'tiron',
    'sentadilla',
    'barraFija',
    'paralelas',
    'navette',
  ];

  const resultados: Record<string, AtletaEstadisticas | null> = {};

  // Obtener estadisticas para cada tipo de test en paralelo
  const promesas = tiposTest.map(async (tipo) => {
    const stats = await fetchAtletaEstadisticas(atletaId, tipo);
    return { tipo, stats };
  });

  const results = await Promise.all(promesas);

  for (const result of results) {
    resultados[result.tipo] = result.stats;
  }

  return resultados;
}
