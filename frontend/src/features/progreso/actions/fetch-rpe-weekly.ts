'use server';

import { getCurrentUserAction } from '@/app/actions/auth.actions';
import { cookies } from 'next/headers';
import { z } from 'zod';
import {
  registroPostEntrenamientoSchema,
  type RegistroPostEntrenamiento,
} from '@/features/atleta/types/atleta.types';
import type { RPEWeeklyDataPoint } from '../types/progreso.types';

// Helper para obtener el número de semana del año
function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

// Helper para agrupar registros por semana
function groupByWeek(registros: RegistroPostEntrenamiento[]): RPEWeeklyDataPoint[] {
  const groups: Record<string, {
    rpeTotal: number;
    count: number;
    fechaInicio: Date;
    fechaFin: Date;
  }> = {};

  registros.forEach(registro => {
    const fecha = new Date(registro.fechaRegistro);
    const year = fecha.getFullYear();
    const weekNum = getWeekNumber(fecha);
    const weekKey = `${year}-W${weekNum}`;

    if (!groups[weekKey]) {
      // Calcular fecha de inicio de la semana (lunes)
      const dayOfWeek = fecha.getDay();
      const diff = fecha.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const monday = new Date(fecha.setDate(diff));

      // Fecha fin de la semana (domingo)
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      groups[weekKey] = {
        rpeTotal: 0,
        count: 0,
        fechaInicio: monday,
        fechaFin: sunday,
      };
    }

    groups[weekKey].rpeTotal += registro.rpe;
    groups[weekKey].count++;
  });

  // Convertir a array y calcular promedios
  return Object.entries(groups)
    .map(([weekKey, data]) => ({
      semana: weekKey,
      rpePromedio: data.rpeTotal / data.count,
      sesiones: data.count,
      fechaInicio: data.fechaInicio,
      fechaFin: data.fechaFin,
    }))
    .sort((a, b) => a.fechaInicio.getTime() - b.fechaInicio.getTime());
}

// Server Action para obtener RPE semanal promedio
// Endpoint: GET /api/registros-post-entrenamiento
// Verificado en: backend/src/modules/registro-post-entrenamiento/registro-post-entrenamiento.controller.ts (línea 42)
// Filtrado automático por JWT para ATLETA (líneas 329-336 del service)
export async function fetchRPEWeekly(): Promise<RPEWeeklyDataPoint[] | null> {
  try {
    // Obtener el usuario actual
    const userResult = await getCurrentUserAction();

    if (!userResult.success || !userResult.user) {
      console.error('[fetchRPEWeekly] Usuario no autenticado');
      return null;
    }

    const user = userResult.user;
    console.log('[fetchRPEWeekly] Usuario autenticado:', user.email, 'ID:', user.id);

    // Obtener el token
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      console.error('[fetchRPEWeekly] No se encontró token');
      return null;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

    // Obtener registros post-entrenamiento
    // Usamos limit=100 para obtener datos de las últimas ~20 semanas (asumiendo 5 sesiones/semana)
    // El backend filtra automáticamente por atletaId cuando el rol es ATLETA
    const response = await fetch(`${API_URL}/registros-post-entrenamiento?page=1&limit=100`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      console.error('[fetchRPEWeekly] Error obteniendo registros:', response.status);
      const errorText = await response.text();
      console.error('[fetchRPEWeekly] Error detalle:', errorText);
      return null;
    }

    const resultData = await response.json();
    console.log('[fetchRPEWeekly] Registros obtenidos:', resultData.data?.length || 0);

    // Validar con Zod
    const validationResult = z.array(registroPostEntrenamientoSchema).safeParse(resultData.data || []);

    if (!validationResult.success) {
      console.error('[fetchRPEWeekly] Error de validacion:', validationResult.error.issues);
      if (process.env.NODE_ENV === 'development') {
        console.error('[fetchRPEWeekly] Datos que fallaron validacion:', JSON.stringify(resultData.data, null, 2));
      }
      return null;
    }

    const registros = validationResult.data;

    if (registros.length === 0) {
      console.log('[fetchRPEWeekly] No hay registros disponibles');
      return [];
    }

    // Agrupar por semana y calcular promedios
    const weeklyData = groupByWeek(registros);
    console.log('[fetchRPEWeekly] Semanas procesadas:', weeklyData.length);

    return weeklyData;

  } catch (error) {
    console.error('[fetchRPEWeekly] Error:', error);
    return null;
  }
}
