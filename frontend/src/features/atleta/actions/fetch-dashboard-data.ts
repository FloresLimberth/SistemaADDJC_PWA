'use server';

import { getCurrentUserAction } from '@/app/actions/auth.actions';
import { cookies } from 'next/headers';
import { z } from 'zod';
import {
  testFisicoSchema,
  microcicloSchema,
  dolenciaSchema,
} from '@/features/atleta/types/atleta.types';

// Tipo para la proxima sesion
export interface ProximaSesion {
  fecha: string;
  diaSemana: string;
  tipoSesion: string;
  horaFormateada: string; // Ej: "Lunes 14:00" o "Sin planificar"
}

// Tipo para las estadisticas del dashboard
export interface DashboardStats {
  testsRecientes: number;
  vo2maxActual: number | null;
  proximaSesion: ProximaSesion | null;
  dolenciasActivas: number;
}

// Tipo para la respuesta completa del dashboard
export interface DashboardData {
  stats: DashboardStats;
  tests: any[];
  planificacion: any[];
  notificaciones: any[];
  notificacionesNoLeidas: number;
  dolencias: any[];
}

// Server Action para obtener todos los datos del dashboard del atleta
export async function fetchDashboardData(): Promise<DashboardData | null> {
  try {
    // Obtener el usuario actual
    const userResult = await getCurrentUserAction();

    if (!userResult.success || !userResult.user) {
      console.error('[fetchDashboardData] Usuario no autenticado');
      return null;
    }

    const user = userResult.user;
    console.log('[fetchDashboardData] Usuario autenticado:', user.email, 'Rol:', user.rol);

    // Obtener token de las cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      console.error('[fetchDashboardData] No se encontro token');
      return null;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

    // Hacer peticiones en paralelo a los 3 endpoints
    // IMPORTANTE: Los endpoints se filtran automaticamente por el usuario autenticado
    const [testsResponse, microciclosResponse, dolenciasResponse, notificacionesResponse] =
      await Promise.all([
        // Obtener todos los tests fisicos del atleta autenticado
        // Endpoint: GET /tests-fisicos/me (solo para ATLETA)
        fetch(`${API_URL}/tests-fisicos/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }).catch(() => null),

        // Obtener microciclos asignados al atleta (con sesiones incluidas)
        // Endpoint: GET /microciclos (filtrado automatico por rol ATLETA)
        fetch(`${API_URL}/microciclos?page=1&limit=10`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }).catch(() => null),

        // Obtener dolencias activas del atleta
        // Endpoint: GET /dolencias (filtrado automatico por rol ATLETA)
        fetch(`${API_URL}/dolencias?recuperado=false&page=1&limit=10`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }).catch(() => null),

        // Obtener notificaciones recientes del atleta (las 5 mas recientes no leidas)
        // Endpoint: GET /notificaciones (filtrado automatico por usuario)
        fetch(`${API_URL}/notificaciones?soloNoLeidas=true&page=1&limit=5`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }).catch(() => null),
      ]);

    // Parsear respuestas JSON de forma segura
    // /tests-fisicos/me devuelve array directo
    const testsData = testsResponse?.ok ? await testsResponse.json() : [];

    // /microciclos y /dolencias devuelven estructura paginada { data: [...], meta: {...} }
    const microciclosResult = microciclosResponse?.ok ? await microciclosResponse.json() : { data: [] };
    const planificacionData = microciclosResult.data || [];

    const dolenciasResult = dolenciasResponse?.ok ? await dolenciasResponse.json() : { data: [] };
    const dolenciasData = dolenciasResult.data || [];

    // /notificaciones devuelve estructura paginada { data: [...], meta: { noLeidas, ... } }
    const notificacionesResult = notificacionesResponse?.ok ? await notificacionesResponse.json() : { data: [], meta: { noLeidas: 0 } };
    const notificacionesData = notificacionesResult.data || [];
    const noLeidas: number = notificacionesResult.meta?.noLeidas ?? 0;

    // Validar con Zod
    const testsValidation = z.array(testFisicoSchema).safeParse(testsData);
    const planificacionValidation = z.array(microcicloSchema).safeParse(planificacionData);
    const dolenciasValidation = z.array(dolenciaSchema).safeParse(dolenciasData);

    // Verificar errores de validacion
    if (!testsValidation.success) {
      console.error('[fetchDashboardData] Error validando tests:', testsValidation.error.issues);
      if (process.env.NODE_ENV === 'development') {
        console.error('[fetchDashboardData] Datos de tests:', JSON.stringify(testsData, null, 2));
      }
    }

    if (!planificacionValidation.success) {
      console.error('[fetchDashboardData] Error validando planificacion:', planificacionValidation.error.issues);
      if (process.env.NODE_ENV === 'development') {
        console.error('[fetchDashboardData] Datos de planificacion:', JSON.stringify(planificacionData, null, 2));
      }
    }

    if (!dolenciasValidation.success) {
      console.error('[fetchDashboardData] Error validando dolencias:', dolenciasValidation.error.issues);
      if (process.env.NODE_ENV === 'development') {
        console.error('[fetchDashboardData] Datos de dolencias:', JSON.stringify(dolenciasData, null, 2));
      }
    }

    // Usar datos validados (o arrays vacios si fallo la validacion)
    const tests = testsValidation.success ? testsValidation.data : [];
    const planificacion = planificacionValidation.success ? planificacionValidation.data : [];
    const dolencias = dolenciasValidation.success ? dolenciasValidation.data : [];

    console.log('[fetchDashboardData] Tests obtenidos:', tests.length || 0);
    console.log('[fetchDashboardData] Microciclos obtenidos:', planificacion.length || 0);
    console.log('[fetchDashboardData] Dolencias obtenidas:', dolencias.length || 0);

    // Calcular tests recientes (ultimos 30 dias)
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - 30);

    const testsRecientes = tests.filter((test: any) => {
      const fechaTest = new Date(test.fechaTest);
      return fechaTest >= fechaLimite;
    });

    // Calcular VO2max actual (del ultimo test de Course Navette)
    // Formula: VO2max = 30 + (palier * 2)
    const testsNavette = tests
      .filter((test: any) => test.navettePalier !== null)
      .sort((a: any, b: any) => {
        const fechaA = new Date(a.fechaTest).getTime();
        const fechaB = new Date(b.fechaTest).getTime();
        return fechaB - fechaA; // Mas reciente primero
      });

    const vo2maxActual = testsNavette.length > 0 && testsNavette[0].navetteVO2max
      ? parseFloat(testsNavette[0].navetteVO2max)
      : null;

    // Calcular proxima sesion programada
    // Buscar la sesion mas cercana en el futuro desde todos los microciclos
    const ahora = new Date();
    const todasSesiones = planificacion.flatMap((microciclo: any) =>
      (microciclo.sesiones || []).map((sesion: any) => ({
        ...sesion,
        microcicloId: microciclo.id,
      }))
    );

    // Filtrar sesiones futuras y ordenar por fecha ascendente
    const sesionesFuturas = todasSesiones
      .filter((sesion: any) => new Date(sesion.fecha) > ahora)
      .sort((a: any, b: any) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

    const proximaSesion: ProximaSesion | null = sesionesFuturas.length > 0
      ? {
          fecha: sesionesFuturas[0].fecha,
          diaSemana: sesionesFuturas[0].diaSemana,
          tipoSesion: sesionesFuturas[0].tipoSesion,
          horaFormateada: `${sesionesFuturas[0].diaSemana}`,
        }
      : null;

    console.log('[fetchDashboardData] Proxima sesion:', proximaSesion);

    // Construir las estadisticas
    const stats: DashboardStats = {
      testsRecientes: testsRecientes.length,
      vo2maxActual,
      proximaSesion,
      dolenciasActivas: dolencias.length,
    };

    console.log('[fetchDashboardData] Estadisticas calculadas:', stats);

    // Retornar los datos
    return {
      stats,
      tests: tests.slice(0, 10), // Solo los ultimos 10 tests
      planificacion: planificacion.slice(0, 5), // Solo los proximos 5 microciclos
      notificaciones: notificacionesData.slice(0, 5),
      notificacionesNoLeidas: noLeidas,
      dolencias,
    };
  } catch (error) {
    console.error('[fetchDashboardData] Error:', error);
    return null;
  }
}
