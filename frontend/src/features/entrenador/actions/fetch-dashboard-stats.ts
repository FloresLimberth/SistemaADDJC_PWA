'use server';

import { cookies } from 'next/headers';
import {
  EntrenadorDashboardStats,
  entrenadorDashboardStatsSchema,
} from '../types/entrenador.types';

// Server Action para obtener estadisticas del dashboard del entrenador
// Endpoints consultados:
// - GET /atletas (filtrado automatico por entrenador)
// - GET /tests-fisicos (filtrado automatico por entrenador)
// - GET /registros-post-entrenamiento (filtrado automatico por entrenador)
// - GET /dolencias?recuperado=false (filtrado automatico por entrenador)
export async function fetchEntrenadorDashboard(): Promise<EntrenadorDashboardStats | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      console.error('[fetchEntrenadorDashboard] No se encontro token');
      return null;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

    // Hacer peticiones en paralelo
    // El backend filtra automaticamente por el entrenador logueado
    const [atletasResponse, testsResponse, registrosResponse, dolenciasResponse] =
      await Promise.all([
        // Contar atletas asignados
        fetch(`${API_URL}/atletas?page=1&limit=1`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        }).catch(() => null),

        // Contar tests fisicos (todos, luego filtramos por mes)
        fetch(`${API_URL}/tests-fisicos?page=1&limit=100`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        }).catch(() => null),

        // Contar registros (todos, luego filtramos por hoy)
        fetch(`${API_URL}/registros-post-entrenamiento?page=1&limit=100`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        }).catch(() => null),

        // Contar dolencias activas (recuperado=false)
        fetch(`${API_URL}/dolencias?recuperado=false&page=1&limit=1`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        }).catch(() => null),
      ]);

    // Parsear respuestas (formato paginado: { data: [...], meta: { total } })
    const atletasResult = atletasResponse?.ok ? await atletasResponse.json() : { meta: { total: 0 } };
    const testsResult = testsResponse?.ok ? await testsResponse.json() : { data: [], meta: { total: 0 } };
    const registrosResult = registrosResponse?.ok ? await registrosResponse.json() : { data: [], meta: { total: 0 } };
    const dolenciasResult = dolenciasResponse?.ok ? await dolenciasResponse.json() : { meta: { total: 0 } };

    // Calcular tests de este mes
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const testsEsteMes = (testsResult.data || []).filter((test: any) => {
      const fechaTest = new Date(test.fechaTest);
      return fechaTest >= inicioMes;
    }).length;

    // Calcular registros de hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const registrosHoy = (registrosResult.data || []).filter((registro: any) => {
      const fechaRegistro = new Date(registro.fechaRegistro);
      fechaRegistro.setHours(0, 0, 0, 0);
      return fechaRegistro.getTime() === hoy.getTime();
    }).length;

    // Construir estadisticas
    const stats: EntrenadorDashboardStats = {
      totalAtletas: atletasResult.meta?.total || 0,
      testsEsteMes,
      registrosHoy,
      dolenciasActivas: dolenciasResult.meta?.total || 0,
    };

    // Validar con Zod
    const validation = entrenadorDashboardStatsSchema.safeParse(stats);

    if (!validation.success) {
      console.error('[fetchEntrenadorDashboard] Error de validacion:', validation.error.issues);
      // Retornar valores por defecto
      return {
        totalAtletas: 0,
        testsEsteMes: 0,
        registrosHoy: 0,
        dolenciasActivas: 0,
      };
    }

    console.log('[fetchEntrenadorDashboard] Stats:', validation.data);
    return validation.data;
  } catch (error) {
    console.error('[fetchEntrenadorDashboard] Error:', error);
    return null;
  }
}
