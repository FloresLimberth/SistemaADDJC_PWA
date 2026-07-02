'use server';

import { getCurrentUserAction } from '@/app/actions/auth.actions';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { registroPostEntrenamientoSchema } from '@/features/atleta/types/atleta.types';
import type { BienestarDataPoint } from '@/features/estadisticas/actions/fetch-bienestar-atleta';

// Server Action para obtener datos de bienestar integrado del atleta propio
// Reutiliza el tipo BienestarDataPoint del modulo de estadisticas
// Endpoint: GET /api/registros-post-entrenamiento (filtrado por JWT)
export async function fetchBienestarPropio(): Promise<BienestarDataPoint[] | null> {
  try {
    const userResult = await getCurrentUserAction();

    if (!userResult.success || !userResult.user) {
      console.error('[fetchBienestarPropio] Usuario no autenticado');
      return null;
    }

    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      console.error('[fetchBienestarPropio] No se encontro token');
      return null;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

    // Obtener registros post-entrenamiento (ultimos 50)
    const response = await fetch(`${API_URL}/registros-post-entrenamiento?page=1&limit=50`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      console.error('[fetchBienestarPropio] Error:', response.status);
      return null;
    }

    const resultData = await response.json();

    const validationResult = z.array(registroPostEntrenamientoSchema).safeParse(resultData.data || []);

    if (!validationResult.success) {
      console.error('[fetchBienestarPropio] Error de validacion:', validationResult.error.issues);
      return null;
    }

    const registros = validationResult.data;

    if (registros.length === 0) {
      return [];
    }

    // Transformar a BienestarDataPoint (mismo formato que el endpoint de backend)
    const bienestarData: BienestarDataPoint[] = registros
      .map((registro) => ({
        fecha: new Date(registro.fechaRegistro).toISOString(),
        rpe: registro.rpe,
        calidadSueno: registro.calidadSueno,
        estadoAnimico: registro.estadoAnimico,
        horasSueno: registro.horasSueno ?? null,
        dolenciasCount: registro.dolencias?.length ?? 0,
      }))
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

    return bienestarData;
  } catch (error) {
    console.error('[fetchBienestarPropio] Error:', error);
    return null;
  }
}
