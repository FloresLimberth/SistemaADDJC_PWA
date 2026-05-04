// Calculador de Tendencias usando regresion lineal simple
// Determina si el rendimiento esta mejorando, estable o empeorando
// Fuente: athletemonitoring - GitHub
// https://github.com/mladenjovanovic/athletemonitoring

// Umbrales para clasificar la tendencia
// Basados en la pendiente de la linea de regresion
export const UMBRALES_TENDENCIA = {
  MEJORANDO: 0.1, // Pendiente > 0.1 = mejorando
  EMPEORANDO: -0.1, // Pendiente < -0.1 = empeorando
  MINIMO_PUNTOS: 3, // Minimo de puntos para tendencia valida
} as const;

export type ClasificacionTendencia = 'MEJORANDO' | 'ESTABLE' | 'EMPEORANDO';

export interface PuntoTemporal {
  fecha: Date;
  valor: number;
}

export interface ResultadoTendencia {
  pendiente: number;
  intercepto: number;
  tendencia: ClasificacionTendencia;
  rSquared: number; // Coeficiente de determinacion (confianza del modelo)
  prediccionProximaSesion: number;
  datosInsuficientes: boolean;
}

// Calcula regresion lineal simple: y = mx + b
// donde m es la pendiente y b es el intercepto
// Retorna R-squared para medir que tan bien se ajusta la linea
export function regresionLineal(puntos: PuntoTemporal[]): {
  pendiente: number;
  intercepto: number;
  rSquared: number;
} {
  const n = puntos.length;
  if (n < 2) {
    return { pendiente: 0, intercepto: 0, rSquared: 0 };
  }

  // Convertir fechas a valores numericos (dias desde el primer punto)
  const primerDia = puntos[0].fecha.getTime();
  const datos = puntos.map((p) => ({
    x: (p.fecha.getTime() - primerDia) / (1000 * 60 * 60 * 24), // Dias
    y: p.valor,
  }));

  // Calcular sumas para la formula de regresion lineal
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  for (const { x, y } of datos) {
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  }

  // Calcular pendiente e intercepto
  const denominador = n * sumX2 - sumX * sumX;
  if (denominador === 0) {
    return { pendiente: 0, intercepto: sumY / n, rSquared: 0 };
  }

  const pendiente = (n * sumXY - sumX * sumY) / denominador;
  const intercepto = (sumY - pendiente * sumX) / n;

  // Calcular R-squared (coeficiente de determinacion)
  // R^2 = 1 - (SS_res / SS_tot)
  // Donde SS_res = suma de residuos al cuadrado
  //       SS_tot = suma total de cuadrados
  const mediaY = sumY / n;
  let ssTot = 0;
  let ssRes = 0;

  for (const { x, y } of datos) {
    const yPredicho = pendiente * x + intercepto;
    ssTot += Math.pow(y - mediaY, 2);
    ssRes += Math.pow(y - yPredicho, 2);
  }

  const rSquared = ssTot === 0 ? 0 : 1 - ssRes / ssTot;

  return {
    pendiente: Math.round(pendiente * 1000) / 1000,
    intercepto: Math.round(intercepto * 100) / 100,
    rSquared: Math.round(rSquared * 100) / 100,
  };
}

// Clasifica la tendencia basado en la pendiente
function clasificarTendencia(pendiente: number): ClasificacionTendencia {
  if (pendiente > UMBRALES_TENDENCIA.MEJORANDO) return 'MEJORANDO';
  if (pendiente < UMBRALES_TENDENCIA.EMPEORANDO) return 'EMPEORANDO';
  return 'ESTABLE';
}

// Calcula la tendencia de un conjunto de puntos temporales
// Retorna datosInsuficientes=true si hay menos de 5 puntos
export function calcularTendencia(puntos: PuntoTemporal[]): ResultadoTendencia {
  // Verificar datos suficientes
  if (puntos.length < UMBRALES_TENDENCIA.MINIMO_PUNTOS) {
    return {
      pendiente: 0,
      intercepto: 0,
      tendencia: 'ESTABLE',
      rSquared: 0,
      prediccionProximaSesion: puntos.length > 0 ? puntos[puntos.length - 1].valor : 0,
      datosInsuficientes: true,
    };
  }

  // Ordenar por fecha (de mas antiguo a mas reciente)
  const puntosOrdenados = [...puntos].sort((a, b) => a.fecha.getTime() - b.fecha.getTime());

  // Calcular regresion
  const { pendiente, intercepto, rSquared } = regresionLineal(puntosOrdenados);

  // Clasificar tendencia
  const tendencia = clasificarTendencia(pendiente);

  // Predecir siguiente valor (asumiendo 1 dia despues del ultimo)
  const ultimoDia = puntosOrdenados[puntosOrdenados.length - 1].fecha;
  const primerDia = puntosOrdenados[0].fecha;
  const diasTranscurridos = (ultimoDia.getTime() - primerDia.getTime()) / (1000 * 60 * 60 * 24);
  const prediccionBruta = pendiente * (diasTranscurridos + 1) + intercepto;

  // Limitar prediccion al rango valido de rendimiento (0-10)
  const prediccion = Math.max(0, Math.min(10, prediccionBruta));

  return {
    pendiente,
    intercepto,
    tendencia,
    rSquared,
    prediccionProximaSesion: Math.round(prediccion * 10) / 10,
    datosInsuficientes: false,
  };
}

// Calcula tendencias agrupadas por tipo de ejercicio
// Util para analizar tendencia por FISICO, TECNICO_TACHI, etc.
export function calcularTendenciaPorTipo(
  datosPorTipo: Map<string, PuntoTemporal[]>
): Map<string, ResultadoTendencia> {
  const resultado = new Map<string, ResultadoTendencia>();

  for (const [tipo, puntos] of datosPorTipo) {
    resultado.set(tipo, calcularTendencia(puntos));
  }

  return resultado;
}
