// Enums compartidos entre backend y frontend
// Fuente: backend/prisma/schema.prisma
// IMPORTANTE: Estos enums DEBEN mantenerse sincronizados con el backend

// Enum de roles de usuario
export const RolUsuario = {
  ADMINISTRADOR: 'ADMINISTRADOR',
  COMITE_TECNICO: 'COMITE_TECNICO',
  ENTRENADOR: 'ENTRENADOR',
  ATLETA: 'ATLETA',
} as const;

export type RolUsuario = typeof RolUsuario[keyof typeof RolUsuario];

// Enum de categorias de peso
export const CategoriaPeso = {
  MENOS_60K: 'MENOS_60K',
  MENOS_66K: 'MENOS_66K',
  MENOS_73K: 'MENOS_73K',
  MENOS_81K: 'MENOS_81K',
  MENOS_90K: 'MENOS_90K',
  MENOS_100K: 'MENOS_100K',
  MAS_100K: 'MAS_100K',
} as const;

export type CategoriaPeso = typeof CategoriaPeso[keyof typeof CategoriaPeso];

// Enum de estado de macrociclo
export const EstadoMacrociclo = {
  PLANIFICADO: 'PLANIFICADO',
  EN_CURSO: 'EN_CURSO',
  COMPLETADO: 'COMPLETADO',
  CANCELADO: 'CANCELADO',
} as const;

export type EstadoMacrociclo = typeof EstadoMacrociclo[keyof typeof EstadoMacrociclo];

// Enum de etapa de mesociclo
export const EtapaMesociclo = {
  PREPARACION_GENERAL: 'PREPARACION_GENERAL',
  PREPARACION_ESPECIFICA: 'PREPARACION_ESPECIFICA',
  COMPETITIVA: 'COMPETITIVA',
  TRANSICION: 'TRANSICION',
} as const;

export type EtapaMesociclo = typeof EtapaMesociclo[keyof typeof EtapaMesociclo];

// Enum de tipo de microciclo
export const TipoMicrociclo = {
  CARGA: 'CARGA',
  DESCARGA: 'DESCARGA',
  CHOQUE: 'CHOQUE',
  RECUPERACION: 'RECUPERACION',
  COMPETITIVO: 'COMPETITIVO',
} as const;

export type TipoMicrociclo = typeof TipoMicrociclo[keyof typeof TipoMicrociclo];

// Enum de sentido de carga
export const SentidoCarga = {
  ASCENDENTE: 'ASCENDENTE',
  DESCENDENTE: 'DESCENDENTE',
  MANTENIMIENTO: 'MANTENIMIENTO',
} as const;

export type SentidoCarga = typeof SentidoCarga[keyof typeof SentidoCarga];

// Enum de creado por
export const CreadoPor = {
  COMITE_TECNICO: 'COMITE_TECNICO',
  SISTEMA_ALGORITMO: 'SISTEMA_ALGORITMO',
} as const;

export type CreadoPor = typeof CreadoPor[keyof typeof CreadoPor];

// Enum de dia de semana
export const DiaSemana = {
  LUNES: 'LUNES',
  MARTES: 'MARTES',
  MIERCOLES: 'MIERCOLES',
  JUEVES: 'JUEVES',
  VIERNES: 'VIERNES',
  SABADO: 'SABADO',
  DOMINGO: 'DOMINGO',
} as const;

export type DiaSemana = typeof DiaSemana[keyof typeof DiaSemana];

// Enum de tipo de sesion
export const TipoSesion = {
  ENTRENAMIENTO: 'ENTRENAMIENTO',
  TEST: 'TEST',
  RECUPERACION: 'RECUPERACION',
  DESCANSO: 'DESCANSO',
  COMPETENCIA: 'COMPETENCIA',
} as const;

export type TipoSesion = typeof TipoSesion[keyof typeof TipoSesion];

// Enum de turno
export const Turno = {
  MANANA: 'MANANA',
  TARDE: 'TARDE',
  COMPLETO: 'COMPLETO',
} as const;

export type Turno = typeof Turno[keyof typeof Turno];

// Enum de tipo de planificacion
export const TipoPlanificacion = {
  INICIAL: 'INICIAL',
  AJUSTE_AUTOMATICO: 'AJUSTE_AUTOMATICO',
} as const;

export type TipoPlanificacion = typeof TipoPlanificacion[keyof typeof TipoPlanificacion];

// Enum de tipo de recomendacion
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

export type TipoRecomendacion = typeof TipoRecomendacion[keyof typeof TipoRecomendacion];

// Enum de prioridad
export const Prioridad = {
  BAJA: 'BAJA',
  MEDIA: 'MEDIA',
  ALTA: 'ALTA',
  CRITICA: 'CRITICA',
} as const;

export type Prioridad = typeof Prioridad[keyof typeof Prioridad];

// Enum de estado de recomendacion
export const EstadoRecomendacion = {
  PENDIENTE: 'PENDIENTE',
  EN_PROCESO: 'EN_PROCESO',
  CUMPLIDA: 'CUMPLIDA',
  RECHAZADA: 'RECHAZADA',
  MODIFICADA: 'MODIFICADA',
} as const;

export type EstadoRecomendacion = typeof EstadoRecomendacion[keyof typeof EstadoRecomendacion];

// Enum de tipo de notificacion
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

export type TipoNotificacion = typeof TipoNotificacion[keyof typeof TipoNotificacion];

// Enum de tipo de lesion
export const TipoLesion = {
  MOLESTIA: 'MOLESTIA',
  DOLOR_AGUDO: 'DOLOR_AGUDO',
  LESION_CRONICA: 'LESION_CRONICA',
  OTRO: 'OTRO',
} as const;

export type TipoLesion = typeof TipoLesion[keyof typeof TipoLesion];

// Enum de tipo de alerta
export const TipoAlerta = {
  BAJO_RENDIMIENTO: 'BAJO_RENDIMIENTO',
  PESO_FUERA_RANGO: 'PESO_FUERA_RANGO',
  LESION_DETECTADA: 'LESION_DETECTADA',
  TEST_FALLIDO: 'TEST_FALLIDO',
  FATIGA_ALTA: 'FATIGA_ALTA',
  DESVIACION_CARGA: 'DESVIACION_CARGA',
} as const;

export type TipoAlerta = typeof TipoAlerta[keyof typeof TipoAlerta];

// Enum de severidad
export const Severidad = {
  BAJA: 'BAJA',
  MEDIA: 'MEDIA',
  ALTA: 'ALTA',
  CRITICA: 'CRITICA',
} as const;

export type Severidad = typeof Severidad[keyof typeof Severidad];

// Enum de periodo de tolerancia
export const PeriodoTolerancia = {
  GENERAL: 'GENERAL',
  ESPECIFICA_I: 'ESPECIFICA_I',
  ESPECIFICA_II: 'ESPECIFICA_II',
  PRE_COMPETITIVA: 'PRE_COMPETITIVA',
  COMPETITIVA: 'COMPETITIVA',
} as const;

export type PeriodoTolerancia = typeof PeriodoTolerancia[keyof typeof PeriodoTolerancia];

// Enum de tipo de ejercicio
export const TipoEjercicio = {
  FISICO: 'FISICO',
  TECNICO_TACHI: 'TECNICO_TACHI',
  TECNICO_NE: 'TECNICO_NE',
  RESISTENCIA: 'RESISTENCIA',
  VELOCIDAD: 'VELOCIDAD',
} as const;

export type TipoEjercicio = typeof TipoEjercicio[keyof typeof TipoEjercicio];

// Enum de perfil de atleta
export const PerfilAtleta = {
  VELOZ: 'VELOZ',
  RESISTENTE: 'RESISTENTE',
  EQUILIBRADO: 'EQUILIBRADO',
  NUEVO: 'NUEVO',
} as const;

export type PerfilAtleta = typeof PerfilAtleta[keyof typeof PerfilAtleta];

// Arrays de valores para usar con z.enum() en Zod
export const RolUsuarioValues = Object.values(RolUsuario);
export const CategoriaPesoValues = Object.values(CategoriaPeso);
export const EstadoMacrocicloValues = Object.values(EstadoMacrociclo);
export const EtapaMesocicloValues = Object.values(EtapaMesociclo);
export const TipoMicrocicloValues = Object.values(TipoMicrociclo);
export const SentidoCargaValues = Object.values(SentidoCarga);
export const CreadoPorValues = Object.values(CreadoPor);
export const DiaSemanaValues = Object.values(DiaSemana);
export const TipoSesionValues = Object.values(TipoSesion);
export const TurnoValues = Object.values(Turno);
export const TipoPlanificacionValues = Object.values(TipoPlanificacion);
export const TipoRecomendacionValues = Object.values(TipoRecomendacion);
export const PrioridadValues = Object.values(Prioridad);
export const EstadoRecomendacionValues = Object.values(EstadoRecomendacion);
export const TipoNotificacionValues = Object.values(TipoNotificacion);
export const TipoLesionValues = Object.values(TipoLesion);
export const TipoAlertaValues = Object.values(TipoAlerta);
export const SeveridadValues = Object.values(Severidad);
export const PeriodoToleranciaValues = Object.values(PeriodoTolerancia);
export const TipoEjercicioValues = Object.values(TipoEjercicio);
export const PerfilAtletaValues = Object.values(PerfilAtleta);

// Datos estaticos de municipios y clubes de ADDJC
// Fuente: respuestas.txt del cliente
export const MUNICIPIOS_CLUB = [
  'Cochabamba',
  'Tiquipaya',
  'Colcapirhua',
  'Quillacollo',
] as const;

export type MunicipioClub = typeof MUNICIPIOS_CLUB[number];

// Relacion municipio -> clubes
export const CLUBES_POR_MUNICIPIO: Record<MunicipioClub, readonly string[]> = {
  Cochabamba: ['Asaji', 'Eishoji', 'Sonkey'],
  Tiquipaya: ['Takeshi', 'Nihon'],
  Colcapirhua: ['Aguilas', 'Mifune'],
  Quillacollo: ['Tigre', 'Fukuda'],
} as const;

// Array plano de todos los clubes (para validaciones)
export const TODOS_LOS_CLUBES = Object.values(CLUBES_POR_MUNICIPIO).flat();
