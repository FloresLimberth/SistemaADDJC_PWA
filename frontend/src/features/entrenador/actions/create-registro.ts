'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  createRegistroSchema,
  CreateRegistroPayload,
} from '../schemas/create-registro.schema';
import { ActionResult } from '@/types/action-result';
import { ENTRENADOR_ROUTES } from '@/lib/routes';
import { sanitizeFormData } from '@/lib/form-utils';

// Server Action para crear un registro post-entrenamiento
// Endpoint: POST /registros-post-entrenamiento
export async function createRegistro(
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

    // Extraer y sanitizar datos del FormData
    // sanitizeFormData convierte null a undefined para compatibilidad con Zod .optional()
    const rawData = sanitizeFormData(formData, [
      'atletaId',
      'sesionId',
      'asistio',
      'motivoInasistencia',
      'ejerciciosCompletados',
      'intensidadAlcanzada',
      'duracionReal',
      'rpe',
      'calidadSueno',
      'horasSueno',
      'estadoAnimico',
      'observaciones',
      'dolencias',
      'rendimientosEjercicios',
    ]);

    // Manejar conversiones especiales
    rawData.asistio = formData.get('asistio') === 'true';

    // Parsear dolencias si existen
    if (rawData.dolencias && typeof rawData.dolencias === 'string') {
      rawData.dolencias = JSON.parse(rawData.dolencias as string);
    }

    // Parsear rendimientos de ejercicios si existen
    if (rawData.rendimientosEjercicios && typeof rawData.rendimientosEjercicios === 'string') {
      rawData.rendimientosEjercicios = JSON.parse(rawData.rendimientosEjercicios as string);
    }

    // Validar con Zod
    const validation = createRegistroSchema.safeParse(rawData);

    if (!validation.success) {
      // Convertir errores de Zod a formato de fieldErrors
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

    // Construir payload para el backend
    // NOTA: Para sesiones tipo COMPETENCIA, los campos de entrenamiento pueden no estar presentes
    const payload: CreateRegistroPayload = {
      atletaId: validation.data.atletaId,
      sesionId: validation.data.sesionId,
      asistio: validation.data.asistio,
    };

    // Solo agregar campos opcionales que tengan valor
    if (
      validation.data.motivoInasistencia &&
      validation.data.motivoInasistencia.trim() !== ''
    ) {
      payload.motivoInasistencia = validation.data.motivoInasistencia.trim();
    }

    // Campos de entrenamiento (opcionales para COMPETENCIA)
    if (
      validation.data.ejerciciosCompletados !== undefined &&
      validation.data.ejerciciosCompletados !== ''
    ) {
      payload.ejerciciosCompletados = Number(
        validation.data.ejerciciosCompletados
      );
    }
    if (
      validation.data.intensidadAlcanzada !== undefined &&
      validation.data.intensidadAlcanzada !== ''
    ) {
      payload.intensidadAlcanzada = Number(validation.data.intensidadAlcanzada);
    }
    if (
      validation.data.duracionReal !== undefined &&
      validation.data.duracionReal !== ''
    ) {
      payload.duracionReal = Number(validation.data.duracionReal);
    }
    if (validation.data.rpe !== undefined && validation.data.rpe !== '') {
      payload.rpe = Number(validation.data.rpe);
    }
    if (
      validation.data.calidadSueno !== undefined &&
      validation.data.calidadSueno !== ''
    ) {
      payload.calidadSueno = Number(validation.data.calidadSueno);
    }
    if (
      validation.data.estadoAnimico !== undefined &&
      validation.data.estadoAnimico !== ''
    ) {
      payload.estadoAnimico = Number(validation.data.estadoAnimico);
    }

    // Manejar horasSueno - puede ser numero o string vacio
    if (
      validation.data.horasSueno !== undefined &&
      validation.data.horasSueno !== ''
    ) {
      payload.horasSueno = Number(validation.data.horasSueno);
    }

    if (
      validation.data.observaciones &&
      validation.data.observaciones.trim() !== ''
    ) {
      payload.observaciones = validation.data.observaciones.trim();
    }

    // Agregar dolencias si existen
    if (validation.data.dolencias && validation.data.dolencias.length > 0) {
      payload.dolencias = validation.data.dolencias.map((d) => ({
        zona: d.zona,
        nivel: d.nivel,
        descripcion: d.descripcion?.trim() || undefined,
        tipoLesion: d.tipoLesion || undefined,
      }));
    }

    // Agregar rendimientos de ejercicios si existen
    if (validation.data.rendimientosEjercicios && validation.data.rendimientosEjercicios.length > 0) {
      payload.rendimientosEjercicios = validation.data.rendimientosEjercicios.map((r) => ({
        ejercicioSesionId: r.ejercicioSesionId,
        completado: r.completado,
        rendimiento: r.rendimiento,
        dificultadPercibida: r.dificultadPercibida,
        tiempoReal: r.tiempoReal,
        observacion: r.observacion?.trim() || undefined,
        motivoNoCompletado: r.motivoNoCompletado?.trim() || undefined,
      }));
    }

    const API_URL =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

    const response = await fetch(`${API_URL}/registros-post-entrenamiento`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error(
        '[createRegistro] Error del backend:',
        response.status,
        errorData
      );

      // Manejar errores especificos del backend
      if (response.status === 403) {
        return {
          success: false,
          error: 'No tienes permiso para registrar datos de este atleta',
          submittedData: rawData as Record<string, unknown>,
        };
      }
      if (response.status === 404) {
        return {
          success: false,
          error: 'Atleta o sesion no encontrada',
          submittedData: rawData as Record<string, unknown>,
        };
      }
      if (response.status === 409) {
        return {
          success: false,
          error: 'Ya existe un registro para esta sesion y atleta',
          submittedData: rawData as Record<string, unknown>,
        };
      }

      return {
        success: false,
        error: errorData?.message || 'Error al crear el registro',
        submittedData: rawData as Record<string, unknown>,
      };
    }

    const result = await response.json();
    console.log('[createRegistro] Registro creado:', result.id);

    // Revalidar las rutas afectadas
    revalidatePath('/entrenador/post-entrenamiento');
    revalidatePath('/entrenador');
    revalidatePath('/entrenador/dolencias');
    revalidatePath(`/entrenador/mis-atletas/${validation.data.atletaId}`);
  } catch (error) {
    console.error('[createRegistro] Error:', error);
    return {
      success: false,
      error: 'Error de conexion. Intenta nuevamente.',
      submittedData: {},
    };
  }

  // Redirigir fuera del try-catch (Next.js requirement)
  redirect(ENTRENADOR_ROUTES.postEntrenamiento.list);
}
