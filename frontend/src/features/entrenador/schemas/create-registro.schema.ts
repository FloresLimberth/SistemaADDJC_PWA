import { z } from 'zod';
import { TipoLesionValues } from '@/types/enums';

// Schema para una dolencia individual
// Basado en: backend/src/modules/registro-post-entrenamiento/dto/create-dolencia.dto.ts
export const dolenciaSchema = z.object({
  zona: z.string().min(1, 'La zona afectada es requerida').max(100, 'La zona no puede exceder 100 caracteres'),

  nivel: z.coerce.number()
    .int('El nivel debe ser un numero entero')
    .min(1, 'El nivel debe ser minimo 1 (molestia leve)')
    .max(10, 'El nivel debe ser maximo 10 (dolor insoportable)'),

  descripcion: z.string().max(500, 'La descripcion no puede exceder 500 caracteres').optional(),

  tipoLesion: z.enum(TipoLesionValues as [string, ...string[]]).optional(),
});

export type DolenciaInput = z.infer<typeof dolenciaSchema>;

// Schema para rendimiento de un ejercicio individual
// Basado en: backend/src/modules/registro-post-entrenamiento/dto/create-rendimiento-ejercicio.dto.ts
export const rendimientoEjercicioSchema = z.object({
  ejercicioSesionId: z.coerce.number().int().positive('ID de ejercicio requerido'),

  completado: z.boolean(),

  // Rendimiento 1-10 (requerido si completado=true, se valida con superRefine)
  rendimiento: z.coerce.number()
    .int('Rendimiento debe ser un numero entero')
    .min(1, 'Rendimiento debe ser minimo 1')
    .max(10, 'Rendimiento debe ser maximo 10')
    .optional(),

  // Dificultad percibida 1-10 (opcional)
  dificultadPercibida: z.coerce.number()
    .int('Dificultad percibida debe ser un numero entero')
    .min(1, 'Dificultad percibida debe ser minimo 1')
    .max(10, 'Dificultad percibida debe ser maximo 10')
    .optional(),

  // Tiempo real en minutos (opcional)
  tiempoReal: z.coerce.number()
    .int('Tiempo real debe ser un numero entero')
    .min(1, 'Tiempo real debe ser al menos 1 minuto')
    .max(120, 'Tiempo real no puede exceder 120 minutos')
    .optional(),

  // Observacion (opcional)
  observacion: z.string().max(500, 'Observacion no puede exceder 500 caracteres').optional(),

  // Motivo si no se completo (requerido si completado=false, se valida con superRefine)
  motivoNoCompletado: z.string().max(500, 'Motivo no puede exceder 500 caracteres').optional(),
}).superRefine((data, ctx) => {
  // Si completado=true, rendimiento es requerido
  if (data.completado && (data.rendimiento === undefined || data.rendimiento === null)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Rendimiento es requerido cuando el ejercicio fue completado',
      path: ['rendimiento'],
    });
  }
  // Si completado=false, motivoNoCompletado es requerido
  if (!data.completado && (!data.motivoNoCompletado || data.motivoNoCompletado.trim().length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Indica el motivo por el que no se completo el ejercicio',
      path: ['motivoNoCompletado'],
    });
  }
});

export type RendimientoEjercicioInput = z.infer<typeof rendimientoEjercicioSchema>;

// Schema para crear un registro post-entrenamiento
// Basado en: backend/src/modules/registro-post-entrenamiento/dto/create-registro-post-entrenamiento.dto.ts
// NOTA: Para sesiones tipo COMPETENCIA, los campos de entrenamiento son opcionales
// El backend usa valores por defecto cuando no se proporcionan
export const createRegistroSchema = z.object({
  // IDs de relaciones (requeridos)
  atletaId: z.coerce.number().int().positive('El ID del atleta debe ser positivo'),

  sesionId: z.coerce.number().int().positive('El ID de la sesion debe ser positivo'),

  // Asistencia
  asistio: z.coerce.boolean(),

  motivoInasistencia: z.string().max(500, 'El motivo no puede exceder 500 caracteres').optional(),

  // Ejecucion de sesion (porcentajes: 0-100)
  // NOTA: Opcionales para COMPETENCIA - backend usa valores por defecto
  ejerciciosCompletados: z.union([
    z.coerce.number().min(0, 'Ejercicios completados no puede ser menor a 0%').max(100, 'Ejercicios completados no puede exceder 100%'),
    z.literal(''),
  ]).optional(),

  intensidadAlcanzada: z.union([
    z.coerce.number().min(0, 'Intensidad alcanzada no puede ser menor a 0%').max(100, 'Intensidad alcanzada no puede exceder 100%'),
    z.literal(''),
  ]).optional(),

  // Duracion real en minutos
  duracionReal: z.union([
    z.coerce.number().int('Duracion debe ser un numero entero (minutos)').min(1, 'La duracion debe ser al menos 1 minuto').max(480, 'La duracion no puede exceder 8 horas (480 minutos)'),
    z.literal(''),
  ]).optional(),

  // RPE (Rate of Perceived Exertion): 1-10
  rpe: z.union([
    z.coerce.number().int('RPE debe ser un numero entero').min(1, 'RPE debe ser minimo 1 (esfuerzo muy ligero)').max(10, 'RPE debe ser maximo 10 (esfuerzo maximo)'),
    z.literal(''),
  ]).optional(),

  // Calidad de sueno: 1-10
  calidadSueno: z.union([
    z.coerce.number().int('Calidad de sueno debe ser un numero entero').min(1, 'Calidad de sueno debe ser minimo 1 (muy mala)').max(10, 'Calidad de sueno debe ser maximo 10 (excelente)'),
    z.literal(''),
  ]).optional(),

  // Horas de sueno (opcional)
  horasSueno: z.union([
    z.coerce.number().min(0, 'Horas de sueno no puede ser negativo').max(24, 'Horas de sueno no puede exceder 24 horas'),
    z.literal(''),
  ]).optional(),

  // Estado animico: 1-10
  estadoAnimico: z.union([
    z.coerce.number().int('Estado animico debe ser un numero entero').min(1, 'Estado animico debe ser minimo 1 (muy mal)').max(10, 'Estado animico debe ser maximo 10 (excelente)'),
    z.literal(''),
  ]).optional(),

  // Dolencias (array opcional)
  dolencias: z.array(dolenciaSchema).optional(),

  // Rendimiento por ejercicio (obligatorio cuando asistio=true y sesion no es COMPETENCIA)
  // Opcional en Zod porque la validacion depende de asistio + tipoSesion
  rendimientosEjercicios: z.array(rendimientoEjercicioSchema).optional(),

  // Observaciones
  observaciones: z.string().max(1000, 'Las observaciones no pueden exceder 1000 caracteres').optional(),
}).refine(
  (data) => {
    // Si no asistio, debe tener motivo
    if (!data.asistio) {
      return data.motivoInasistencia && data.motivoInasistencia.trim().length > 0;
    }
    return true;
  },
  {
    message: 'Indica el motivo de inasistencia',
    path: ['motivoInasistencia'],
  }
);

export type CreateRegistroInput = z.infer<typeof createRegistroSchema>;

// Tipo para enviar al backend
// NOTA: Los campos de entrenamiento son opcionales para sesiones tipo COMPETENCIA
export type CreateRegistroPayload = {
  atletaId: number;
  sesionId: number;
  asistio: boolean;
  motivoInasistencia?: string;
  // Campos de entrenamiento (opcionales para COMPETENCIA)
  ejerciciosCompletados?: number;
  intensidadAlcanzada?: number;
  duracionReal?: number;
  rpe?: number;
  calidadSueno?: number;
  horasSueno?: number;
  estadoAnimico?: number;
  dolencias?: {
    zona: string;
    nivel: number;
    descripcion?: string;
    tipoLesion?: string;
  }[];
  // Rendimiento por ejercicio
  rendimientosEjercicios?: {
    ejercicioSesionId: number;
    completado: boolean;
    rendimiento?: number;
    dificultadPercibida?: number;
    tiempoReal?: number;
    observacion?: string;
    motivoNoCompletado?: string;
  }[];
  observaciones?: string;
};
