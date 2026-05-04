// Calculador de Z-Score para normalizar valores al contexto individual del atleta
// Z = (valor - media) / desviacion_estandar
// Fuente: SimpliFaster - Athlete Wellness Questionnaires
// https://simplifaster.com/articles/athlete-wellness-questionnaires-dos-donts/

// Umbrales de clasificacion basados en investigacion deportiva
// |Z| > 1.5: Desviacion significativa
// |Z| > 2.0: Desviacion critica que requiere atencion inmediata
export const UMBRALES_ZSCORE = {
  CRITICO_ALTO: 2.0,
  ALERTA_ALTA: 1.5,
  ALERTA_BAJA: -1.5,
  CRITICO_BAJO: -2.0,
  MINIMO_DATOS: 3,
} as const;

export type InterpretacionZScore =
  | 'CRITICO_BAJO'
  | 'ALERTA_BAJA'
  | 'NORMAL'
  | 'ALERTA_ALTA'
  | 'CRITICO_ALTO';

export interface ResultadoZScore {
  valorActual: number;
  media: number;
  desviacionEstandar: number;
  zScore: number;
  interpretacion: InterpretacionZScore;
  datosInsuficientes: boolean;
}

// Calcula la media aritmetica de un array de numeros
export function calcularMedia(valores: number[]): number {
  if (valores.length === 0) return 0;
  return valores.reduce((a, b) => a + b, 0) / valores.length;
}

// Calcula la desviacion estandar muestral (n-1) de un array de numeros
// Usa n-1 (desviacion muestral) porque trabajamos con una muestra, no la poblacion completa
export function calcularDesviacionEstandar(valores: number[], media?: number): number {
  if (valores.length < 2) return 0;
  const m = media ?? calcularMedia(valores);
  const sumaCuadrados = valores.reduce((sum, val) => sum + Math.pow(val - m, 2), 0);
  return Math.sqrt(sumaCuadrados / (valores.length - 1));
}

// Clasifica el Z-Score en una interpretacion
function clasificarZScore(zScore: number): InterpretacionZScore {
  if (zScore >= UMBRALES_ZSCORE.CRITICO_ALTO) return 'CRITICO_ALTO';
  if (zScore >= UMBRALES_ZSCORE.ALERTA_ALTA) return 'ALERTA_ALTA';
  if (zScore <= UMBRALES_ZSCORE.CRITICO_BAJO) return 'CRITICO_BAJO';
  if (zScore <= UMBRALES_ZSCORE.ALERTA_BAJA) return 'ALERTA_BAJA';
  return 'NORMAL';
}

// Calcula el Z-Score de un valor respecto a un historico
// Retorna datosInsuficientes=true si no hay suficientes datos (minimo 5)
export function calcularZScore(valorActual: number, historico: number[]): ResultadoZScore {
  // Verificar datos suficientes
  if (historico.length < UMBRALES_ZSCORE.MINIMO_DATOS) {
    return {
      valorActual,
      media: 0,
      desviacionEstandar: 0,
      zScore: 0,
      interpretacion: 'NORMAL',
      datosInsuficientes: true,
    };
  }

  const media = calcularMedia(historico);
  const desviacionEstandar = calcularDesviacionEstandar(historico, media);

  // Evitar division por cero (todos los valores son iguales)
  if (desviacionEstandar === 0) {
    return {
      valorActual,
      media: Math.round(media * 100) / 100,
      desviacionEstandar: 0,
      zScore: 0,
      interpretacion: 'NORMAL',
      datosInsuficientes: false,
    };
  }

  const zScore = (valorActual - media) / desviacionEstandar;
  const interpretacion = clasificarZScore(zScore);

  return {
    valorActual,
    media: Math.round(media * 100) / 100,
    desviacionEstandar: Math.round(desviacionEstandar * 100) / 100,
    zScore: Math.round(zScore * 100) / 100,
    interpretacion,
    datosInsuficientes: false,
  };
}

// Calcula Z-Score agrupado por tipo de ejercicio
// Util para analizar rendimiento por FISICO, TECNICO_TACHI, etc.
export function calcularZScorePorTipo(
  rendimientoActualPorTipo: Map<string, number>,
  historicoPorTipo: Map<string, number[]>
): Map<string, ResultadoZScore> {
  const resultado = new Map<string, ResultadoZScore>();

  for (const [tipo, valorActual] of rendimientoActualPorTipo) {
    const historico = historicoPorTipo.get(tipo) || [];
    resultado.set(tipo, calcularZScore(valorActual, historico));
  }

  return resultado;
}
