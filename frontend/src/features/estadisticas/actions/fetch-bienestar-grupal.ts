'use server';

import { authFetch } from '@/features/comite-tecnico/actions/base';

// Punto de datos de bienestar grupal (RPE promedio/max/min de todo el equipo)
export interface BienestarGrupalDataPoint {
  fecha: string;
  rpePromedio: number;
  rpeMax: number;
  rpeMin: number;
  calidadSuenoPromedio: number;
  estadoAnimicoPromedio: number;
  atletasConRegistro: number;
}

interface BienestarGrupalResponse {
  data: BienestarGrupalDataPoint[];
  meta: {
    dias: number;
    totalRegistros: number;
    atletasUnicos: number;
  };
}

// Obtener bienestar grupal de todos los atletas
// Endpoint: GET /api/estadisticas/bienestar-grupal?dias=30
// Roles: COMITE_TECNICO
export async function fetchBienestarGrupal(dias: number = 30): Promise<BienestarGrupalResponse | null> {
  try {
    const response = await authFetch(`/estadisticas/bienestar-grupal?dias=${dias}`);

    if (!response.ok) {
      console.error('[fetchBienestarGrupal] Error:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('[fetchBienestarGrupal] Error:', error);
    return null;
  }
}
