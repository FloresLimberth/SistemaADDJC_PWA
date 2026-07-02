'use server';

import { getCurrentUserAction } from '@/app/actions/auth.actions';
import { cookies } from 'next/headers';
import { sesionSchema } from '@/features/atleta/types/atleta.types';

// Server Action para obtener el detalle completo de una sesion
export async function fetchSesionDetalle(sesionId: string) {
  try {
    // Obtener el usuario actual
    const userResult = await getCurrentUserAction();

    if (!userResult.success || !userResult.user) {
      console.error('[fetchSesionDetalle] Usuario no autenticado');
      return null;
    }

    const user = userResult.user;
    console.log('[fetchSesionDetalle] Usuario autenticado:', user.email, 'Sesion ID:', sesionId);

    // Obtener el token para hacer la peticion
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      console.error('[fetchSesionDetalle] No se encontro token');
      return null;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

    // Llamar al endpoint del backend
    // Endpoint: GET /api/sesiones/:id
    // El backend valida automaticamente que el atleta tenga acceso a esta sesion
    const response = await fetch(`${API_URL}/sesiones/${sesionId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      console.error('[fetchSesionDetalle] Error en respuesta:', response.status);
      const errorText = await response.text();
      console.error('[fetchSesionDetalle] Error detalle:', errorText);
      return null;
    }

    const sesionData = await response.json();
    console.log('[fetchSesionDetalle] Sesion obtenida:', sesionData.id);

    // Validar con Zod
    const validationResult = sesionSchema.safeParse(sesionData);

    if (!validationResult.success) {
      console.error('[fetchSesionDetalle] Error de validacion:', validationResult.error.issues);
      if (process.env.NODE_ENV === 'development') {
        console.error('[fetchSesionDetalle] Datos que fallaron validacion:', JSON.stringify(sesionData, null, 2));
      }
      return null;
    }

    return validationResult.data;
  } catch (error) {
    console.error('[fetchSesionDetalle] Error:', error);
    return null;
  }
}
