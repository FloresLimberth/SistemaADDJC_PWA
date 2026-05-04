import { z } from 'zod';
import {
  DiaSemanaValues,
  TipoSesionValues,
  TurnoValues,
  TipoPlanificacionValues,
  CreadoPorValues,
} from '@/types/enums';

// Schema para crear sesion
// Basado en: backend/src/modules/planificacion/dto/create-sesion.dto.ts

export const createSesionSchema = z.object({
  // Microciclo (requerido)
  microcicloId: z.string().min(1, 'El microciclo es requerido'),

  // Fecha
  fecha: z.string().min(1, 'La fecha es requerida'),

  // Dia de la semana
  diaSemana: z.enum(DiaSemanaValues as [string, ...string[]], {
    message: 'Selecciona un dia de la semana',
  }),

  // Numero de sesion en el microciclo (1-7)
  numeroSesion: z.coerce
    .number()
    .int('Debe ser un numero entero')
    .min(1, 'El numero de sesion debe ser al menos 1')
    .max(7, 'El numero de sesion no puede exceder 7'),

  // Tipo de sesion
  tipoSesion: z.enum(TipoSesionValues as [string, ...string[]], {
    message: 'Selecciona un tipo de sesion',
  }),

  // Turno (opcional, default: COMPLETO)
  turno: z.enum(TurnoValues as [string, ...string[]]).optional(),

  // Tipo de planificacion (opcional, default: INICIAL)
  tipoPlanificacion: z.enum(TipoPlanificacionValues as [string, ...string[]]).optional(),

  // Sesion base (para ajustes, opcional)
  sesionBaseId: z.string().optional(),

  // Creado por (opcional, default: COMITE_TECNICO)
  creadoPor: z.enum(CreadoPorValues as [string, ...string[]]).optional(),

  // Planificacion (duracion siempre requerida)
  duracionPlanificada: z.coerce
    .number()
    .int('Debe ser minutos enteros')
    .min(1, 'La duracion debe ser al menos 1 minuto'),

  // Opcionales para COMPETENCIA/DESCANSO
  volumenPlanificado: z.coerce
    .number()
    .int('Debe ser un numero entero')
    .min(0, 'El volumen debe ser positivo')
    .optional()
    .or(z.literal('')),

  intensidadPlanificada: z.coerce
    .number()
    .int('Debe ser un numero entero')
    .min(0, 'La intensidad debe ser positiva')
    .max(100, 'La intensidad no puede exceder 100%')
    .optional()
    .or(z.literal('')),

  // Datos reales (opcionales, usados por algoritmo de recomendacion)
  volumenReal: z.coerce.number().int().min(0).optional(),
  intensidadReal: z.coerce.number().int().min(0).max(100).optional(),

  // Contenidos (opcionales para COMPETENCIA/DESCANSO)
  contenidoFisico: z.string().optional().or(z.literal('')),
  contenidoTecnico: z.string().optional().or(z.literal('')),
  contenidoTactico: z.string().optional().or(z.literal('')),

  // Estructura de sesion (opcionales)
  calentamiento: z.string().optional(),
  partePrincipal: z.string().optional(),
  vueltaCalma: z.string().optional(),

  // Observaciones y material (opcionales)
  observaciones: z.string().optional(),
  materialNecesario: z.string().optional(),
});

export type CreateSesionInput = z.infer<typeof createSesionSchema>;

// Schema para actualizar sesion (todos los campos opcionales)
export const updateSesionSchema = z.object({
  microcicloId: z.string().optional(),
  fecha: z.string().optional(),
  diaSemana: z.enum(DiaSemanaValues as [string, ...string[]]).optional(),
  numeroSesion: z.coerce.number().int().min(1).max(7).optional(),
  tipoSesion: z.enum(TipoSesionValues as [string, ...string[]]).optional(),
  turno: z.enum(TurnoValues as [string, ...string[]]).optional(),
  tipoPlanificacion: z.enum(TipoPlanificacionValues as [string, ...string[]]).optional(),
  sesionBaseId: z.string().optional(),
  creadoPor: z.enum(CreadoPorValues as [string, ...string[]]).optional(),
  duracionPlanificada: z.coerce.number().int().min(1).optional(),
  volumenPlanificado: z.coerce.number().int().min(0).optional(),
  intensidadPlanificada: z.coerce.number().int().min(0).max(100).optional(),
  volumenReal: z.coerce.number().int().min(0).optional(),
  intensidadReal: z.coerce.number().int().min(0).max(100).optional(),
  contenidoFisico: z.string().optional(),
  contenidoTecnico: z.string().optional(),
  contenidoTactico: z.string().optional(),
  calentamiento: z.string().optional(),
  partePrincipal: z.string().optional(),
  vueltaCalma: z.string().optional(),
  observaciones: z.string().optional(),
  materialNecesario: z.string().optional(),
});

export type UpdateSesionInput = z.infer<typeof updateSesionSchema>;
