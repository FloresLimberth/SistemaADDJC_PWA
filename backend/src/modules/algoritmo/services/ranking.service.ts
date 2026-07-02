// Servicio de ranking de atletas para competencias
// Usa score.calculator.ts para evaluar y ordenar atletas
// Basado en: docs/algoritmo_03_diseno.md

import { CategoriaPeso, TipoLesion } from '@prisma/client';
import {
  calcularScoreAtleta,
  DatosTestFisico,
  DatosEstadoAtleta,
  DatosPesoAtleta,
  ResultadoScore,
} from '../calculators/score.calculator';
import { UMBRALES_ALERTA } from './alertas.service';

// Datos completos de un atleta para ranking
export interface DatosAtletaParaRanking {
  atletaId: bigint;
  nombreCompleto: string;
  categoriaPeso: CategoriaPeso;
  pesoActual: number | null;
  edad: number;
  // Ultimo test fisico
  ultimoTest: {
    fechaTest: Date;
    pressBanca: number | null;
    tiron: number | null;
    sentadilla: number | null;
    barraFija: number | null;
    paralelas: number | null;
    navetteVO2max: number | null;
  } | null;
  // Ultimos registros post-entrenamiento (para estado)
  ultimosRegistros: Array<{
    rpe: number;
    calidadSueno: number;
    estadoAnimico: number;
  }>;
  // Dolencias activas (nivel y tipo para evaluar gravedad en la regla de aptitud)
  dolenciasActivas: Array<{ nivel: number; tipoLesion: TipoLesion | null }>;
}

// Resultado del ranking para un atleta
export interface AtletaEnRanking {
  posicion: number;
  atletaId: bigint;
  nombreCompleto: string;
  categoriaPeso: CategoriaPeso;
  puntuacion: number;
  score: ResultadoScore;
  alertas: string[];
  justificacion: string;
  aptoPara: 'COMPETIR' | 'RESERVA' | 'NO_APTO';
}

// Resultado completo del ranking
export interface ResultadoRanking {
  categoriaPeso: CategoriaPeso;
  fechaGeneracion: Date;
  totalAtletas: number;
  ranking: AtletaEnRanking[];
  mejorAtleta: AtletaEnRanking | null;
  resumen: string;
}

// Calcula promedio de un array
function promedio(valores: number[]): number {
  if (valores.length === 0) return 5;
  return valores.reduce((a, b) => a + b, 0) / valores.length;
}

// Prepara los datos del test para el calculator
function prepararDatosTest(test: DatosAtletaParaRanking['ultimoTest']): DatosTestFisico {
  if (test === null) {
    return {
      pressBanca: null,
      tiron: null,
      sentadilla: null,
      barraFija: null,
      paralelas: null,
      navetteVO2max: null,
    };
  }

  return {
    pressBanca: test.pressBanca,
    tiron: test.tiron,
    sentadilla: test.sentadilla,
    barraFija: test.barraFija,
    paralelas: test.paralelas,
    navetteVO2max: test.navetteVO2max,
  };
}

// Prepara los datos de estado del atleta
function prepararDatosEstado(
  registros: DatosAtletaParaRanking['ultimosRegistros']
): DatosEstadoAtleta {
  if (registros.length === 0) {
    return {
      rpePromedio: 5,
      calidadSuenoPromedio: 7,
      estadoAnimicoPromedio: 7,
    };
  }

  return {
    rpePromedio: promedio(registros.map((r) => r.rpe)),
    calidadSuenoPromedio: promedio(registros.map((r) => r.calidadSueno)),
    estadoAnimicoPromedio: promedio(registros.map((r) => r.estadoAnimico)),
  };
}

// Genera alertas para un atleta
function generarAlertasAtleta(atleta: DatosAtletaParaRanking, score: ResultadoScore): string[] {
  const alertas: string[] = [];

  // Alerta si no tiene test reciente
  if (atleta.ultimoTest === null) {
    alertas.push('Sin test fisico reciente');
  } else {
    const mesesDesdeTest = Math.floor(
      (new Date().getTime() - new Date(atleta.ultimoTest.fechaTest).getTime()) /
        (1000 * 60 * 60 * 24 * 30)
    );
    if (mesesDesdeTest > 2) {
      alertas.push(`Test fisico tiene ${mesesDesdeTest} meses`);
    }
  }

  // Alerta si tiene dolencias activas (clasifica gravedad por nivel maximo)
  if (atleta.dolenciasActivas.length > 0) {
    const nivelMaximo = Math.max(...atleta.dolenciasActivas.map((d) => d.nivel));
    const cantidad = atleta.dolenciasActivas.length;
    if (nivelMaximo >= UMBRALES_ALERTA.NIVEL_DOLOR_ALTO) {
      alertas.push(`${cantidad} dolencia(s) grave(s) activa(s) (nivel max ${nivelMaximo})`);
    } else {
      alertas.push(`${cantidad} dolencia(s) leve(s) activa(s) (nivel max ${nivelMaximo})`);
    }
  }

  // Alerta si estado es bajo
  if (score.scoreEstado < 50) {
    alertas.push('Estado fisico/mental bajo');
  }

  // Alerta si peso fuera de rango
  if (score.scorePeso < 70) {
    alertas.push('Peso fuera del rango optimo');
  }

  // Alerta si sin registros recientes
  if (atleta.ultimosRegistros.length === 0) {
    alertas.push('Sin registros de entrenamiento recientes');
  }

  return alertas;
}

// Determina si el atleta es apto para competir
// Regla suavizada por nivel de dolencia (alineada con UMBRALES_ALERTA.NIVEL_DOLOR_ALTO):
// - NO_APTO: tiene dolencia grave (nivel >= 7), score de estado muy bajo, o peso muy fuera de rango
// - RESERVA: tiene dolencia leve (nivel < 7), o varias alertas, o score moderado
// - COMPETIR: pasa todo
function determinarAptitud(
  score: ResultadoScore,
  alertas: string[],
  dolenciasActivas: DatosAtletaParaRanking['dolenciasActivas']
): 'COMPETIR' | 'RESERVA' | 'NO_APTO' {
  const tieneDolenciaGrave = dolenciasActivas.some(
    (d) => d.nivel >= UMBRALES_ALERTA.NIVEL_DOLOR_ALTO
  );

  // No apto si tiene dolencia grave, score de estado muy bajo, o peso muy fuera de rango
  if (tieneDolenciaGrave || score.scoreEstado < 30 || score.scorePeso < 50) {
    return 'NO_APTO';
  }

  // Reserva si hay dolencia leve activa, varias alertas, o score moderado
  if (dolenciasActivas.length > 0 || alertas.length >= 2 || score.scoreTotal < 50) {
    return 'RESERVA';
  }

  return 'COMPETIR';
}

// Genera justificacion del ranking
function generarJustificacion(
  score: ResultadoScore,
  aptoPara: 'COMPETIR' | 'RESERVA' | 'NO_APTO'
): string {
  const partes: string[] = [];

  partes.push(`Puntuacion total: ${score.scoreTotal}/100`);

  // Describir fortalezas
  const fortalezas: string[] = [];
  if (score.scoreFuerza >= 70) fortalezas.push('fuerza');
  if (score.scoreResistencia >= 70) fortalezas.push('resistencia');
  if (score.scoreEstado >= 70) fortalezas.push('estado');
  if (score.scorePeso >= 90) fortalezas.push('peso optimo');

  if (fortalezas.length > 0) {
    partes.push(`Fortalezas: ${fortalezas.join(', ')}`);
  }

  // Describir debilidades
  const debilidades: string[] = [];
  if (score.scoreFuerza < 50) debilidades.push('fuerza');
  if (score.scoreResistencia < 50) debilidades.push('resistencia');
  if (score.scoreEstado < 50) debilidades.push('estado');
  if (score.scorePeso < 70) debilidades.push('peso');

  if (debilidades.length > 0) {
    partes.push(`Areas a mejorar: ${debilidades.join(', ')}`);
  }

  // Conclusion segun aptitud
  if (aptoPara === 'COMPETIR') {
    partes.push('Apto para competir.');
  } else if (aptoPara === 'RESERVA') {
    partes.push('Recomendado como reserva.');
  } else {
    partes.push('No recomendado para competir en este momento.');
  }

  return partes.join('. ');
}

// Funcion principal: genera ranking de atletas
export function generarRanking(
  atletas: DatosAtletaParaRanking[],
  categoriaPeso: CategoriaPeso
): ResultadoRanking {
  // Filtrar atletas de la categoria
  const atletasCategoria = atletas.filter((a) => a.categoriaPeso === categoriaPeso);

  if (atletasCategoria.length === 0) {
    return {
      categoriaPeso,
      fechaGeneracion: new Date(),
      totalAtletas: 0,
      ranking: [],
      mejorAtleta: null,
      resumen: `No hay atletas en la categoria ${categoriaPeso}.`,
    };
  }

  // Evaluar cada atleta
  const atletasEvaluados: AtletaEnRanking[] = atletasCategoria.map((atleta) => {
    const datosTest = prepararDatosTest(atleta.ultimoTest);
    const datosEstado = prepararDatosEstado(atleta.ultimosRegistros);
    const datosPeso: DatosPesoAtleta = {
      pesoActual: atleta.pesoActual ?? 0,
      categoriaPeso: atleta.categoriaPeso,
    };

    const score = calcularScoreAtleta(datosTest, datosEstado, datosPeso);
    const alertas = generarAlertasAtleta(atleta, score);
    const aptoPara = determinarAptitud(score, alertas, atleta.dolenciasActivas);
    const justificacion = generarJustificacion(score, aptoPara);

    return {
      posicion: 0,
      atletaId: atleta.atletaId,
      nombreCompleto: atleta.nombreCompleto,
      categoriaPeso: atleta.categoriaPeso,
      puntuacion: score.scoreTotal,
      score,
      alertas,
      justificacion,
      aptoPara,
    };
  });

  // Ordenar por puntuacion (mayor primero) y luego por aptitud
  const ordenAptitud: Record<string, number> = {
    COMPETIR: 0,
    RESERVA: 1,
    NO_APTO: 2,
  };

  atletasEvaluados.sort((a, b) => {
    // Primero ordenar por aptitud
    const diffAptitud = ordenAptitud[a.aptoPara] - ordenAptitud[b.aptoPara];
    if (diffAptitud !== 0) return diffAptitud;
    // Luego por puntuacion
    return b.puntuacion - a.puntuacion;
  });

  // Asignar posiciones
  atletasEvaluados.forEach((atleta, index) => {
    atleta.posicion = index + 1;
  });

  // Generar resumen
  const aptos = atletasEvaluados.filter((a) => a.aptoPara === 'COMPETIR').length;
  const reservas = atletasEvaluados.filter((a) => a.aptoPara === 'RESERVA').length;
  const noAptos = atletasEvaluados.filter((a) => a.aptoPara === 'NO_APTO').length;

  const resumen = `${atletasCategoria.length} atletas evaluados: ${aptos} apto(s), ${reservas} reserva(s), ${noAptos} no apto(s).`;

  return {
    categoriaPeso,
    fechaGeneracion: new Date(),
    totalAtletas: atletasCategoria.length,
    ranking: atletasEvaluados,
    mejorAtleta: atletasEvaluados.length > 0 ? atletasEvaluados[0] : null,
    resumen,
  };
}

// Genera ranking para todas las categorias
export function generarRankingGlobal(
  atletas: DatosAtletaParaRanking[]
): Map<CategoriaPeso, ResultadoRanking> {
  const categorias: CategoriaPeso[] = [
    'MENOS_60K',
    'MENOS_66K',
    'MENOS_73K',
    'MENOS_81K',
    'MENOS_90K',
    'MENOS_100K',
    'MAS_100K',
  ];

  const rankings = new Map<CategoriaPeso, ResultadoRanking>();

  for (const categoria of categorias) {
    const ranking = generarRanking(atletas, categoria);
    if (ranking.totalAtletas > 0) {
      rankings.set(categoria, ranking);
    }
  }

  return rankings;
}
