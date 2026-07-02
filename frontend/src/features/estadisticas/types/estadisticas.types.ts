// Tipos para el modulo de estadisticas (Comite Tecnico + Entrenador)
// Los tipos de progreso del atleta estan en features/progreso/types/

// Datos para radar chart de tests fisicos (normalizados 0-100)
export interface RadarTestDataPoint {
  metrica: string; // "Press Banca", "Sentadilla", etc.
  valor: number; // Valor normalizado 0-100
  valorReal: number; // Valor original (kg, reps, ml/kg/min)
  unidad: string; // "kg", "repeticiones", "ml/kg/min"
}

// Datos para grafico de distribucion de carga semanal
export interface CargaSemanalDataPoint {
  semana: string; // "Sem 1", "Sem 2", etc.
  cargaReal: number; // Carga total real (volumen * intensidad)
  cargaPlanificada: number; // Carga planificada
  acwr: number | null; // Ratio carga aguda:cronica
}

// Datos para grafico de composicion de sesion
export interface ComposicionSesionDataPoint {
  tipo: string; // "Fisico", "Tecnico Tachi", "Tecnico Ne", etc.
  minutos: number; // Duracion en minutos
  porcentaje: number; // % del total
}

// Datos para grafico de tendencia de RPE grupal
export interface RPEGrupalDataPoint {
  fecha: string;
  timestamp: number;
  rpePromedio: number; // Promedio del grupo
  rpeMax: number; // RPE mas alto del grupo
  rpeMin: number; // RPE mas bajo del grupo
}

// Datos para grafico de asistencia
export interface AsistenciaDataPoint {
  semana: string;
  asistieron: number;
  faltaron: number;
  porcentaje: number;
}

// Filtros comunes para estadisticas
export interface FiltrosEstadisticas {
  atletaId?: number;
  macrocicloId?: number;
  fechaInicio?: string; // ISO date
  fechaFin?: string; // ISO date
}
