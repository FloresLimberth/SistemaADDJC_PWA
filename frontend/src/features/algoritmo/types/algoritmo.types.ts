import { z } from 'zod';
import {
  CategoriaPesoValues,
  TipoRecomendacionValues,
  PrioridadValues,
  EstadoRecomendacionValues,
  TipoNotificacionValues,
  TipoAlertaValues,
  SeveridadValues,
  TipoEjercicioValues,
} from '@/types/enums';

// ===================================
// RANKING - Verificado contra:
// backend/src/modules/algoritmo/calculators/score.calculator.ts
// backend/src/modules/algoritmo/services/ranking.service.ts
// backend/src/modules/algoritmo/controllers/ranking.controller.ts
// ===================================

// Ratios de fuerza relativa (peso corporal)
// Verificado: score.calculator.ts linea ~68
export const ratiosFuerzaSchema = z.object({
  pressBanca: z.number().nullable(),
  tiron: z.number().nullable(),
  sentadilla: z.number().nullable(),
});

export type RatiosFuerza = z.infer<typeof ratiosFuerzaSchema>;

// Detalles del score desglosado
// Verificado: score.calculator.ts - ResultadoScore.detalles
export const scoreDetallesSchema = z.object({
  fuerzaMaxima: z.number(),
  fuerzaResistencia: z.number(),
  resistenciaAerobica: z.number(),
  nivelFatiga: z.number(),
  calidadRecuperacion: z.number(),
  estadoMental: z.number(),
  distanciaPesoOptimo: z.number(),
  ratiosFuerza: ratiosFuerzaSchema,
});

export type ScoreDetalles = z.infer<typeof scoreDetallesSchema>;

// Resultado del score compuesto
// Verificado: score.calculator.ts - interface ResultadoScore
// Pesos: FUERZA=0.25, RESISTENCIA=0.25, ESTADO=0.30, PESO=0.20
export const resultadoScoreSchema = z.object({
  scoreTotal: z.number(),
  scoreFuerza: z.number(),
  scoreResistencia: z.number(),
  scoreEstado: z.number(),
  scorePeso: z.number(),
  detalles: scoreDetallesSchema,
});

export type ResultadoScore = z.infer<typeof resultadoScoreSchema>;

// Atleta dentro del ranking
// Verificado: ranking.service.ts - serializado en controller con atletaId.toString()
export const rankingAtletaSchema = z.object({
  posicion: z.number(),
  atletaId: z.string(),
  nombreCompleto: z.string(),
  categoriaPeso: z.enum(CategoriaPesoValues as [string, ...string[]]),
  puntuacion: z.number(),
  score: resultadoScoreSchema,
  alertas: z.array(z.string()),
  justificacion: z.string(),
  aptoPara: z.enum(['COMPETIR', 'RESERVA', 'NO_APTO']),
});

export type RankingAtleta = z.infer<typeof rankingAtletaSchema>;

// Ranking de una categoria de peso
// Verificado: ranking.service.ts - interface ResultadoRanking
export const rankingCategoriaSchema = z.object({
  categoriaPeso: z.enum(CategoriaPesoValues as [string, ...string[]]),
  fechaGeneracion: z.coerce.date(),
  totalAtletas: z.number(),
  ranking: z.array(rankingAtletaSchema),
  mejorAtleta: rankingAtletaSchema.nullable(),
  resumen: z.string(),
});

export type RankingCategoria = z.infer<typeof rankingCategoriaSchema>;

// Ranking global (Record por categoria)
// Verificado: ranking.controller.ts GET /ranking - retorna objeto con keys de categoria
export type RankingGlobal = Record<string, RankingCategoria>;

// Ranking individual de un atleta
// Verificado: ranking.service.ts - obtenerRankingAtleta
export const rankingIndividualSchema = z.object({
  atleta: z.object({
    id: z.string(),
    nombreCompleto: z.string(),
    categoriaPeso: z.enum(CategoriaPesoValues as [string, ...string[]]),
  }),
  posicion: z.number().nullable(),
  totalEnCategoria: z.number(),
  puntuacion: z.number(),
  score: resultadoScoreSchema,
  alertas: z.array(z.string()),
  justificacion: z.string(),
  aptoPara: z.enum(['COMPETIR', 'RESERVA', 'NO_APTO']),
});

export type RankingIndividual = z.infer<typeof rankingIndividualSchema>;

// Mejores atletas de una categoria
// Verificado: ranking.service.ts - obtenerMejoresAtletas
export const mejoresAtletasSchema = z.object({
  categoriaPeso: z.enum(CategoriaPesoValues as [string, ...string[]]),
  mejores: z.array(rankingAtletaSchema),
  totalAtletas: z.number(),
  resumen: z.string(),
});

export type MejoresAtletas = z.infer<typeof mejoresAtletasSchema>;

// Estadisticas del ranking
// Verificado: ranking-atletas.service.ts - obtenerEstadisticasRanking
export const estadisticasRankingSchema = z.object({
  estadisticas: z.array(
    z.object({
      categoria: z.string(),
      totalAtletas: z.number(),
      aptos: z.number(),
      reservas: z.number(),
      noAptos: z.number(),
      mejorPuntuacion: z.number(),
    })
  ),
  totalGeneral: z.number(),
});

export type EstadisticasRanking = z.infer<typeof estadisticasRankingSchema>;

// ===================================
// RECOMENDACIONES - Verificado contra:
// backend/src/modules/recomendaciones/recomendaciones.service.ts (formatResponse linea 695-757)
// backend/src/modules/recomendaciones/recomendaciones.controller.ts
// ===================================

// Item del historial de recomendacion (Audit Trail)
// Verificado: recomendaciones.service.ts linea 602-612 (getHistorial)
export const historialRecomendacionSchema = z.object({
  id: z.string(),
  estadoAnterior: z.string().nullable(),
  estadoNuevo: z.string(),
  accion: z.string(),
  comentario: z.string().nullable(),
  datosAdicionales: z.unknown().optional(),
  usuario: z.string(),
  rolUsuario: z.string().optional(),
  fecha: z.coerce.date(),
});

export type HistorialRecomendacion = z.infer<typeof historialRecomendacionSchema>;

// Recomendacion completa
// Verificado: recomendaciones.service.ts - formatResponse linea 695-757
export const recomendacionSchema = z.object({
  id: z.string(),
  atletaId: z.string(),
  microcicloAfectadoId: z.string().nullable().optional(),
  tipo: z.enum(TipoRecomendacionValues as [string, ...string[]]),
  prioridad: z.enum(PrioridadValues as [string, ...string[]]),
  titulo: z.string(),
  mensaje: z.string(),
  datosAnalisis: z.unknown().nullable(),
  accionSugerida: z.string().nullable(),
  sesionesAfectadas: z.unknown().nullable(),
  generoSesiones: z.boolean(),
  sesionGeneradaId: z.string().nullable().optional(),
  estado: z.enum(EstadoRecomendacionValues as [string, ...string[]]),
  revisadoPor: z.string().nullable().optional(),
  fechaRevision: z.coerce.date().nullable().optional(),
  comentarioRevision: z.string().nullable().optional(),
  modificaciones: z.unknown().nullable().optional(),
  aplicadoPor: z.string().nullable().optional(),
  fechaAplicacion: z.coerce.date().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  // Relaciones opcionales (incluidas segun el endpoint)
  atleta: z
    .object({
      id: z.string(),
      nombreCompleto: z.string(),
    })
    .optional(),
  microcicloAfectado: z
    .object({
      id: z.string().optional(),
      codigoMicrociclo: z.string(),
      tipoMicrociclo: z.string(),
    })
    .optional(),
  sesionGenerada: z
    .object({
      id: z.string(),
      fecha: z.coerce.date(),
      tipoSesion: z.string(),
      aprobado: z.boolean(),
    })
    .optional(),
  // revisor y aplicador son strings (nombreCompleto) cuando se incluyen
  revisor: z.string().optional(),
  aplicador: z.string().optional(),
  historial: z.array(historialRecomendacionSchema).optional(),
});

export type Recomendacion = z.infer<typeof recomendacionSchema>;

// Respuesta paginada de recomendaciones
// Verificado: recomendaciones.service.ts - findAll linea 216-224
export const recomendacionesPaginadasSchema = z.object({
  data: z.array(recomendacionSchema),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
    pendientes: z.number().optional(),
  }),
});

export type RecomendacionesPaginadas = z.infer<typeof recomendacionesPaginadasSchema>;

// Estadisticas de recomendaciones
// Verificado: recomendaciones.service.ts - getEstadisticas linea 636-659
export const estadisticasRecomendacionesSchema = z.object({
  resumen: z.object({
    pendientes: z.number(),
    enProceso: z.number(),
    cumplidas: z.number(),
    rechazadas: z.number(),
    modificadas: z.number(),
    total: z.number(),
  }),
  pendientesPorPrioridad: z.object({
    CRITICA: z.number(),
    ALTA: z.number(),
    MEDIA: z.number(),
    BAJA: z.number(),
  }),
  tasaAprobacion: z.number(),
  tasaModificacion: z.number(),
});

export type EstadisticasRecomendaciones = z.infer<typeof estadisticasRecomendacionesSchema>;

// Feedback de rechazos
// Verificado: recomendaciones.service.ts - getFeedbackRechazos linea 683-691
export const feedbackRechazoSchema = z.object({
  id: z.string(),
  tipo: z.enum(TipoRecomendacionValues as [string, ...string[]]),
  prioridad: z.enum(PrioridadValues as [string, ...string[]]),
  motivoRechazo: z.string().nullable(),
  feedback: z.unknown().nullable(),
  categoriaPesoAtleta: z.enum(CategoriaPesoValues as [string, ...string[]]),
  fecha: z.coerce.date().nullable(),
});

export type FeedbackRechazo = z.infer<typeof feedbackRechazoSchema>;

// ===================================
// NOTIFICACIONES - Verificado contra:
// backend/src/modules/algoritmo/services/notificaciones.service.ts
// backend/src/modules/algoritmo/controllers/notificaciones.controller.ts
// ===================================

// Notificacion individual
// Verificado: notificaciones.service.ts - obtenerNotificacionesUsuario linea 284-303
export const notificacionAlgoritmoSchema = z.object({
  id: z.string(),
  destinatarioId: z.string(),
  recomendacionId: z.string().nullable(),
  tipo: z.enum(TipoNotificacionValues as [string, ...string[]]),
  titulo: z.string(),
  mensaje: z.string(),
  leida: z.boolean(),
  fechaLeida: z.coerce.date().nullable(),
  prioridad: z.enum(PrioridadValues as [string, ...string[]]),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  // Relacion opcional con recomendacion
  recomendacion: z
    .object({
      id: z.string(),
      tipo: z.string(),
      titulo: z.string(),
      estado: z.string(),
      accionSugerida: z.string().nullable().optional(),
    })
    .optional(),
});

export type NotificacionAlgoritmo = z.infer<typeof notificacionAlgoritmoSchema>;

// Respuesta paginada de notificaciones
// Verificado: notificaciones.service.ts linea 277-309
export const notificacionesPaginadasSchema = z.object({
  data: z.array(notificacionAlgoritmoSchema),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
    noLeidas: z.number(),
  }),
});

export type NotificacionesPaginadas = z.infer<typeof notificacionesPaginadasSchema>;

// Resumen de notificaciones
// Verificado: notificaciones.controller.ts - GET /resumen/general
export const resumenNotificacionesSchema = z.object({
  notificacionesNoLeidas: z.number(),
  alertasNoLeidas: z.number(),
  total: z.number(),
});

export type ResumenNotificaciones = z.infer<typeof resumenNotificacionesSchema>;

// Total para badge del Centro de Notificaciones (sidebar)
// Verificado: notificaciones.controller.ts - GET /centro/total
export const centroNotificacionesTotalSchema = z.object({
  recomendaciones: z.number(),
  alertas: z.number(),
  informativas: z.number(),
  total: z.number(),
});

export type CentroNotificacionesTotal = z.infer<typeof centroNotificacionesTotalSchema>;

// ===================================
// ALERTAS DEL SISTEMA - Verificado contra:
// backend/src/modules/algoritmo/services/alertas-sistema.service.ts
// ===================================

// Alerta para destinatario (paginada)
// Verificado: alertas-sistema.service.ts - obtenerAlertasDestinatario linea 465-480
export const alertaDestinatarioSchema = z.object({
  id: z.string(),
  alertaDestinatarioId: z.string(),
  atletaId: z.string(),
  atletaNombre: z.string(),
  tipo: z.enum(TipoAlertaValues as [string, ...string[]]),
  titulo: z.string(),
  descripcion: z.string(),
  severidad: z.enum(SeveridadValues as [string, ...string[]]),
  ocurrencias: z.number(),
  ultimaOcurrencia: z.coerce.date(),
  leida: z.boolean(),
  fechaLeida: z.coerce.date().nullable(),
  datosContexto: z.unknown().nullable(),
  createdAt: z.coerce.date(),
});

export type AlertaDestinatario = z.infer<typeof alertaDestinatarioSchema>;

// Respuesta paginada de alertas
// Verificado: alertas-sistema.service.ts linea 464-488
export const alertasPaginadasSchema = z.object({
  data: z.array(alertaDestinatarioSchema),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
});

export type AlertasPaginadas = z.infer<typeof alertasPaginadasSchema>;

// Alerta de un atleta (sin paginacion)
// Verificado: alertas-sistema.service.ts - obtenerAlertasAtleta linea 409-427
export const alertaAtletaSchema = z.object({
  id: z.string(),
  atletaId: z.string(),
  atletaNombre: z.string(),
  tipo: z.enum(TipoAlertaValues as [string, ...string[]]),
  titulo: z.string(),
  descripcion: z.string(),
  severidad: z.enum(SeveridadValues as [string, ...string[]]),
  ocurrencias: z.number(),
  ultimaOcurrencia: z.coerce.date(),
  datosContexto: z.unknown().nullable(),
  createdAt: z.coerce.date(),
  destinatarios: z.array(
    z.object({
      destinatarioId: z.string(),
      nombreDestinatario: z.string(),
      leida: z.boolean(),
      fechaLeida: z.coerce.date().nullable(),
    })
  ),
});

export type AlertaAtleta = z.infer<typeof alertaAtletaSchema>;

// ===================================
// ANALISIS DE RENDIMIENTO - Verificado contra:
// backend/src/modules/algoritmo/services/analisis-rendimiento.service.ts
// backend/src/modules/algoritmo/controllers/analisis-rendimiento.controller.ts
// backend/src/modules/algoritmo/calculators/zscore.calculator.ts
// backend/src/modules/algoritmo/calculators/tendencia.calculator.ts
// ===================================

// Resultado ZScore
// Verificado: zscore.calculator.ts - interface ResultadoZScore
export const resultadoZScoreSchema = z.object({
  valorActual: z.number(),
  media: z.number(),
  desviacionEstandar: z.number(),
  zScore: z.number(),
  interpretacion: z.enum([
    'CRITICO_BAJO',
    'ALERTA_BAJA',
    'NORMAL',
    'ALERTA_ALTA',
    'CRITICO_ALTO',
  ]),
  datosInsuficientes: z.boolean(),
});

export type ResultadoZScore = z.infer<typeof resultadoZScoreSchema>;

// Resultado Tendencia
// Verificado: tendencia.calculator.ts - interface ResultadoTendencia
export const resultadoTendenciaSchema = z.object({
  pendiente: z.number(),
  intercepto: z.number(),
  tendencia: z.enum(['MEJORANDO', 'ESTABLE', 'EMPEORANDO']),
  rSquared: z.number(),
  prediccionProximaSesion: z.number(),
  datosInsuficientes: z.boolean(),
});

export type ResultadoTendencia = z.infer<typeof resultadoTendenciaSchema>;

// Alternativa sugerida para un ejercicio
// Verificado: analisis-rendimiento controller linea 55-58
export const alternativaSugeridaSchema = z.object({
  ejercicioId: z.string(),
  nombre: z.string(),
  nivelDificultad: z.number(),
  razon: z.string(),
});

export type AlternativaSugerida = z.infer<typeof alternativaSugeridaSchema>;

// Ejercicio problematico detectado
// Verificado: analisis-rendimiento controller linea 52-58
export const ejercicioProblematicoSchema = z.object({
  ejercicioId: z.string(),
  nombre: z.string(),
  tipo: z.enum(TipoEjercicioValues as [string, ...string[]]),
  rendimientoPromedio: z.number(),
  vecesAsignado: z.number(),
  vecesCompletado: z.number(),
  vecesNoCompletado: z.number(),
  zScore: z.number().nullable(),
  tendencia: z.enum(['MEJORANDO', 'ESTABLE', 'EMPEORANDO']).nullable(),
  alternativasSugeridas: z.array(alternativaSugeridaSchema),
});

export type EjercicioProblematico = z.infer<typeof ejercicioProblematicoSchema>;

// Rendimiento por tipo de ejercicio
// Verificado: analisis-rendimiento.service.ts - RendimientoPorTipo
export const rendimientoPorTipoSchema = z.object({
  tipo: z.enum(TipoEjercicioValues as [string, ...string[]]),
  rendimientoPromedio: z.number(),
  cantidadRegistros: z.number(),
  zScore: resultadoZScoreSchema,
  tendencia: resultadoTendenciaSchema,
  ejerciciosProblematicos: z.array(ejercicioProblematicoSchema),
  alternativasSugeridasDelTipo: z.array(alternativaSugeridaSchema),
});

export type RendimientoPorTipo = z.infer<typeof rendimientoPorTipoSchema>;

// Patron detectado en el analisis
// Verificado: analisis-rendimiento controller linea 74-78
export const patronDetectadoSchema = z.object({
  tipo: z.enum([
    'BAJO_RENDIMIENTO_TIPO',
    'EJERCICIO_RECURRENTE_FALLA',
    'TENDENCIA_NEGATIVA',
    'MEJORA_DETECTADA',
  ]),
  severidad: z.enum(['BAJA', 'MEDIA', 'ALTA', 'CRITICA']),
  descripcion: z.string(),
  tipoEjercicioAfectado: z
    .enum(TipoEjercicioValues as [string, ...string[]])
    .optional(),
  ejercicioAfectado: z
    .object({
      id: z.string(),
      nombre: z.string(),
    })
    .optional(),
  datos: z.record(z.string(), z.unknown()),
});

export type PatronDetectado = z.infer<typeof patronDetectadoSchema>;

// Cambios sugeridos en recomendaciones de analisis
// Verificado: analisis-rendimiento controller linea 85-98
export const cambiosSugeridosSchema = z.object({
  reducir: z.array(
    z.object({
      ejercicioId: z.string(),
      nombre: z.string(),
      razon: z.string(),
    })
  ),
  agregar: z.array(
    z.object({
      ejercicioId: z.string(),
      nombre: z.string(),
      razon: z.string(),
    })
  ),
  modificar: z.array(
    z.object({
      ejercicioId: z.string(),
      cambio: z.string(),
    })
  ),
});

export type CambiosSugeridos = z.infer<typeof cambiosSugeridosSchema>;

// Recomendacion generada por reglas (analisis de rendimiento)
// Verificado: reglas-rendimiento.ts - AccionRecomendada + controller linea 83-98
export const recomendacionAnalisisSchema = z.object({
  reglaId: z.string().optional(),
  tipoRecomendacion: z.string(),
  prioridad: z.string(),
  titulo: z.string(),
  mensaje: z.string(),
  accionSugerida: z.string(),
  cambiosSugeridos: cambiosSugeridosSchema,
  datosAnalisis: z.record(z.string(), z.unknown()).optional(),
});

export type RecomendacionAnalisis = z.infer<typeof recomendacionAnalisisSchema>;

// Analisis completo de rendimiento
// Verificado: analisis-rendimiento controller linea 45-100
export const analisisRendimientoSchema = z.object({
  atletaId: z.string(),
  nombreAtleta: z.string(),
  periodoAnalisis: z.object({
    desde: z.coerce.date(),
    hasta: z.coerce.date(),
    diasAnalizados: z.number(),
  }),
  resumenGeneral: z.object({
    totalSesiones: z.number(),
    totalRegistros: z.number(),
    rendimientoGlobalPromedio: z.number(),
  }),
  rendimientoPorTipo: z.array(rendimientoPorTipoSchema),
  ejerciciosProblematicos: z.array(ejercicioProblematicoSchema),
  patrones: z.array(patronDetectadoSchema),
  requiereAtencion: z.boolean(),
  prioridadAtencion: z.enum(['BAJA', 'MEDIA', 'ALTA', 'CRITICA']),
  recomendaciones: z.array(recomendacionAnalisisSchema),
});

export type AnalisisRendimiento = z.infer<typeof analisisRendimientoSchema>;

// Recomendaciones simplificadas de analisis
// Verificado: analisis-rendimiento controller linea 131-160
export const recomendacionesSimplificadasSchema = z.object({
  atletaId: z.string(),
  nombreAtleta: z.string(),
  requiereAtencion: z.boolean(),
  prioridadAtencion: z.enum(['BAJA', 'MEDIA', 'ALTA', 'CRITICA']),
  cantidadRecomendaciones: z.number(),
  recomendaciones: z.array(
    z.object({
      tipoRecomendacion: z.string(),
      prioridad: z.string(),
      titulo: z.string(),
      mensaje: z.string(),
      accionSugerida: z.string(),
      cambiosSugeridos: cambiosSugeridosSchema,
    })
  ),
});

export type RecomendacionesSimplificadas = z.infer<typeof recomendacionesSimplificadasSchema>;

// ===================================
// CATALOGO DE EJERCICIOS - Verificado contra:
// backend/src/modules/algoritmo/controllers/catalogo-ejercicios.controller.ts
// ===================================

// Ejercicio del catalogo (respuesta findAll)
// Verificado: catalogo-ejercicios.controller.ts linea 64-73
export const catalogoEjercicioSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  tipo: z.enum(TipoEjercicioValues as [string, ...string[]]),
  subtipo: z.string().nullable(),
  categoria: z.string().nullable(),
  descripcion: z.string().nullable(),
  duracionMinutos: z.number().nullable(),
  nivelDificultad: z.number().nullable(),
});

export type CatalogoEjercicio = z.infer<typeof catalogoEjercicioSchema>;

// Respuesta de listado de ejercicios con paginacion
// Verificado: catalogo-ejercicios.controller.ts linea 75-90
export const catalogoEjerciciosResponseSchema = z.object({
  data: z.array(catalogoEjercicioSchema),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
    filtros: z.object({
      tipo: z.string().nullable(),
      activo: z.boolean(),
      search: z.string().nullable(),
    }),
  }),
});

export type CatalogoEjerciciosResponse = z.infer<typeof catalogoEjerciciosResponseSchema>;

// Ejercicio resumido (agrupado por tipo)
// Verificado: catalogo-ejercicios.controller.ts linea 122-128
export const ejercicioResumidoSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  subtipo: z.string().nullable(),
  categoria: z.string().nullable(),
});

export type EjercicioResumido = z.infer<typeof ejercicioResumidoSchema>;

// Respuesta agrupada por tipo
// Verificado: catalogo-ejercicios.controller.ts linea 131-143
export const ejerciciosPorTipoResponseSchema = z.object({
  data: z.object({
    FISICO: z.array(ejercicioResumidoSchema),
    TECNICO_TACHI: z.array(ejercicioResumidoSchema),
    TECNICO_NE: z.array(ejercicioResumidoSchema),
    RESISTENCIA: z.array(ejercicioResumidoSchema),
    VELOCIDAD: z.array(ejercicioResumidoSchema),
  }),
  meta: z.object({
    totales: z.object({
      FISICO: z.number(),
      TECNICO_TACHI: z.number(),
      TECNICO_NE: z.number(),
      RESISTENCIA: z.number(),
      VELOCIDAD: z.number(),
    }),
  }),
});

export type EjerciciosPorTipoResponse = z.infer<typeof ejerciciosPorTipoResponseSchema>;
