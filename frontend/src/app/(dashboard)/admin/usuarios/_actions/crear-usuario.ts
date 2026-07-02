'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import {
  crearUsuarioSchema,
  usuarioResponseSchema,
  type CrearUsuarioInput,
} from '@/lib/usuarios-schema';
import { z } from 'zod';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export async function crearUsuarioAction(formData: CrearUsuarioInput) {
  try {
    // Validar datos con Zod (validacion frontend)
    const validatedData = crearUsuarioSchema.parse(formData);

    // Obtener token de autenticacion desde cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return {
        success: false,
        error: 'No autorizado. Por favor inicia sesion nuevamente',
      };
    }

    // Hacer POST al backend /api/users
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(validatedData),
    });

    // Si la respuesta no es exitosa, manejar error
    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || 'Error al crear usuario',
      };
    }

    // Parsear respuesta del backend
    const usuario = await response.json();

    // Validar que la respuesta coincida con el schema
    const validatedUser = usuarioResponseSchema.parse(usuario);

    // Revalidar la pagina de usuarios para actualizar la tabla
    revalidatePath('/admin/usuarios');

    return {
      success: true,
      data: validatedUser,
    };
  } catch (error) {
    // Manejar errores de validacion de Zod
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || 'Datos invalidos',
      };
    }

    // Manejar otros errores
    console.error('[crearUsuarioAction]', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
