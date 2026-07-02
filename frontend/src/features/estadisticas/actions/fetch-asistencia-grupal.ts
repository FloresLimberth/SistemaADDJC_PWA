'use server';

import { authFetch } from '@/features/comite-tecnico/actions/base';

// Punto de datos de asistencia grupal por semana
export interface AsistenciaGrupalDataPoint {
  semana: string;
  semanaLabel: string;
  asistieron: number;
  faltaron: number;
  porcentajeAsistencia: number;
}

interface AsistenciaGrupalResponse {
  data: AsistenciaGrupalDataPoint[];
  meta: {
    semanas: number;
    totalRegistros: number;
  };
}

// Obtener asistencia grupal por semana
// Endpoint: GET /api/estadisticas/asistencia-grupal?semanas=8
// Roles: COMITE_TECNICO
export async function fetchAsistenciaGrupal(semanas: number = 8): Promise<AsistenciaGrupalResponse | null> {
  try {
    const response = await authFetch(`/estadisticas/asistencia-grupal?semanas=${semanas}`);

    if (!response.ok) {
      console.error('[fetchAsistenciaGrupal] Error:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('[fetchAsistenciaGrupal] Error:', error);
    return null;
  }
}
