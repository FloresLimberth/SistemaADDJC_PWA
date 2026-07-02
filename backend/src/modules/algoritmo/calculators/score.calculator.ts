// Calculador de Score para Ranking de Atletas en Competencias
// Basado en: Fuerza (25%) + Resistencia (25%) + Estado (30%) + Peso (20%)
// Fuente: docs/algoritmo_03_diseno.md

import { CategoriaPeso } from '@prisma/client';

// Limites de peso por categoria (en kg)
export const LIMITES_CATEGORIA_PESO: Record<CategoriaPeso, { min: number; max: number }> = {
  MENOS_60K: { min: 0, max: 60 },
  MENOS_66K: { min: 60, max: 66 },
  MENOS_73K: { min: 66, max: 73 },
  MENOS_81K: { min: 73, max: 81 },
  MENOS_90K: { min: 81, max: 90 },
  MENOS_100K: { min: 90, max: 100 },
  MAS_100K: { min: 100, max: 999 },
};

// Pesos de cada componente en el score final
export const PESOS_SCORE = {
  FUERZA: 0.25,
  RESISTENCIA: 0.25,
  ESTADO: 0.3,
  PESO: 0.2,
} as const;

// Datos del ultimo test fisico del atleta
export interface DatosTestFisico {
  pressBanca: number | null;
  tiron: number | null;
  sentadilla: number | null;
  barraFija: number | null;
  paralelas: number | null;
  navetteVO2max: number | null;
}

// Ratios de fuerza relativa al peso corporal (bodyweight multipliers)
// Basado en estandares de powerlifting adaptados para judo
// Fuente: strengthlevel.com, pubmed.ncbi.nlm.nih.gov/39060209
export const RATIOS_FUERZA = {
  // Press banca: menos critico en judo pero indica fuerza de empuje
  // Rango: 0.5x (principiante) a 2.0x (elite)
  PRESS_BANCA: { min: 0.5, max: 2.0 },
  // Tiron: muy importante en judo (agarre, jalar al oponente)
  // Rango: 0.5x (principiante) a 2.5x (elite)
  TIRON: { min: 0.5, max: 2.5 },
  // Sentadilla: base de potencia para proyecciones
  // Rango: 0.7x (principiante) a 2.5x (elite)
  SENTADILLA: { min: 0.7, max: 2.5 },
} as const;

// Datos del estado actual del atleta (ultimos registros post-entrenamiento)
export interface DatosEstadoAtleta {
  rpePromedio: number;
  calidadSuenoPromedio: number;
  estadoAnimicoPromedio: number;
}

// Datos de peso del atleta
export interface DatosPesoAtleta {
  pesoActual: number;
  categoriaPeso: CategoriaPeso;
}

// Resultado del calculo de score
export interface ResultadoScore {
  scoreTotal: number;
  scoreFuerza: number;
  scoreResistencia: number;
  scoreEstado: number;
  scorePeso: number;
  detalles: {
    fuerzaMaxima: number;
    fuerzaResistencia: number;
    resistenciaAerobica: number;
    nivelFatiga: number;
    calidadRecuperacion: number;
    estadoMental: number;
    distanciaPesoOptimo: number;
    // Ratios de fuerza relativa al peso corporal
    ratiosFuerza: {
      pressBanca: number | null;
      tiron: number | null;
      sentadilla: number | null;
    };
  };
}

// Normaliza un valor a escala 0-100
function normalizar(valor: number, minimo: number, maximo: number): number {
  if (valor <= minimo) return 0;
  if (valor >= maximo) return 100;
  return ((valor - minimo) / (maximo - minimo)) * 100;
}

// Calcula el score de fuerza (25% del total)
// Combina fuerza maxima (1RM relativa al peso) y fuerza resistencia
// IMPORTANTE: Usa ratios relativos al peso corporal para comparacion justa
export function calcularScoreFuerza(
  datos: DatosTestFisico,
  pesoAtleta: number
): {
  score: number;
  fuerzaMaxima: number;
  fuerzaResistencia: number;
  ratios: {
    pressBanca: number | null;
    tiron: number | null;
    sentadilla: number | null;
  };
} {
  // Validar que tenemos peso del atleta
  const pesoValido = pesoAtleta > 0 ? pesoAtleta : 70; // Default 70kg si no hay peso

  // Fuerza maxima: normalizada como RATIO del peso corporal
  const valoresFuerzaMaxima: number[] = [];
  const ratios = {
    pressBanca: null as number | null,
    tiron: null as number | null,
    sentadilla: null as number | null,
  };

  if (datos.pressBanca !== null && datos.pressBanca > 0) {
    // Calcular ratio: pressBanca / pesoAtleta
    // Ejemplo: 80kg press / 70kg atleta = 1.14x bodyweight
    const ratio = datos.pressBanca / pesoValido;
    ratios.pressBanca = Math.round(ratio * 100) / 100;
    // Normalizar ratio (0.5x = 0 puntos, 2.0x = 100 puntos)
    valoresFuerzaMaxima.push(
      normalizar(ratio, RATIOS_FUERZA.PRESS_BANCA.min, RATIOS_FUERZA.PRESS_BANCA.max)
    );
  }

  if (datos.tiron !== null && datos.tiron > 0) {
    // Tiron es MUY importante en judo (agarre, control)
    const ratio = datos.tiron / pesoValido;
    ratios.tiron = Math.round(ratio * 100) / 100;
    valoresFuerzaMaxima.push(normalizar(ratio, RATIOS_FUERZA.TIRON.min, RATIOS_FUERZA.TIRON.max));
  }

  if (datos.sentadilla !== null && datos.sentadilla > 0) {
    // Sentadilla: base de potencia para proyecciones
    const ratio = datos.sentadilla / pesoValido;
    ratios.sentadilla = Math.round(ratio * 100) / 100;
    valoresFuerzaMaxima.push(
      normalizar(ratio, RATIOS_FUERZA.SENTADILLA.min, RATIOS_FUERZA.SENTADILLA.max)
    );
  }

  const fuerzaMaxima =
    valoresFuerzaMaxima.length > 0
      ? valoresFuerzaMaxima.reduce((a, b) => a + b, 0) / valoresFuerzaMaxima.length
      : 0;

  // Fuerza resistencia: repeticiones (no depende del peso corporal)
  const valoresFuerzaResistencia: number[] = [];

  if (datos.barraFija !== null) {
    // Normalizar barra fija (rango esperado: 0-25 repeticiones)
    valoresFuerzaResistencia.push(normalizar(datos.barraFija, 0, 25));
  }
  if (datos.paralelas !== null) {
    // Normalizar paralelas (rango esperado: 0-30 repeticiones)
    valoresFuerzaResistencia.push(normalizar(datos.paralelas, 0, 30));
  }

  const fuerzaResistencia =
    valoresFuerzaResistencia.length > 0
      ? valoresFuerzaResistencia.reduce((a, b) => a + b, 0) / valoresFuerzaResistencia.length
      : 0;

  // Score final de fuerza: 60% fuerza maxima + 40% fuerza resistencia
  const score = fuerzaMaxima * 0.6 + fuerzaResistencia * 0.4;

  return {
    score: Math.round(score * 100) / 100,
    fuerzaMaxima: Math.round(fuerzaMaxima * 100) / 100,
    fuerzaResistencia: Math.round(fuerzaResistencia * 100) / 100,
    ratios,
  };
}

// Calcula el score de resistencia (25% del total)
// Basado en VO2max del test navette o test de 1500m
export function calcularScoreResistencia(datos: DatosTestFisico): {
  score: number;
  resistenciaAerobica: number;
} {
  const valoresResistencia: number[] = [];

  if (datos.navetteVO2max !== null) {
    // Normalizar VO2max de navette (rango esperado: 30-65 ml/kg/min)
    valoresResistencia.push(normalizar(datos.navetteVO2max, 30, 65));
  }

  const resistenciaAerobica =
    valoresResistencia.length > 0
      ? valoresResistencia.reduce((a, b) => a + b, 0) / valoresResistencia.length
      : 0;

  return {
    score: Math.round(resistenciaAerobica * 100) / 100,
    resistenciaAerobica: Math.round(resistenciaAerobica * 100) / 100,
  };
}

// Calcula el score de estado actual (30% del total)
// Basado en RPE, calidad de sueno y estado animico
export function calcularScoreEstado(datos: DatosEstadoAtleta): {
  score: number;
  nivelFatiga: number;
  calidadRecuperacion: number;
  estadoMental: number;
} {
  // Nivel de fatiga (inverso del RPE, ya que menor RPE = mejor estado)
  // RPE va de 1-10, convertimos a score donde 10 = mejor
  const nivelFatiga = normalizar(11 - datos.rpePromedio, 1, 10);

  // Calidad de recuperacion (basado en calidad de sueno, escala 1-10)
  const calidadRecuperacion = normalizar(datos.calidadSuenoPromedio, 1, 10);

  // Estado mental (basado en estado animico, escala 1-10)
  const estadoMental = normalizar(datos.estadoAnimicoPromedio, 1, 10);

  // Score final de estado: promedio ponderado
  // Fatiga tiene mas peso porque es indicador critico
  const score = nivelFatiga * 0.4 + calidadRecuperacion * 0.35 + estadoMental * 0.25;

  return {
    score: Math.round(score * 100) / 100,
    nivelFatiga: Math.round(nivelFatiga * 100) / 100,
    calidadRecuperacion: Math.round(calidadRecuperacion * 100) / 100,
    estadoMental: Math.round(estadoMental * 100) / 100,
  };
}

// Calcula el score de peso (20% del total)
// Verifica que el atleta este dentro del rango de su categoria
export function calcularScorePeso(datos: DatosPesoAtleta): {
  score: number;
  distanciaPesoOptimo: number;
} {
  const limites = LIMITES_CATEGORIA_PESO[datos.categoriaPeso];

  // Peso optimo es el limite maximo de la categoria (para judo)
  const pesoOptimo = limites.max;

  // Calcular distancia al peso optimo
  let distanciaPesoOptimo: number;
  let score: number;

  if (datos.pesoActual > pesoOptimo) {
    // Sobrepeso: penalizacion fuerte (no puede competir en esa categoria)
    distanciaPesoOptimo = datos.pesoActual - pesoOptimo;
    // Penalizacion de 20 puntos por cada kg de sobrepeso
    score = Math.max(0, 100 - distanciaPesoOptimo * 20);
  } else if (datos.pesoActual < limites.min) {
    // Bajo peso: penalizacion leve (podria competir en categoria inferior)
    distanciaPesoOptimo = limites.min - datos.pesoActual;
    // Penalizacion de 5 puntos por cada kg bajo el minimo
    score = Math.max(0, 100 - distanciaPesoOptimo * 5);
  } else {
    // Dentro del rango: score basado en cercanía al peso optimo
    distanciaPesoOptimo = pesoOptimo - datos.pesoActual;
    // Entre mas cerca del limite maximo, mejor score
    const rangoCategoria = limites.max - limites.min;
    const posicionEnRango = datos.pesoActual - limites.min;
    score = 70 + (posicionEnRango / rangoCategoria) * 30;
  }

  return {
    score: Math.round(score * 100) / 100,
    distanciaPesoOptimo: Math.round(distanciaPesoOptimo * 100) / 100,
  };
}

// Funcion principal que calcula el score total del atleta
// IMPORTANTE: La fuerza se calcula relativa al peso corporal
export function calcularScoreAtleta(
  datosTest: DatosTestFisico,
  datosEstado: DatosEstadoAtleta,
  datosPeso: DatosPesoAtleta
): ResultadoScore {
  // Pasar peso del atleta para calcular fuerza relativa
  const resultadoFuerza = calcularScoreFuerza(datosTest, datosPeso.pesoActual);
  const resultadoResistencia = calcularScoreResistencia(datosTest);
  const resultadoEstado = calcularScoreEstado(datosEstado);
  const resultadoPeso = calcularScorePeso(datosPeso);

  // Calcular score total ponderado
  const scoreTotal =
    resultadoFuerza.score * PESOS_SCORE.FUERZA +
    resultadoResistencia.score * PESOS_SCORE.RESISTENCIA +
    resultadoEstado.score * PESOS_SCORE.ESTADO +
    resultadoPeso.score * PESOS_SCORE.PESO;

  return {
    scoreTotal: Math.round(scoreTotal * 100) / 100,
    scoreFuerza: resultadoFuerza.score,
    scoreResistencia: resultadoResistencia.score,
    scoreEstado: resultadoEstado.score,
    scorePeso: resultadoPeso.score,
    detalles: {
      fuerzaMaxima: resultadoFuerza.fuerzaMaxima,
      fuerzaResistencia: resultadoFuerza.fuerzaResistencia,
      resistenciaAerobica: resultadoResistencia.resistenciaAerobica,
      nivelFatiga: resultadoEstado.nivelFatiga,
      calidadRecuperacion: resultadoEstado.calidadRecuperacion,
      estadoMental: resultadoEstado.estadoMental,
      distanciaPesoOptimo: resultadoPeso.distanciaPesoOptimo,
      ratiosFuerza: resultadoFuerza.ratios,
    },
  };
}
