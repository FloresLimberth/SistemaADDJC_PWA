'use server';

import { getCurrentUserAction } from '@/app/actions/auth.actions';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { microcicloSchema } from '@/features/atleta/types/atleta.types';

// Server Action para obtener los microciclos asignados al atleta
export async function fetchPlanificacion() {
  try {
    // Obtener el usuario actual
    const userResult = await getCurrentUserAction();

    if (!userResult.success || !userResult.user) {
      console.error('[fetchPlanificacion] Usuario no autenticado');
      return null;
    }

    const user = userResult.user;
    console.log('[fetchPlanificacion] Usuario autenticado:', user.email, 'ID:', user.id);

    // Obtener el token para hacer la peticion
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      console.error('[fetchPlanificacion] No se encontro token');
      return null;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

    // Llamar al endpoint del backend
    // Endpoint: GET /api/microciclos?page=1&limit=10
    // El backend filtra automaticamente por el rol ATLETA usando el JWT
    // No necesitamos pasar atletaId porque el backend lo obtiene del token
    const response = await fetch(`${API_URL}/microciclos?page=1&limit=10`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      console.error('[fetchPlanificacion] Error en respuesta:', response.status);
      const errorText = await response.text();
      console.error('[fetchPlanificacion] Error detalle:', errorText);
      return null;
    }

    const resultData = await response.json();
    console.log('[fetchPlanificacion] Microciclos obtenidos:', resultData.data?.length || 0);

    // Validar con Zod
    const validationResult = z.array(microcicloSchema).safeParse(resultData.data || []);

    if (!validationResult.success) {
      console.error('[fetchPlanificacion] Error de validacion:', validationResult.error.issues);
      if (process.env.NODE_ENV === 'development') {
        console.error('[fetchPlanificacion] Datos que fallaron validacion:', JSON.stringify(resultData.data, null, 2));
      }
      return null;
    }

    const microciclos = validationResult.data;

    return {
      microciclos,
      total: resultData.meta?.total || 0,
      page: resultData.meta?.page || 1,
      totalPages: resultData.meta?.totalPages || 0,
    };
  } catch (error) {
    console.error('[fetchPlanificacion] Error:', error);
    return null;
  }
}
