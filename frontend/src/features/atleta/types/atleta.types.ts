import { z } from 'zod';
import {
  TipoLesionValues,
  TipoNotificacionValues,
  PrioridadValues,
  TipoMicrocicloValues,
  CreadoPorValues,
  SentidoCargaValues,
  EtapaMesocicloValues,
  DiaSemanaValues,
  TipoSesionValues,
  TurnoValues,
  TipoPlanificacionValues,
} from '@/types/enums';

// ===================================
// SCHEMAS PARA TESTS FISICOS
// ===================================

// Schema para TestFisico
// Verificado contra: backend/src/modules/testing/services/tests-fisicos.service.ts lineas 680-759
export const testFisicoSchema = z.object({
  id: z.string(),
  atletaId: z.string(),
  entrenadorRegistroId: z.string(),
  sesionId: z.string().nullable(),
  microcicloId: z.string().nullable(),
  fechaTest: z.coerce.date(),

  // Asistencia (schema.prisma lineas 233-234)
  asistio: z.boolean().optional(),
  motivoInasistencia: z.string().nullable().optional(),

  // Tests de fuerza maxima (1RM) - Backend retorna Decimal como string
  pressBanca: z.string().nullable(),
  pressBancaIntensidad: z.string().nullable(),
  tiron: z.string().nullable(),
  tironIntensidad: z.string().nullable(),
  sentadilla: z.string().nullable(),
  sentadillaIntensidad: z.string().nullable(),

  // Tests de fuerza resistencia - Backend retorna Int como number
  barraFija: z.number().int().nullable(),
  paralelas: z.number().int().nullable(),

  // Tests de resistencia aerobica - Backend retorna Decimal como string
  navettePalier: z.string().nullable(),
  navetteVO2max: z.string().nullable(),
  clasificacionVO2max: z.string().nullable(),
  objetivoVO2max: z.number(),
  test1500m: z.string().nullable(),

  // Observaciones
  observaciones: z.string().nullable(),
  condicionesTest: z.string().nullable(),

  // Metadata
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),

  // Relaciones opcionales
  atleta: z
    .object({
      id: z.string(),
      nombreCompleto: z.string(),
    })
    .optional(),
  entrenador: z
    .object({
      id: z.string(),
      nombreCompleto: z.string(),
    })
    .optional(),
  sesion: z
    .object({
      id: z.string(),
      fecha: z.coerce.date(),
      numeroSesion: z.number(),
    })
    .optional(),
  microciclo: z
    .object({
      id: z.string(),
      codigoMicrociclo: z.string(),
    })
    .optional(),
});

export type TestFisico = z.infer<typeof testFisicoSchema>;

// ===================================
// SCHEMAS PARA REGISTRO POST ENTRENAMIENTO
// ===================================

// Schema para RegistroPostEntrenamiento
// Verificado contra: backend/src/modules/registro-post-entrenamiento/registro-post-entrenamiento.service.ts lineas 355-411
export const registroPostEntrenamientoSchema = z.object({
  id: z.string(),
  atletaId: z.string(),
  sesionId: z.string(),
  entrenadorRegistroId: z.string(),
  fechaRegistro: z.coerce.date(),

  // Asistencia
  asistio: z.boolean(),
  motivoInasistencia: z.string().nullable(),

  // Ejecucion de la sesion - Backend retorna Decimal convertido a number
  ejerciciosCompletados: z.number(),
  intensidadAlcanzada: z.number(),
  duracionReal: z.number().int(),

  // RPE (Rate of Perceived Exertion)
  rpe: z.number().int().min(1).max(10),

  // Recuperacion - Backend retorna Decimal convertido a number
  calidadSueno: z.number().int().min(1).max(10),
  horasSueno: z.number().nullable(),

  // Estado animico
  estadoAnimico: z.number().int().min(1).max(10),

  // Observaciones
  observaciones: z.string().nullable(),

  // Metadata
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),

  // Relaciones opcionales
  atleta: z
    .object({
      id: z.string(),
      nombreCompleto: z.string(),
    })
    .optional(),
  sesion: z
    .object({
      id: z.string(),
      fecha: z.coerce.date(),
      numeroSesion: z.number(),
      tipoSesion: z.string(),
      microciclo: z
        .object({
          codigoMicrociclo: z.string(),
        })
        .optional(),
    })
    .optional(),
  entrenador: z
    .object({
      id: z.string(),
      nombreCompleto: z.string(),
    })
    .optional(),
  dolencias: z
    .array(
      z.object({
        id: z.string(),
        zona: z.string(),
        nivel: z.number().int().min(1).max(10),
        descripcion: z.string().nullable(),
        tipoLesion: z
          .enum(TipoLesionValues as [string, ...string[]])
          .nullable(),
        recuperado: z.boolean(),
        fechaRecuperacion: z.coerce.date().nullable(),
      })
    )
    .optional(),
});

export type RegistroPostEntrenamiento = z.infer<
  typeof registroPostEntrenamientoSchema
>;

// ===================================
// SCHEMAS PARA DOLENCIAS
// ===================================

// Schema para Dolencia
// Verificado contra: backend/src/modules/dolencias/dolencias.service.ts lineas 389-433
export const dolenciaSchema = z.object({
  id: z.string(),
  registroPostEntrenamientoId: z.string(),
  zona: z.string(),
  nivel: z.number().int().min(1).max(10),
  descripcion: z.string().nullable(),
  tipoLesion: z.enum(TipoLesionValues as [string, ...string[]]).nullable(),
  // Campos de recuperacion
  recuperado: z.boolean(),
  fechaRecuperacion: z.coerce.date().nullable(),
  recuperadoPor: z.string().nullable(),
  // Metadata
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  // Relaciones opcionales (incluidas en findAll, findOne, findActiveByAtleta)
  registroPostEntrenamiento: z
    .object({
      id: z.string(),
      fechaRegistro: z.coerce.date(),
      atleta: z
        .object({
          id: z.string(),
          nombreCompleto: z.string(),
        })
        .optional(),
      sesion: z
        .object({
          fecha: z.coerce.date(),
          numeroSesion: z.number(),
        })
        .optional(),
    })
    .optional(),
  entrenadorRecuperacion: z
    .object({
      id: z.string(),
      nombreCompleto: z.string(),
    })
    .optional(),
});

export type Dolencia = z.infer<typeof dolenciaSchema>;

// ===================================
// SCHEMAS PARA NOTIFICACIONES
// ===================================

// Schema para Notificacion (verificado con schema.prisma lineas 612-632)
export const notificacionSchema = z.object({
  id: z.string(),
  destinatarioId: z.string(),
  recomendacionId: z.string().nullable(),
  tipo: z.enum(TipoNotificacionValues as [string, ...string[]]),
  titulo: z.string(),
  mensaje: z.string(),
  leida: z.boolean(),
  fechaLeida: z.coerce.date().nullable(),
  prioridad: z.enum(PrioridadValues as [string, ...string[]]),
  // Metadata
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Notificacion = z.infer<typeof notificacionSchema>;

// ===================================
// SCHEMAS PARA PLANIFICACION (MICROCICLOS Y SESIONES)
// ===================================

// Schema para Microciclo
// Verificado contra: backend/src/modules/planificacion/services/microciclos.service.ts lineas 426-470
export const microcicloSchema = z.object({
  id: z.string(),
  mesocicloId: z.string().nullable(),
  codigoMicrociclo: z.string(),
  fechaInicio: z.coerce.date(),
  fechaFin: z.coerce.date(),
  tipoMicrociclo: z.enum(TipoMicrocicloValues as [string, ...string[]]),
  volumenTotal: z.number(),
  intensidadPromedio: z.number(),
  objetivoSemanal: z.string(),
  observaciones: z.string().nullable(),
  creadoPor: z.enum(CreadoPorValues as [string, ...string[]]),

  // Campos de carga - Backend retorna Decimal convertido a number
  mediaVolumen: z.number().nullable(),
  mediaIntensidad: z.number().nullable(),
  sentidoVolumen: z
    .enum(SentidoCargaValues as [string, ...string[]])
    .nullable(),
  sentidoIntensidad: z
    .enum(SentidoCargaValues as [string, ...string[]])
    .nullable(),

  // Metadata
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),

  // Relaciones opcionales
  mesociclo: z
    .object({
      id: z.string(),
      nombre: z.string(),
      etapa: z.enum(EtapaMesocicloValues as [string, ...string[]]),
    })
    .optional(),
  sesiones: z
    .array(
      z.object({
        id: z.string(),
        fecha: z.coerce.date(),
        diaSemana: z.enum(DiaSemanaValues as [string, ...string[]]),
        tipoSesion: z.enum(TipoSesionValues as [string, ...string[]]),
      })
    )
    .optional(),
});

export type Microciclo = z.infer<typeof microcicloSchema>;

// Schema para Sesion
// Verificado contra: backend/src/modules/planificacion/services/sesiones.service.ts lineas 334-374
export const sesionSchema = z.object({
  id: z.string(),
  microcicloId: z.string(),
  fecha: z.coerce.date(),
  diaSemana: z.enum(DiaSemanaValues as [string, ...string[]]),
  numeroSesion: z.number().int(),
  tipoSesion: z.enum(TipoSesionValues as [string, ...string[]]),
  turno: z.enum(TurnoValues as [string, ...string[]]),
  tipoPlanificacion: z.enum(TipoPlanificacionValues as [string, ...string[]]),
  sesionBaseId: z.string().nullable(),
  creadoPor: z.enum(CreadoPorValues as [string, ...string[]]),

  // Planificacion
  duracionPlanificada: z.number().int(),
  volumenPlanificado: z.number().nullable(),
  intensidadPlanificada: z.number().nullable(),
  // Datos reales (usados por algoritmo de recomendacion)
  volumenReal: z.number().nullable(),
  intensidadReal: z.number().nullable(),

  // Contenidos (nullable en schema.prisma)
  contenidoFisico: z.string().nullable(),
  contenidoTecnico: z.string().nullable(),
  contenidoTactico: z.string().nullable(),

  // Estructura de sesion
  calentamiento: z.string().nullable(),
  partePrincipal: z.string().nullable(),
  vueltaCalma: z.string().nullable(),

  // Observaciones
  observaciones: z.string().nullable(),
  materialNecesario: z.string().nullable(),

  // Campos del algoritmo (schema.prisma lineas 192-194)
  aprobado: z.boolean().optional(),
  perfilUtilizado: z.string().nullable().optional(),
  justificacionAlgoritmo: z.string().nullable().optional(),

  // Metadata
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),

  // Relacion con microciclo (opcional en respuesta)
  microciclo: z
    .object({
      id: z.string(),
      codigoMicrociclo: z.string(),
      fechaInicio: z.coerce.date(),
      fechaFin: z.coerce.date(),
    })
    .optional(),
});

export type Sesion = z.infer<typeof sesionSchema>;

// ===================================
// SCHEMAS PARA RESPUESTAS DE LA API
// ===================================

// Respuesta paginada generica
// Todos los endpoints del backend envian total, page, limit y totalPages
export const paginatedResponseSchema = <T extends z.ZodTypeAny>(
  dataSchema: T
) =>
  z.object({
    data: z.array(dataSchema),
    meta: z.object({
      total: z.number(),
      page: z.number(),
      limit: z.number(),
      totalPages: z.number(),
    }),
  });

export type PaginatedResponse<T> = {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};
