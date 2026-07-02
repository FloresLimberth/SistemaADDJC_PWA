'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import {
  editarUsuarioSchema,
  usuarioResponseSchema,
  type EditarUsuarioInput,
} from '@/lib/usuarios-schema';
import { z } from 'zod';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export async function editarUsuarioAction(id: string, formData: Partial<EditarUsuarioInput>) {
  try {
    // Validar datos con Zod (validacion frontend)
    const validatedData = editarUsuarioSchema.parse({
      id,
      ...formData,
    });

    // Obtener token de autenticacion desde cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return {
        success: false,
        error: 'No autorizado. Por favor inicia sesion nuevamente',
      };
    }

    // Construir objeto con solo los campos que se van a actualizar
    const updateData: Record<string, unknown> = {};
    if (validatedData.ci) updateData.ci = validatedData.ci;
    if (validatedData.nombreCompleto) updateData.nombreCompleto = validatedData.nombreCompleto;
    if (validatedData.email) updateData.email = validatedData.email;
    if (validatedData.contrasena) updateData.contrasena = validatedData.contrasena;
    if (validatedData.rol) updateData.rol = validatedData.rol;
    if (validatedData.estado !== undefined) updateData.estado = validatedData.estado;

    // Hacer PATCH al backend /api/users/:id
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });

    // Si la respuesta no es exitosa, manejar error
    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || 'Error al actualizar usuario',
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
    console.error('[editarUsuarioAction]', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
