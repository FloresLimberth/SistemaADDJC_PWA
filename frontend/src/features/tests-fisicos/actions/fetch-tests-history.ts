'use server';

import { getCurrentUserAction } from '@/app/actions/auth.actions';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { testFisicoSchema } from '@/features/atleta/types/atleta.types';

// Server Action para obtener el historial completo de tests fisicos del atleta
export async function fetchTestsHistory() {
  try {
    // Obtener el usuario actual
    const userResult = await getCurrentUserAction();

    if (!userResult.success || !userResult.user) {
      console.error('[fetchTestsHistory] Usuario no autenticado');
      return null;
    }

    const user = userResult.user;
    console.log('[fetchTestsHistory] Usuario autenticado:', user.email, 'ID:', user.id);

    // Obtener el token para hacer la peticion
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      console.error('[fetchTestsHistory] No se encontro token');
      return null;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

    // Llamar al endpoint del backend
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
      console.error('[fetchTestsHistory] Error en respuesta:', testsResponse.status);
      const errorText = await testsResponse.text();
      console.error('[fetchTestsHistory] Error detalle:', errorText);
      return null;
    }

    const testsData = await testsResponse.json();
    console.log('[fetchTestsHistory] Tests obtenidos:', testsData?.length || 0);

    // Validar la respuesta con Zod
    const validationResult = z.array(testFisicoSchema).safeParse(testsData);

    if (!validationResult.success) {
      console.error('[fetchTestsHistory] Error de validacion:', validationResult.error.issues);
      // En desarrollo mostramos el error, en produccion retornamos null por seguridad
      if (process.env.NODE_ENV === 'development') {
        console.error('[fetchTestsHistory] Datos que fallaron validacion:', JSON.stringify(testsData, null, 2));
      }
      return null;
    }

    const tests = validationResult.data;

    return {
      tests,
      total: tests.length,
    };
  } catch (error) {
    console.error('[fetchTestsHistory] Error:', error);
    return null;
  }
}
