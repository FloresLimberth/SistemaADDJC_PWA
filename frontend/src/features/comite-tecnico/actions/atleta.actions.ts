'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createAtletaSchema, updateAtletaSchema } from '../schemas/atleta.schema';
import type { ActionResult } from '@/types/action-result';
import { COMITE_TECNICO_ROUTES } from '@/lib/routes';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Server Action para crear un atleta
// Endpoint: POST /api/atletas
export async function createAtleta(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return {
        success: false,
        error: 'No autenticado. Por favor inicia sesion.',
      };
    }

    // Extraer datos del FormData
    const rawData = {
      ci: formData.get('ci'),
      nombreCompleto: formData.get('nombreCompleto'),
      email: formData.get('email'),
      contrasena: formData.get('contrasena'),
      municipio: formData.get('municipio'),
      municipioClub: formData.get('municipioClub'),
      club: formData.get('club'),
      categoria: formData.get('categoria'),
      fechaNacimiento: formData.get('fechaNacimiento'),
      edad: formData.get('edad'),
      direccion: formData.get('direccion') || undefined,
      telefono: formData.get('telefono') || undefined,
      entrenadorAsignadoId: formData.get('entrenadorAsignadoId') || undefined,
      categoriaPeso: formData.get('categoriaPeso') || undefined,
      pesoActual: formData.get('pesoActual') || undefined,
    };

    // Validar con Zod
    const validation = createAtletaSchema.safeParse(rawData);

    if (!validation.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of validation.error.issues) {
        const path = issue.path.join('.');
        if (!fieldErrors[path]) {
          fieldErrors[path] = [];
        }
        fieldErrors[path].push(issue.message);
      }

      return {
        success: false,
        error: 'Por favor corrige los errores del formulario',
        fieldErrors,
        submittedData: rawData as Record<string, unknown>,
      };
    }

    const response = await fetch(`${API_URL}/atletas`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validation.data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('[createAtleta] Error:', response.status, errorData);

      if (response.status === 403) {
        return {
          success: false,
          error: 'No tienes permiso para crear atletas',
          submittedData: rawData as Record<string, unknown>,
        };
      }

      if (response.status === 409) {
        return {
          success: false,
          error: errorData?.message || 'El email o CI ya estan registrados',
          submittedData: rawData as Record<string, unknown>,
        };
      }

      return {
        success: false,
        error: errorData?.message || 'Error al crear el atleta',
        submittedData: rawData as Record<string, unknown>,
      };
    }

    const result = await response.json();
    console.log('[createAtleta] Atleta creado:', result.id);

    revalidatePath('/comite-tecnico/atletas');
    revalidatePath('/comite-tecnico');
  } catch (error) {
    console.error('[createAtleta] Error:', error);
    return {
      success: false,
      error: 'Error de conexion. Intenta nuevamente.',
      submittedData: {},
    };
  }

  redirect(COMITE_TECNICO_ROUTES.atletas.list);
}

// Server Action para actualizar un atleta
// Endpoint: PATCH /api/atletas/:id
export async function updateAtleta(
  id: string,
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return {
        success: false,
        error: 'No autenticado. Por favor inicia sesion.',
      };
    }

    // Extraer datos del FormData
    // Campos obligatorios siempre se incluyen (para validacion)
    const requiredFields = ['municipio', 'municipioClub', 'club', 'categoria', 'fechaNacimiento', 'edad', 'categoriaPeso'];
    // Campos opcionales solo si tienen valor
    const optionalFields = ['direccion', 'telefono', 'entrenadorAsignadoId', 'pesoActual'];

    const rawData: Record<string, unknown> = {};

    // Incluir campos obligatorios siempre
    for (const field of requiredFields) {
      const value = formData.get(field);
      rawData[field] = value !== null ? value : '';
    }

    // Incluir campos opcionales solo si tienen valor
    for (const field of optionalFields) {
      const value = formData.get(field);
      if (value !== null && value !== '') {
        rawData[field] = value;
      }
    }

    // Incluir estado (campo booleano especial)
    const estadoValue = formData.get('estado');
    if (estadoValue !== null) {
      rawData.estado = estadoValue === 'true';
    }

    // Validar con Zod
    const validation = updateAtletaSchema.safeParse(rawData);

    if (!validation.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of validation.error.issues) {
        const path = issue.path.join('.');
        if (!fieldErrors[path]) {
          fieldErrors[path] = [];
        }
        fieldErrors[path].push(issue.message);
      }

      return {
        success: false,
        error: 'Por favor corrige los errores del formulario',
        fieldErrors,
        submittedData: rawData as Record<string, unknown>,
      };
    }

    const response = await fetch(`${API_URL}/atletas/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validation.data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('[updateAtleta] Error:', response.status, errorData);

      return {
        success: false,
        error: errorData?.message || 'Error al actualizar el atleta',
      };
    }

    revalidatePath('/comite-tecnico/atletas');
    revalidatePath(`/comite-tecnico/atletas/${id}`);
    revalidatePath('/comite-tecnico');

    return {
      success: true,
      data: undefined,
      message: 'Atleta actualizado correctamente',
    };
  } catch (error) {
    console.error('[updateAtleta] Error:', error);
    return {
      success: false,
      error: 'Error de conexion. Intenta nuevamente.',
    };
  }
}

// Server Action para eliminar un atleta
// Endpoint: DELETE /api/atletas/:id
export async function deleteAtleta(id: string): Promise<ActionResult> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return {
        success: false,
        error: 'No autenticado. Por favor inicia sesion.',
      };
    }

    const response = await fetch(`${API_URL}/atletas/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('[deleteAtleta] Error:', response.status, errorData);

      return {
        success: false,
        error: errorData?.message || 'Error al eliminar el atleta',
      };
    }

    revalidatePath('/comite-tecnico/atletas');
    revalidatePath('/comite-tecnico');

    return {
      success: true,
      data: undefined,
      message: 'Atleta eliminado correctamente',
    };
  } catch (error) {
    console.error('[deleteAtleta] Error:', error);
    return {
      success: false,
      error: 'Error de conexion. Intenta nuevamente.',
    };
  }
}
