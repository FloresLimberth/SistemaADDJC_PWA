// Tipos exclusivos del modulo de progreso (graficos y KPIs)
// Los tipos compartidos (TestFisico, RegistroPostEntrenamiento, Dolencia, PaginatedResponse)
// se importan desde @/features/atleta/types/atleta.types.ts

// ===== Tipos para graficos (datos transformados) =====

// Datos transformados para gráfico de VO2max
export interface VO2maxDataPoint {
  timestamp: number; // Unix timestamp para eje X continuo
  fecha: string; // Fecha formateada para tooltip
  vo2max: number; // Valor numérico parseado
  clasificacion: string | null; // "Excelente", "Bueno", etc.
  palier: number; // Palier alcanzado
}

// Datos transformados para gráfico de RPE semanal
export interface RPEWeeklyDataPoint {
  semana: string; // "Semana 1", "Semana 2", etc. o rango de fechas
  rpePromedio: number; // Promedio de RPE de la semana
  sesiones: number; // Cantidad de sesiones en la semana
  fechaInicio: Date; // Fecha inicio de la semana
  fechaFin: Date; // Fecha fin de la semana
}

// Datos transformados para gráfico de comparación de tests
export interface TestsComparisonDataPoint {
  nombre: string; // "Press Banca", "Sentadilla", etc.
  actual: number; // Valor del último test
  mejor: number; // Mejor marca personal histórica
  unidad: string; // "kg", "repeticiones", "ml/kg/min"
}

// Datos transformados para gráfico de sueño
export interface SleepDataPoint {
  fecha: string; // Fecha formateada
  timestamp: number; // Unix timestamp
  calidadSueno: number; // 1-10
  horasSueno: number; // Horas con decimal parseado
}

// Datos transformados para gráfico de estado anímico
export interface EstadoAnimicoDataPoint {
  fecha: string;
  timestamp: number;
  estadoAnimico: number; // 1-10
}

// ===== KPIs para el dashboard de progreso =====

export interface ProgresoStats {
  vo2maxActual: number | null;
  vo2maxClasificacion: string | null;
  rpePromedio: number | null;
  testsRealizados: number;
  calidadSuenoPromedio: number | null;
  horasSuenoPromedio: number | null;
}
