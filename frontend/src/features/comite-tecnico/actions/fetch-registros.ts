'use server';

import { authFetch, getAuthToken } from './base';

// Tipos para registros post-entrenamiento
export interface RegistroPostEntrenamiento {
  id: string;
  atletaId: string;
  sesionId: string;
  entrenadorRegistroId: string;
  fechaRegistro: string;
  asistio: boolean;
  motivoInasistencia: string | null;
  ejerciciosCompletados: number;
  intensidadAlcanzada: number;
  duracionReal: number | null;
  rpe: number;
  calidadSueno: number;
  horasSueno: number | null;
  estadoAnimico: number;
  observaciones: string | null;
  atleta?: {
    id: string;
    nombreCompleto: string;
  };
  sesion?: {
    id: string;
    fecha: string;
    numeroSesion: number;
    tipoSesion: string;
    microciclo?: {
      codigoMicrociclo: string;
    };
  };
  entrenador?: {
    id: string;
    nombreCompleto: string;
  };
  dolencias?: {
    id: string;
    zona: string;
    nivel: number;
    descripcion: string | null;
    tipoLesion: string;
    recuperado: boolean;
    fechaRecuperacion: string | null;
  }[];
}

export interface FetchRegistrosParams {
  atletaId?: string;
  sesionId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  asistio?: string;
  rpeMin?: number;
  page?: number;
  limit?: number;
}

export interface FetchRegistrosResult {
  data: RegistroPostEntrenamiento[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Obtener lista de registros post-entrenamiento
export async function fetchRegistrosPostEntrenamiento(
  params: FetchRegistrosParams = {}
): Promise<FetchRegistrosResult | null> {
  try {
    const token = await getAuthToken();

    if (!token) {
      console.error('[fetchRegistrosPostEntrenamiento] No autenticado');
      return null;
    }

    const { atletaId, sesionId, fechaDesde, fechaHasta, asistio, rpeMin, page = 1, limit = 20 } = params;

    const queryParams = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    if (atletaId) queryParams.append('atletaId', atletaId);
    if (sesionId) queryParams.append('sesionId', sesionId);
    if (fechaDesde) queryParams.append('fechaDesde', fechaDesde);
    if (fechaHasta) queryParams.append('fechaHasta', fechaHasta);
    if (asistio) queryParams.append('asistio', asistio);
    if (rpeMin !== undefined) queryParams.append('rpeMin', rpeMin.toString());

    const response = await authFetch(
      `/registros-post-entrenamiento?${queryParams.toString()}`
    );

    if (!response.ok) {
      console.error('[fetchRegistrosPostEntrenamiento] Error:', response.status);
      return null;
    }

    const data = await response.json();
    return data as FetchRegistrosResult;
  } catch (error) {
    console.error('[fetchRegistrosPostEntrenamiento] Error:', error);
    return null;
  }
}

// Obtener un registro por ID
export async function fetchRegistroPostEntrenamiento(
  id: string
): Promise<RegistroPostEntrenamiento | null> {
  try {
    const token = await getAuthToken();

    if (!token) {
      console.error('[fetchRegistroPostEntrenamiento] No autenticado');
      return null;
    }

    const response = await authFetch(`/registros-post-entrenamiento/${id}`);

    if (!response.ok) {
      console.error('[fetchRegistroPostEntrenamiento] Error:', response.status);
      return null;
    }

    const data = await response.json();
    return data as RegistroPostEntrenamiento;
  } catch (error) {
    console.error('[fetchRegistroPostEntrenamiento] Error:', error);
    return null;
  }
}
