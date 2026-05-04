// Tipos y enums del schema Prisma para el frontend
// IMPORTANTE: Los BigInt de Prisma se convierten a string en el frontend

// ===================================
// ENUMS DE LA BASE DE DATOS
// ===================================

export const RolUsuario = {
  ADMINISTRADOR: 'ADMINISTRADOR',
  COMITE_TECNICO: 'COMITE_TECNICO',
  ENTRENADOR: 'ENTRENADOR',
  ATLETA: 'ATLETA',
} as const;

export type RolUsuario = (typeof RolUsuario)[keyof typeof RolUsuario];

export const TipoSesion = {
  ENTRENAMIENTO: 'ENTRENAMIENTO',
  TEST: 'TEST',
  RECUPERACION: 'RECUPERACION',
  DESCANSO: 'DESCANSO',
  COMPETENCIA: 'COMPETENCIA',
} as const;

export type TipoSesion = (typeof TipoSesion)[keyof typeof TipoSesion];

export const DiaSemana = {
  LUNES: 'LUNES',
  MARTES: 'MARTES',
  MIERCOLES: 'MIERCOLES',
  JUEVES: 'JUEVES',
  VIERNES: 'VIERNES',
  SABADO: 'SABADO',
  DOMINGO: 'DOMINGO',
} as const;

export type DiaSemana = (typeof DiaSemana)[keyof typeof DiaSemana];

export const TipoMicrociclo = {
  CARGA: 'CARGA',
  DESCARGA: 'DESCARGA',
  CHOQUE: 'CHOQUE',
  RECUPERACION: 'RECUPERACION',
  COMPETITIVO: 'COMPETITIVO',
} as const;

export type TipoMicrociclo = (typeof TipoMicrociclo)[keyof typeof TipoMicrociclo];

export const Turno = {
  MANANA: 'MANANA',
  TARDE: 'TARDE',
  COMPLETO: 'COMPLETO',
} as const;

export type Turno = (typeof Turno)[keyof typeof Turno];

export const TipoPlanificacion = {
  INICIAL: 'INICIAL',
  AJUSTE_AUTOMATICO: 'AJUSTE_AUTOMATICO',
} as const;

export type TipoPlanificacion = (typeof TipoPlanificacion)[keyof typeof TipoPlanificacion];

export const TipoRecomendacion = {
  INICIAL: 'INICIAL',
  AJUSTE_POST_TEST: 'AJUSTE_POST_TEST',
  ALERTA_FATIGA: 'ALERTA_FATIGA',
  AJUSTE_LESION: 'AJUSTE_LESION',
  ALERTA_DESVIACION_CARGA: 'ALERTA_DESVIACION_CARGA',
  PERSONALIZACION_TACTICA: 'PERSONALIZACION_TACTICA',
  NUTRICIONAL: 'NUTRICIONAL',
  AJUSTE_PLANIFICACION: 'AJUSTE_PLANIFICACION',
} as const;

export type TipoRecomendacion = (typeof TipoRecomendacion)[keyof typeof TipoRecomendacion];

export const Prioridad = {
  BAJA: 'BAJA',
  MEDIA: 'MEDIA',
  ALTA: 'ALTA',
  CRITICA: 'CRITICA',
} as const;

export type Prioridad = (typeof Prioridad)[keyof typeof Prioridad];

export const EstadoRecomendacion = {
  PENDIENTE: 'PENDIENTE',
  EN_PROCESO: 'EN_PROCESO',
  CUMPLIDA: 'CUMPLIDA',
  RECHAZADA: 'RECHAZADA',
} as const;

export type EstadoRecomendacion = (typeof EstadoRecomendacion)[keyof typeof EstadoRecomendacion];

export const TipoNotificacion = {
  RECOMENDACION_ALGORITMO: 'RECOMENDACION_ALGORITMO',
  ALERTA_FATIGA: 'ALERTA_FATIGA',
  ALERTA_LESION: 'ALERTA_LESION',
  PLANIFICACION_APROBADA: 'PLANIFICACION_APROBADA',
  PLANIFICACION_MODIFICADA: 'PLANIFICACION_MODIFICADA',
  SESION_PROXIMA: 'SESION_PROXIMA',
  TEST_PENDIENTE: 'TEST_PENDIENTE',
  OTRO: 'OTRO',
} as const;

export type TipoNotificacion = (typeof TipoNotificacion)[keyof typeof TipoNotificacion];

export const TipoLesion = {
  MOLESTIA: 'MOLESTIA',
  DOLOR_AGUDO: 'DOLOR_AGUDO',
  LESION_CRONICA: 'LESION_CRONICA',
  OTRO: 'OTRO',
} as const;

export type TipoLesion = (typeof TipoLesion)[keyof typeof TipoLesion];
