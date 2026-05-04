// Paleta centralizada de colores para graficos del sistema ADDJC
// Colores semanticos consistentes en todos los charts

export const COLORES_GRAFICO = {
  // Colores primarios por metrica
  azul: '#3b82f6', // Lineas generales, resistencia, VO2max
  rojo: '#ef4444', // Fuerza, alertas, RPE alto, referencia
  verde: '#10b981', // Peso, positivo, completado, mejor marca
  ambar: '#f59e0b', // RPE, advertencia, reserva energetica
  violeta: '#8b5cf6', // Estado animico, sueno, secundario
  cyan: '#06b6d4', // Animo, informativo, calidad sueno
  naranja: '#f97316', // Umbral fatiga, comparacion, carga

  // Aliases semanticos para uso directo en graficos
  resistencia: '#3b82f6',
  fuerza: '#ef4444',
  peso: '#10b981',
  rpe: '#f59e0b',
  sueno: '#8b5cf6',
  animo: '#06b6d4',
  fatiga: '#f97316',

  // Colores para estados y umbrales
  umbralAlto: '#ef4444',
  umbralBajo: '#f59e0b',
  referencia: '#9ca3af',
  meta: '#10b981',

  // Colores para comparaciones (actual vs anterior)
  actual: '#3b82f6',
  anterior: '#93c5fd',
  mejor: '#10b981',

  // Colores para grid y ejes (consistentes con Recharts existentes)
  grid: '#e5e7eb',
  ejeTexto: '#6b7280',
} as const;

// Tipo para autocompletado
export type ColorGrafico = keyof typeof COLORES_GRAFICO;
