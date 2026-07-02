'use server';

import { cookies } from 'next/headers';
import { actividadesListSchema, type Actividad } from '@/lib/actividad-schema';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

type GetActividadSuccess = {
  success: true;
  data: Actividad[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

type GetActividadError = {
  success: false;
  error: string;
};

type GetActividadResult = GetActividadSuccess | GetActividadError;

interface GetActividadOptions {
  page?: number;
  limit?: number;
  accion?: string;
  recurso?: string;
}

export async function getActividadAction(
  options: GetActividadOptions = {}
): Promise<GetActividadResult> {
  try {
    // Obtener token de autenticacion desde cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return {
        success: false,
        error: 'No autorizado. Por favor inicia sesion nuevamente',
      };
    }

    // Construir query params
    const params = new URLSearchParams();
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.accion) params.append('accion', options.accion);
    if (options.recurso) params.append('recurso', options.recurso);

    const queryString = params.toString();
    const url = `${API_URL}/audit-logs${queryString ? `?${queryString}` : ''}`;

    // Hacer GET al backend
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    // Si la respuesta no es exitosa, manejar error
    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || 'Error al obtener actividad',
      };
    }

    // Parsear respuesta del backend
    const data = await response.json();

    // Validar que la respuesta coincida con el schema
    const validatedData = actividadesListSchema.parse(data);

    return {
      success: true,
      data: validatedData.data,
      meta: validatedData.meta,
    };
  } catch (error) {
    console.error('[getActividadAction]', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
