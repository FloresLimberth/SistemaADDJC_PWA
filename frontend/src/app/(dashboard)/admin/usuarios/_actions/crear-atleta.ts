'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import {
  crearAtletaAdminSchema,
  type CrearAtletaAdminInput,
} from '@/lib/usuarios-schema';
import { z } from 'zod';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export async function crearAtletaAction(formData: CrearAtletaAdminInput) {
  try {
    // Validar datos con Zod (validacion frontend)
    const validatedData = crearAtletaAdminSchema.parse(formData);

    // Obtener token de autenticacion desde cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return {
        success: false,
        error: 'No autorizado. Por favor inicia sesion nuevamente',
      };
    }

    // Hacer POST al backend /api/atletas
    const response = await fetch(`${API_URL}/atletas`, {
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
        error: error.message || 'Error al crear atleta',
      };
    }

    // Parsear respuesta del backend
    const atleta = await response.json();

    // Revalidar la pagina de usuarios para actualizar la tabla
    revalidatePath('/admin/usuarios');

    return {
      success: true,
      data: atleta,
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
    console.error('[crearAtletaAction]', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
