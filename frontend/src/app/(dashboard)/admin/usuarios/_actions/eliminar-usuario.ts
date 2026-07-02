'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export async function eliminarUsuarioAction(id: string) {
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

    // Hacer DELETE al backend /api/users/:id
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Si la respuesta no es exitosa, manejar error
    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || 'Error al eliminar usuario',
      };
    }

    // Parsear respuesta del backend
    const result = await response.json();

    // Revalidar la pagina de usuarios para actualizar la tabla
    revalidatePath('/admin/usuarios');

    return {
      success: true,
      message: result.message || 'Usuario eliminado correctamente',
    };
  } catch (error) {
    // Manejar otros errores
    console.error('[eliminarUsuarioAction]', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
