// Constantes compartidas para la visualizacion de sesiones
// Usado por comite-tecnico y entrenador

export const TIPO_SESION_COLORS: Record<string, string> = {
  ENTRENAMIENTO: 'bg-blue-100 text-blue-800',
  TEST: 'bg-purple-100 text-purple-800',
  RECUPERACION: 'bg-green-100 text-green-800',
  DESCANSO: 'bg-gray-100 text-gray-800',
  COMPETENCIA: 'bg-orange-100 text-orange-800',
};

export const TIPO_SESION_LABELS: Record<string, string> = {
  ENTRENAMIENTO: 'Entrenamiento',
  TEST: 'Test',
  RECUPERACION: 'Recuperacion',
  DESCANSO: 'Descanso',
  COMPETENCIA: 'Competencia',
};

export const TURNO_LABELS: Record<string, string> = {
  MANANA: 'Manana',
  TARDE: 'Tarde',
  COMPLETO: 'Completo',
};

export const DIA_LABELS: Record<string, string> = {
  LUNES: 'Lun',
  MARTES: 'Mar',
  MIERCOLES: 'Mie',
  JUEVES: 'Jue',
  VIERNES: 'Vie',
  SABADO: 'Sab',
  DOMINGO: 'Dom',
};

export const DIA_LABELS_FULL: Record<string, string> = {
  LUNES: 'Lunes',
  MARTES: 'Martes',
  MIERCOLES: 'Miercoles',
  JUEVES: 'Jueves',
  VIERNES: 'Viernes',
  SABADO: 'Sabado',
  DOMINGO: 'Domingo',
};

export const TIPO_PLANIFICACION_LABELS: Record<string, string> = {
  INICIAL: 'Inicial',
  AJUSTE_AUTOMATICO: 'Ajuste automatico',
};

export const CREADO_POR_LABELS: Record<string, string> = {
  COMITE_TECNICO: 'Comite Tecnico',
  SISTEMA_ALGORITMO: 'Algoritmo',
};
