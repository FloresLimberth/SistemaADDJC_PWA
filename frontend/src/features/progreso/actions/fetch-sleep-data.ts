'use server';

import { getCurrentUserAction } from '@/app/actions/auth.actions';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { registroPostEntrenamientoSchema } from '@/features/atleta/types/atleta.types';
import type { SleepDataPoint } from '../types/progreso.types';

// Server Action para obtener datos de sueno (calidad + horas)
// Endpoint: GET /api/registros-post-entrenamiento
// Verificado en: backend/src/modules/registro-post-entrenamiento/registro-post-entrenamiento.controller.ts (línea 42)
// Filtrado automático por JWT para ATLETA (líneas 329-336 del service)
export async function fetchSleepData(): Promise<SleepDataPoint[] | null> {
  try {
    // Obtener el usuario actual
    const userResult = await getCurrentUserAction();

    if (!userResult.success || !userResult.user) {
      console.error('[fetchSleepData] Usuario no autenticado');
      return null;
    }

    const user = userResult.user;
    console.log('[fetchSleepData] Usuario autenticado:', user.email, 'ID:', user.id);

    // Obtener el token
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      console.error('[fetchSleepData] No se encontró token');
      return null;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

    // Obtener registros post-entrenamiento
    // Usamos limit=50 para obtener datos del último mes aproximadamente
    const response = await fetch(`${API_URL}/registros-post-entrenamiento?page=1&limit=50`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      console.error('[fetchSleepData] Error obteniendo registros:', response.status);
      const errorText = await response.text();
      console.error('[fetchSleepData] Error detalle:', errorText);
      return null;
    }

    const resultData = await response.json();
    console.log('[fetchSleepData] Registros obtenidos:', resultData.data?.length || 0);

    // Validar con Zod
    const validationResult = z.array(registroPostEntrenamientoSchema).safeParse(resultData.data || []);

    if (!validationResult.success) {
      console.error('[fetchSleepData] Error de validacion:', validationResult.error.issues);
      if (process.env.NODE_ENV === 'development') {
        console.error('[fetchSleepData] Datos que fallaron validacion:', JSON.stringify(resultData.data, null, 2));
      }
      return null;
    }

    const registros = validationResult.data;

    if (registros.length === 0) {
      console.log('[fetchSleepData] No hay registros disponibles');
      return [];
    }

    // Transformar datos para el gráfico
    const sleepData: SleepDataPoint[] = registros
      .map(registro => {
        const fecha = new Date(registro.fechaRegistro);

        return {
          fecha: fecha.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short'
          }),
          timestamp: fecha.getTime(),
          calidadSueno: registro.calidadSueno,
          // horasSueno ya viene como number desde backend (corregido)
          horasSueno: registro.horasSueno ?? 0,
        };
      })
      .sort((a, b) => a.timestamp - b.timestamp); // Ordenar cronológicamente

    console.log('[fetchSleepData] Puntos de datos de sueño:', sleepData.length);

    return sleepData;

  } catch (error) {
    console.error('[fetchSleepData] Error:', error);
    return null;
  }
}
