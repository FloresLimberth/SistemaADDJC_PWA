'use server';

import { authFetch } from '@/features/comite-tecnico/actions/base';

// Punto de datos de carga planificada vs real
export interface CargaPlanVsRealDataPoint {
  fecha: string;
  sesionId: string;
  tipoSesion: string;
  numeroSesion: number;
  intensidadPlanificada: number | null;
  intensidadAlcanzada: number;
  cumplimiento: number | null;
}

// Respuesta del endpoint de carga plan vs real
export interface CargaPlanVsRealResponse {
  data: CargaPlanVsRealDataPoint[];
  meta: {
    atletaId: string;
    totalSesiones: number;
    cumplimientoPromedio: number | null;
  };
}

// Obtener datos de intensidad planificada vs real de un atleta
// Endpoint: GET /api/estadisticas/carga-plan-vs-real/:atletaId?desde=&hasta=
export async function fetchCargaPlanVsReal(
  atletaId: string,
  desde?: string,
  hasta?: string,
): Promise<CargaPlanVsRealResponse | null> {
  try {
    const params = new URLSearchParams();
    if (desde) params.set('desde', desde);
    if (hasta) params.set('hasta', hasta);

    const queryString = params.toString();
    const url = `/estadisticas/carga-plan-vs-real/${atletaId}${queryString ? `?${queryString}` : ''}`;

    const response = await authFetch(url);

    if (!response.ok) {
      console.error('[fetchCargaPlanVsReal] Error:', response.status);
      return null;
    }

    const data = await response.json();
    return data as CargaPlanVsRealResponse;
  } catch (error) {
    console.error('[fetchCargaPlanVsReal] Error:', error);
    return null;
  }
}
