'use server';

import { cookies } from 'next/headers';
import { usuariosListSchema, type UsuariosList } from '@/lib/usuarios-schema';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

type GetUsuariosSuccess = {
  success: true;
} & UsuariosList;

type GetUsuariosError = {
  success: false;
  error: string;
  data: never[];
};

type GetUsuariosResult = GetUsuariosSuccess | GetUsuariosError;

export async function getUsuariosAction(): Promise<GetUsuariosResult> {
  try {
    // Obtener token de autenticacion desde cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return {
        success: false,
        error: 'No autorizado. Por favor inicia sesion nuevamente',
        data: [],
      };
    }

    // Hacer GET al backend /api/users
    const response = await fetch(`${API_URL}/users`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store', // No cachear para obtener datos frescos siempre
    });

    // Si la respuesta no es exitosa, manejar error
    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || 'Error al obtener usuarios',
        data: [],
      };
    }

    // Parsear respuesta del backend
    const usuarios = await response.json();

    // Validar que la respuesta coincida con el schema
    const validatedUsuarios = usuariosListSchema.parse(usuarios);

    return {
      success: true,
      ...validatedUsuarios,
    };
  } catch (error) {
    // Manejar otros errores
    console.error('[getUsuariosAction]', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      data: [],
    };
  }
}
