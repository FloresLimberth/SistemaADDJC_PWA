'use server';

import { authFetch, getAuthToken } from './base';
import type { Macrociclo, Mesociclo, MicrocicloType, Asignacion } from '../types/planificacion.types';
import type { PaginatedResponse } from '@/features/atleta/types/atleta.types';

// ===================================
// MACROCICLOS
// Params segun backend macrociclos.controller.ts (solo acepta page, limit)
// ===================================

export interface FetchMacrociclosParams {
  page?: number;
  limit?: number;
}

// Obtener lista paginada de macrociclos
export async function fetchMacrociclos(
  params: FetchMacrociclosParams = {}
): Promise<PaginatedResponse<Macrociclo> | null> {
  try {
    const token = await getAuthToken();

    if (!token) {
      console.error('[fetchMacrociclos] No autenticado');
      return null;
    }

    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());

    const queryString = searchParams.toString();
    const endpoint = `/macrociclos${queryString ? `?${queryString}` : ''}`;

    const response = await authFetch(endpoint);

    if (!response.ok) {
      console.error('[fetchMacrociclos] Error:', response.status);
      return null;
    }

    const data = await response.json();
    return data as PaginatedResponse<Macrociclo>;
  } catch (error) {
    console.error('[fetchMacrociclos] Error:', error);
    return null;
  }
}

// Obtener detalle de un macrociclo por ID
export async function fetchMacrociclo(id: string): Promise<Macrociclo | null> {
  try {
    const token = await getAuthToken();

    if (!token) {
      console.error('[fetchMacrociclo] No autenticado');
      return null;
    }

    const response = await authFetch(`/macrociclos/${id}`);

    if (!response.ok) {
      console.error('[fetchMacrociclo] Error:', response.status);
      return null;
    }

    const data = await response.json();
    return data as Macrociclo;
  } catch (error) {
    console.error('[fetchMacrociclo] Error:', error);
    return null;
  }
}

// ===================================
// MESOCICLOS
// ===================================

// Params segun backend mesociclos.controller.ts (solo acepta macrocicloId, page, limit)
export interface FetchMesociclosParams {
  page?: number;
  limit?: number;
  macrocicloId?: string;
}

// Obtener lista paginada de mesociclos
export async function fetchMesociclos(
  params: FetchMesociclosParams = {}
): Promise<PaginatedResponse<Mesociclo> | null> {
  try {
    const token = await getAuthToken();

    if (!token) {
      console.error('[fetchMesociclos] No autenticado');
      return null;
    }

    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.macrocicloId) searchParams.set('macrocicloId', params.macrocicloId);

    const queryString = searchParams.toString();
    const endpoint = `/mesociclos${queryString ? `?${queryString}` : ''}`;

    const response = await authFetch(endpoint);

    if (!response.ok) {
      console.error('[fetchMesociclos] Error:', response.status);
      return null;
    }

    const data = await response.json();
    return data as PaginatedResponse<Mesociclo>;
  } catch (error) {
    console.error('[fetchMesociclos] Error:', error);
    return null;
  }
}

// Obtener detalle de un mesociclo por ID
export async function fetchMesociclo(id: string): Promise<Mesociclo | null> {
  try {
    const token = await getAuthToken();

    if (!token) {
      console.error('[fetchMesociclo] No autenticado');
      return null;
    }

    const response = await authFetch(`/mesociclos/${id}`);

    if (!response.ok) {
      console.error('[fetchMesociclo] Error:', response.status);
      return null;
    }

    const data = await response.json();
    return data as Mesociclo;
  } catch (error) {
    console.error('[fetchMesociclo] Error:', error);
    return null;
  }
}

// ===================================
// MICROCICLOS
// Params segun backend microciclos.controller.ts (solo acepta mesocicloId, page, limit)
// ===================================

export interface FetchMicrociclosParams {
  page?: number;
  limit?: number;
  mesocicloId?: string;
}

// Obtener lista paginada de microciclos
export async function fetchMicrociclos(
  params: FetchMicrociclosParams = {}
): Promise<PaginatedResponse<MicrocicloType> | null> {
  try {
    const token = await getAuthToken();

    if (!token) {
      console.error('[fetchMicrociclos] No autenticado');
      return null;
    }

    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.mesocicloId) searchParams.set('mesocicloId', params.mesocicloId);

    const queryString = searchParams.toString();
    const endpoint = `/microciclos${queryString ? `?${queryString}` : ''}`;

    const response = await authFetch(endpoint);

    if (!response.ok) {
      console.error('[fetchMicrociclos] Error:', response.status);
      return null;
    }

    const data = await response.json();
    return data as PaginatedResponse<MicrocicloType>;
  } catch (error) {
    console.error('[fetchMicrociclos] Error:', error);
    return null;
  }
}

// Obtener detalle de un microciclo por ID
export async function fetchMicrociclo(id: string): Promise<MicrocicloType | null> {
  try {
    const token = await getAuthToken();

    if (!token) {
      console.error('[fetchMicrociclo] No autenticado');
      return null;
    }

    const response = await authFetch(`/microciclos/${id}`);

    if (!response.ok) {
      console.error('[fetchMicrociclo] Error:', response.status);
      return null;
    }

    const data = await response.json();
    return data as MicrocicloType;
  } catch (error) {
    console.error('[fetchMicrociclo] Error:', error);
    return null;
  }
}

// ===================================
// ASIGNACIONES
// ===================================

export interface FetchAsignacionesParams {
  page?: number;
  limit?: number;
  atletaId?: string;
  microcicloId?: string;
}

// Obtener lista paginada de asignaciones
export async function fetchAsignaciones(
  params: FetchAsignacionesParams = {}
): Promise<PaginatedResponse<Asignacion> | null> {
  try {
    const token = await getAuthToken();

    if (!token) {
      console.error('[fetchAsignaciones] No autenticado');
      return null;
    }

    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.atletaId) searchParams.set('atletaId', params.atletaId);
    if (params.microcicloId) searchParams.set('microcicloId', params.microcicloId);

    const queryString = searchParams.toString();
    const endpoint = `/asignaciones${queryString ? `?${queryString}` : ''}`;

    const response = await authFetch(endpoint);

    if (!response.ok) {
      console.error('[fetchAsignaciones] Error:', response.status);
      return null;
    }

    const data = await response.json();
    return data as PaginatedResponse<Asignacion>;
  } catch (error) {
    console.error('[fetchAsignaciones] Error:', error);
    return null;
  }
}

// Obtener detalle de una asignacion por ID
export async function fetchAsignacion(id: string): Promise<Asignacion | null> {
  try {
    const token = await getAuthToken();

    if (!token) {
      console.error('[fetchAsignacion] No autenticado');
      return null;
    }

    const response = await authFetch(`/asignaciones/${id}`);

    if (!response.ok) {
      console.error('[fetchAsignacion] Error:', response.status);
      return null;
    }

    const data = await response.json();
    return data as Asignacion;
  } catch (error) {
    console.error('[fetchAsignacion] Error:', error);
    return null;
  }
}

// ===================================
// SESIONES
// Params segun backend sesiones.controller.ts
// ===================================

// Tipo para sesion completa (retorno del backend)
export interface SesionCompleta {
  id: string;
  microcicloId: string;
  fecha: string;
  diaSemana: string;
  numeroSesion: number;
  tipoSesion: string;
  turno: string;
  tipoPlanificacion: string;
  sesionBaseId: string | null;
  creadoPor: string;
  duracionPlanificada: number;
  // Opcionales para COMPETENCIA/DESCANSO
  volumenPlanificado: number | null;
  intensidadPlanificada: number | null;
  // Datos reales (usados por algoritmo de recomendacion)
  volumenReal: number | null;
  intensidadReal: number | null;
  // Contenidos opcionales para COMPETENCIA/DESCANSO
  contenidoFisico: string | null;
  contenidoTecnico: string | null;
  contenidoTactico: string | null;
  calentamiento: string | null;
  partePrincipal: string | null;
  vueltaCalma: string | null;
  observaciones: string | null;
  materialNecesario: string | null;
  // Campos del algoritmo (schema.prisma lineas 192-194)
  aprobado?: boolean;
  perfilUtilizado?: string | null;
  justificacionAlgoritmo?: string | null;
  createdAt: string;
  updatedAt: string;
  microciclo?: {
    id: string;
    codigoMicrociclo: string;
    fechaInicio: string;
    fechaFin: string;
  };
}

export interface FetchSesionesParams {
  page?: number;
  limit?: number;
  microcicloId?: string;
  fecha?: string;
}

// Obtener lista paginada de sesiones
export async function fetchSesiones(
  params: FetchSesionesParams = {}
): Promise<PaginatedResponse<SesionCompleta> | null> {
  try {
    const token = await getAuthToken();

    if (!token) {
      console.error('[fetchSesiones] No autenticado');
      return null;
    }

    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.microcicloId) searchParams.set('microcicloId', params.microcicloId);
    if (params.fecha) searchParams.set('fecha', params.fecha);

    const queryString = searchParams.toString();
    const endpoint = `/sesiones${queryString ? `?${queryString}` : ''}`;

    const response = await authFetch(endpoint);

    if (!response.ok) {
      console.error('[fetchSesiones] Error:', response.status);
      return null;
    }

    const data = await response.json();
    return data as PaginatedResponse<SesionCompleta>;
  } catch (error) {
    console.error('[fetchSesiones] Error:', error);
    return null;
  }
}

// Obtener detalle de una sesion por ID
export async function fetchSesion(id: string): Promise<SesionCompleta | null> {
  try {
    const token = await getAuthToken();

    if (!token) {
      console.error('[fetchSesion] No autenticado');
      return null;
    }

    const response = await authFetch(`/sesiones/${id}`);

    if (!response.ok) {
      console.error('[fetchSesion] Error:', response.status);
      return null;
    }

    const data = await response.json();
    return data as SesionCompleta;
  } catch (error) {
    console.error('[fetchSesion] Error:', error);
    return null;
  }
}

// Obtener microciclos para selector (formato simplificado)
export interface MicrocicloParaSelector {
  id: string;
  label: string;
  codigoMicrociclo: string;
  fechaInicio: string;
  fechaFin: string;
}

export async function fetchMicrociclosParaSelector(
  limit: number = 100
): Promise<MicrocicloParaSelector[] | null> {
  try {
    const token = await getAuthToken();

    if (!token) {
      console.error('[fetchMicrociclosParaSelector] No autenticado');
      return null;
    }

    const response = await authFetch(`/microciclos?limit=${limit}`);

    if (!response.ok) {
      console.error('[fetchMicrociclosParaSelector] Error:', response.status);
      return null;
    }

    const data = await response.json();
    const microciclos = data.data as MicrocicloType[];

    return microciclos.map((m) => ({
      id: m.id,
      label: `Micro #${m.codigoMicrociclo} (${new Date(m.fechaInicio).toLocaleDateString('es-BO')} - ${new Date(m.fechaFin).toLocaleDateString('es-BO')})`,
      codigoMicrociclo: m.codigoMicrociclo,
      fechaInicio: m.fechaInicio.toString(),
      fechaFin: m.fechaFin.toString(),
    }));
  } catch (error) {
    console.error('[fetchMicrociclosParaSelector] Error:', error);
    return null;
  }
}
