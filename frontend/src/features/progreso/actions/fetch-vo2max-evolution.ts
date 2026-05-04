'use server';

import { getCurrentUserAction } from '@/app/actions/auth.actions';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { testFisicoSchema } from '@/features/atleta/types/atleta.types';
import type { VO2maxDataPoint } from '../types/progreso.types';

// Server Action para obtener la evolución de VO2max del atleta
// Endpoint: GET /api/tests-fisicos/me
// Verificado en: backend/src/modules/testing/controllers/tests-fisicos.controller.ts (línea 159)
export async function fetchVO2maxEvolution(): Promise<VO2maxDataPoint[] | null> {
  try {
    // Obtener el usuario actual
    const userResult = await getCurrentUserAction();

    if (!userResult.success || !userResult.user) {
      console.error('[fetchVO2maxEvolution] Usuario no autenticado');
      return null;
    }

    const user = userResult.user;
    console.log('[fetchVO2maxEvolution] Usuario autenticado:', user.email, 'ID:', user.id);

    // Obtener el token
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      console.error('[fetchVO2maxEvolution] No se encontró token');
      return null;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

    // Obtener tests físicos del atleta autenticado
    // Endpoint: GET /api/tests-fisicos/me (solo para rol ATLETA)
    // Este endpoint obtiene automaticamente los tests del atleta autenticado
    const testsResponse = await fetch(`${API_URL}/tests-fisicos/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!testsResponse.ok) {
      console.error('[fetchVO2maxEvolution] Error obteniendo tests:', testsResponse.status);
      const errorText = await testsResponse.text();
      console.error('[fetchVO2maxEvolution] Error detalle:', errorText);
      return null;
    }

    const testsData = await testsResponse.json();
    console.log('[fetchVO2maxEvolution] Tests obtenidos:', testsData.length || 0);

    // Validar con Zod
    const validationResult = z.array(testFisicoSchema).safeParse(testsData);

    if (!validationResult.success) {
      console.error('[fetchVO2maxEvolution] Error de validacion:', validationResult.error.issues);
      if (process.env.NODE_ENV === 'development') {
        console.error('[fetchVO2maxEvolution] Datos que fallaron validacion:', JSON.stringify(testsData, null, 2));
      }
      return null;
    }

    const tests = validationResult.data;

    // 3. Filtrar solo tests con VO2max y transformar datos
    const vo2maxData: VO2maxDataPoint[] = tests
      .filter(test => test.navetteVO2max !== null && test.navetteVO2max !== undefined)
      .map(test => ({
        timestamp: new Date(test.fechaTest).getTime(),
        fecha: new Date(test.fechaTest).toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }),
        vo2max: parseFloat(test.navetteVO2max!),
        clasificacion: test.clasificacionVO2max,
        palier: test.navettePalier ? parseFloat(test.navettePalier) : 0,
      }))
      .sort((a, b) => a.timestamp - b.timestamp); // Ordenar cronológicamente

    console.log('[fetchVO2maxEvolution] Puntos de datos VO2max:', vo2maxData.length);

    return vo2maxData;

  } catch (error) {
    console.error('[fetchVO2maxEvolution] Error:', error);
    return null;
  }
}
