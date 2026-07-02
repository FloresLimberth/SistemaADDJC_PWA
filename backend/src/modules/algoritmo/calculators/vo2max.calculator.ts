// Calculador de VO2max basado en el test Navette (Luc Leger)
// Fuente: https://www.irbms.com/test-navette-de-luc-leger/

// Tabla de velocidades por palier (km/h)
// El test comienza en 8.5 km/h y aumenta 0.5 km/h por palier
const VELOCIDAD_INICIAL = 8.5;
const INCREMENTO_POR_PALIER = 0.5;

// Clasificacion de VO2max para hombres adultos
export const CLASIFICACION_VO2MAX = {
  MUY_POBRE: { min: 0, max: 35 },
  POBRE: { min: 35, max: 40 },
  PROMEDIO: { min: 40, max: 45 },
  BUENO: { min: 45, max: 50 },
  MUY_BUENO: { min: 50, max: 55 },
  EXCELENTE: { min: 55, max: 100 },
} as const;

export type ClasificacionVO2max = keyof typeof CLASIFICACION_VO2MAX;

export interface ResultadoVO2max {
  vo2max: number;
  clasificacion: ClasificacionVO2max;
  velocidadKmh: number;
}

// Convierte el palier a velocidad en km/h
export function palierAVelocidad(palier: number): number {
  // Palier 1 = 8.5 km/h, cada palier suma 0.5 km/h
  return VELOCIDAD_INICIAL + (palier - 1) * INCREMENTO_POR_PALIER;
}

// Formula de Leger completa
// VO2max = 31.025 + (3.238 x velocidad) - (3.248 x edad) + (0.1536 x edad x velocidad)
// Para mayores de 18 años, usar edad = 18
export function calcularVO2maxLeger(palier: number, edad: number): number {
  const velocidad = palierAVelocidad(palier);
  const edadAjustada = edad > 18 ? 18 : edad;

  const vo2max =
    31.025 + 3.238 * velocidad - 3.248 * edadAjustada + 0.1536 * edadAjustada * velocidad;

  return Math.round(vo2max * 100) / 100;
}

// Clasifica el VO2max segun la tabla de referencia
export function clasificarVO2max(vo2max: number): ClasificacionVO2max {
  if (vo2max >= CLASIFICACION_VO2MAX.EXCELENTE.min) return 'EXCELENTE';
  if (vo2max >= CLASIFICACION_VO2MAX.MUY_BUENO.min) return 'MUY_BUENO';
  if (vo2max >= CLASIFICACION_VO2MAX.BUENO.min) return 'BUENO';
  if (vo2max >= CLASIFICACION_VO2MAX.PROMEDIO.min) return 'PROMEDIO';
  if (vo2max >= CLASIFICACION_VO2MAX.POBRE.min) return 'POBRE';
  return 'MUY_POBRE';
}

// Funcion principal que calcula y clasifica el VO2max
export function calcularVO2max(palier: number, edad: number): ResultadoVO2max {
  const velocidad = palierAVelocidad(palier);
  const vo2max = calcularVO2maxLeger(palier, edad);
  const clasificacion = clasificarVO2max(vo2max);

  return {
    vo2max,
    clasificacion,
    velocidadKmh: velocidad,
  };
}
