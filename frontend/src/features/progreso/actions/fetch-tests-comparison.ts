'use server';

import { getCurrentUserAction } from '@/app/actions/auth.actions';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { testFisicoSchema } from '@/features/atleta/types/atleta.types';
import type { TestsComparisonDataPoint } from '../types/progreso.types';

type TestFisico = z.infer<typeof testFisicoSchema>;

// Helper para calcular mejores marcas históricas
function calculateBestMarks(tests: TestFisico[]) {
  const best = {
    pressBanca: 0,
    sentadilla: 0,
    tiron: 0,
    barraFija: 0,
    paralelas: 0,
  };

  tests.forEach(test => {
    if (test.pressBanca) {
      const valor = parseFloat(test.pressBanca);
      if (valor > best.pressBanca) best.pressBanca = valor;
    }
    if (test.sentadilla) {
      const valor = parseFloat(test.sentadilla);
      if (valor > best.sentadilla) best.sentadilla = valor;
    }
    if (test.tiron) {
      const valor = parseFloat(test.tiron);
      if (valor > best.tiron) best.tiron = valor;
    }
    if (test.barraFija && test.barraFija > best.barraFija) {
      best.barraFija = test.barraFija;
    }
    if (test.paralelas && test.paralelas > best.paralelas) {
      best.paralelas = test.paralelas;
    }
  });

  return best;
}

// Server Action para obtener comparación de tests físicos
// Endpoint: GET /api/tests-fisicos/me
// Verificado en: backend/src/modules/testing/controllers/tests-fisicos.controller.ts (línea 159)
export async function fetchTestsComparison(): Promise<TestsComparisonDataPoint[] | null> {
  try {
    // Obtener el usuario actual
    const userResult = await getCurrentUserAction();

    if (!userResult.success || !userResult.user) {
      console.error('[fetchTestsComparison] Usuario no autenticado');
      return null;
    }

    const user = userResult.user;
    console.log('[fetchTestsComparison] Usuario autenticado:', user.email, 'ID:', user.id);

    // Obtener el token
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      console.error('[fetchTestsComparison] No se encontró token');
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
      console.error('[fetchTestsComparison] Error obteniendo tests:', testsResponse.status);
      const errorText = await testsResponse.text();
      console.error('[fetchTestsComparison] Error detalle:', errorText);
      return null;
    }

    const testsData = await testsResponse.json();
    console.log('[fetchTestsComparison] Tests obtenidos:', testsData.length || 0);

    // Validar con Zod
    const validationResult = z.array(testFisicoSchema).safeParse(testsData);

    if (!validationResult.success) {
      console.error('[fetchTestsComparison] Error de validacion:', validationResult.error.issues);
      if (process.env.NODE_ENV === 'development') {
        console.error('[fetchTestsComparison] Datos que fallaron validacion:', JSON.stringify(testsData, null, 2));
      }
      return null;
    }

    const tests = validationResult.data;

    if (tests.length === 0) {
      console.log('[fetchTestsComparison] No hay tests disponibles');
      return [];
    }

    // 3. Ordenar por fecha (más reciente primero)
    const sortedTests = [...tests].sort((a, b) =>
      new Date(b.fechaTest).getTime() - new Date(a.fechaTest).getTime()
    );

    const latest = sortedTests[0]; // Último test
    const best = calculateBestMarks(tests); // Mejores marcas históricas

    // 4. Crear datos para el gráfico de comparación
    const comparison: TestsComparisonDataPoint[] = [];

    // Press Banca
    if (latest.pressBanca || best.pressBanca > 0) {
      comparison.push({
        nombre: 'Press Banca',
        actual: latest.pressBanca ? parseFloat(latest.pressBanca) : 0,
        mejor: best.pressBanca,
        unidad: 'kg',
      });
    }

    // Sentadilla
    if (latest.sentadilla || best.sentadilla > 0) {
      comparison.push({
        nombre: 'Sentadilla',
        actual: latest.sentadilla ? parseFloat(latest.sentadilla) : 0,
        mejor: best.sentadilla,
        unidad: 'kg',
      });
    }

    // Tirón
    if (latest.tiron || best.tiron > 0) {
      comparison.push({
        nombre: 'Tirón',
        actual: latest.tiron ? parseFloat(latest.tiron) : 0,
        mejor: best.tiron,
        unidad: 'kg',
      });
    }

    // Barra Fija
    if (latest.barraFija || best.barraFija > 0) {
      comparison.push({
        nombre: 'Barra Fija',
        actual: latest.barraFija || 0,
        mejor: best.barraFija,
        unidad: 'reps',
      });
    }

    // Paralelas
    if (latest.paralelas || best.paralelas > 0) {
      comparison.push({
        nombre: 'Paralelas',
        actual: latest.paralelas || 0,
        mejor: best.paralelas,
        unidad: 'reps',
      });
    }

    console.log('[fetchTestsComparison] Comparaciones creadas:', comparison.length);

    return comparison;

  } catch (error) {
    console.error('[fetchTestsComparison] Error:', error);
    return null;
  }
}
