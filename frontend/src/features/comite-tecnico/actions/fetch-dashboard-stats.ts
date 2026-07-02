'use server';

import { authFetch, getAuthToken } from './base';
import type { ComiteTecnicoDashboardStats } from '../types/dashboard.types';

// Obtener estadisticas del dashboard para COMITE_TECNICO
// Hace llamadas en paralelo a los endpoints del backend
export async function fetchDashboardStats(): Promise<ComiteTecnicoDashboardStats | null> {
  try {
    const token = await getAuthToken();

    if (!token) {
      console.error('[fetchDashboardStats] No autenticado');
      return null;
    }

    // Hacer todas las llamadas en paralelo con limit=1 para obtener solo el count
    const [
      atletasRes,
      entrenadoresRes,
      macrociclosRes,
      microciclosRes,
      testsRes,
      dolenciasRes,
      recomendacionesRes,
    ] = await Promise.all([
      authFetch('/atletas?page=1&limit=1'),
      authFetch('/entrenadores?page=1&limit=1'),
      authFetch('/macrociclos?page=1&limit=1'),
      authFetch('/microciclos?page=1&limit=1'),
      authFetch('/tests-fisicos?page=1&limit=1'),
      authFetch('/dolencias?page=1&limit=1&recuperado=false'),
      authFetch('/recomendaciones/pendientes?page=1&limit=1'),
    ]);

    // Procesar respuestas en paralelo
    const [atletas, entrenadores, macrociclos, microciclos, tests, dolencias, recomendaciones] = await Promise.all([
      atletasRes.ok ? atletasRes.json() : { meta: { total: 0 } },
      entrenadoresRes.ok ? entrenadoresRes.json() : { meta: { total: 0 } },
      macrociclosRes.ok ? macrociclosRes.json() : { meta: { total: 0 } },
      microciclosRes.ok ? microciclosRes.json() : { meta: { total: 0 } },
      testsRes.ok ? testsRes.json() : { meta: { total: 0 } },
      dolenciasRes.ok ? dolenciasRes.json() : { meta: { total: 0 } },
      recomendacionesRes.ok ? recomendacionesRes.json() : { meta: { total: 0 } },
    ]);

    return {
      totalAtletas: atletas.meta?.total ?? 0,
      totalEntrenadores: entrenadores.meta?.total ?? 0,
      macrociclosActivos: macrociclos.meta?.total ?? 0,
      microciclosEnCurso: microciclos.meta?.total ?? 0,
      testsEsteMes: tests.meta?.total ?? 0,
      recomendacionesPendientes: recomendaciones.meta?.total ?? 0,
      dolenciasActivas: dolencias.meta?.total ?? 0,
    };
  } catch (error) {
    console.error('[fetchDashboardStats] Error:', error);
    return null;
  }
}
