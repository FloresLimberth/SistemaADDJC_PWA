'use server';

import { cookies } from 'next/headers';
import { z } from 'zod';

// Schema para validar respuesta de sesiones del backend (GET /sesiones)
const sesionesResponseSchema = z.object({
  data: z.array(z.object({
    id: z.string(),
    fecha: z.coerce.date(),
    numeroSesion: z.number().int(),
    tipoSesion: z.string(),
    duracionPlanificada: z.number().nullable().optional(),
    microciclo: z.object({
      id: z.string(),
      codigoMicrociclo: z.string(),
    }).optional(),
  })),
  meta: z.object({
    total: z.number().int(),
    page: z.number().int(),
    limit: z.number().int(),
  }),
});

// Schema para validar respuesta de sesiones por atleta (GET /sesiones/by-atleta/:atletaId)
const sesionesByAtletaResponseSchema = z.object({
  data: z.array(z.object({
    id: z.string(),
    fecha: z.coerce.date(),
    numeroSesion: z.number().int(),
    tipoSesion: z.string(),
    microcicloId: z.string(),
    microciclo: z.object({
      id: z.string(),
      codigoMicrociclo: z.string(),
      fechaInicio: z.coerce.date(),
      fechaFin: z.coerce.date(),
    }).optional(),
  })),
  meta: z.object({
    atletaId: z.string(),
    microciclosAsignados: z.array(z.string()),
    totalSesiones: z.number().int(),
  }),
});

// Tipo para sesion en selector (version simplificada para dropdown)
export interface SesionParaSelector {
  id: string;
  label: string; // Ej: "Sesion #3 - 25/12/2024 (Entrenamiento)"
  fecha: Date;
  numeroSesion: number;
  tipoSesion: string;
  codigoMicrociclo?: string;
}

// Server Action para obtener sesiones disponibles para el entrenador
// Endpoint: GET /sesiones
export async function fetchSesionesParaSelector(limit: number = 50): Promise<SesionParaSelector[] | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return null;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

    const response = await fetch(`${API_URL}/sesiones?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('[fetchSesionesParaSelector] Error:', response.status);
      return null;
    }

    const data = await response.json();
    const parsed = sesionesResponseSchema.safeParse(data);

    if (!parsed.success) {
      console.error('[fetchSesionesParaSelector] Validation error:', parsed.error.issues);
      return null;
    }

    // Transformar a formato para selector
    const sesiones: SesionParaSelector[] = parsed.data.data.map((s) => {
      const fechaFormateada = s.fecha.toLocaleDateString('es-BO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

      const tipoSesionFormateado = s.tipoSesion.replace(/_/g, ' ');
      const microcicloInfo = s.microciclo ? ` - Micro #${s.microciclo.codigoMicrociclo}` : '';

      return {
        id: s.id,
        label: `Sesion #${s.numeroSesion} - ${fechaFormateada} (${tipoSesionFormateado})${microcicloInfo}`,
        fecha: s.fecha,
        numeroSesion: s.numeroSesion,
        tipoSesion: s.tipoSesion,
        codigoMicrociclo: s.microciclo?.codigoMicrociclo,
      };
    });

    // Ordenar por fecha descendente (mas recientes primero)
    sesiones.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

    return sesiones;
  } catch (error) {
    console.error('[fetchSesionesParaSelector] Error:', error);
    return null;
  }
}

// Server Action para obtener sesiones de un atleta especifico
// Solo devuelve sesiones de microciclos donde el atleta esta asignado
// Endpoint: GET /sesiones/by-atleta/:atletaId
// tipoSesion: Filtro opcional por tipo de sesion (puede ser un valor o array separado por comas)
// Ejemplos: 'TEST' o 'ENTRENAMIENTO,RECUPERACION,COMPETENCIA'
export async function fetchSesionesByAtleta(
  atletaId: string,
  tipoSesion?: string,
): Promise<SesionParaSelector[] | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return null;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

    // Construir query params con filtro de tipo de sesion
    const queryParams = tipoSesion ? `?tipoSesion=${encodeURIComponent(tipoSesion)}` : '';

    const response = await fetch(`${API_URL}/sesiones/by-atleta/${atletaId}${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('[fetchSesionesByAtleta] Error:', response.status);
      return null;
    }

    const data = await response.json();
    const parsed = sesionesByAtletaResponseSchema.safeParse(data);

    if (!parsed.success) {
      console.error('[fetchSesionesByAtleta] Validation error:', parsed.error.issues);
      return null;
    }

    // Transformar a formato para selector
    const sesiones: SesionParaSelector[] = parsed.data.data.map((s) => {
      const fechaFormateada = s.fecha.toLocaleDateString('es-BO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

      const tipoSesionFormateado = s.tipoSesion.replace(/_/g, ' ');
      const microcicloInfo = s.microciclo ? ` - Micro #${s.microciclo.codigoMicrociclo}` : '';

      return {
        id: s.id,
        label: `Sesion #${s.numeroSesion} - ${fechaFormateada} (${tipoSesionFormateado})${microcicloInfo}`,
        fecha: s.fecha,
        numeroSesion: s.numeroSesion,
        tipoSesion: s.tipoSesion,
        codigoMicrociclo: s.microciclo?.codigoMicrociclo,
      };
    });

    // Ordenar por fecha descendente (mas recientes primero)
    sesiones.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

    return sesiones;
  } catch (error) {
    console.error('[fetchSesionesByAtleta] Error:', error);
    return null;
  }
}
