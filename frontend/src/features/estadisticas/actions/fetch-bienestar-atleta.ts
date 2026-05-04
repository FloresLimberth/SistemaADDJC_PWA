'use server';

import { authFetch } from '@/features/comite-tecnico/actions/base';

// Punto de datos de bienestar temporal
export interface BienestarDataPoint {
  fecha: string;
  rpe: number;
  calidadSueno: number;
  estadoAnimico: number;
  horasSueno: number | null;
  dolenciasCount: number;
}

// Respuesta del endpoint de bienestar
export interface BienestarAtletaResponse {
  data: BienestarDataPoint[];
  meta: {
    atletaId: string;
    dias: number;
    totalRegistros: number;
  };
}

// Obtener datos de bienestar temporal de un atleta
// Endpoint: GET /api/estadisticas/bienestar/:atletaId?dias=30
export async function fetchBienestarAtleta(
  atletaId: string,
  dias = 30,
): Promise<BienestarAtletaResponse | null> {
  try {
    const response = await authFetch(`/estadisticas/bienestar/${atletaId}?dias=${dias}`);

    if (!response.ok) {
      console.error('[fetchBienestarAtleta] Error:', response.status);
      return null;
    }

    const data = await response.json();
    return data as BienestarAtletaResponse;
  } catch (error) {
    console.error('[fetchBienestarAtleta] Error:', error);
    return null;
  }
}
