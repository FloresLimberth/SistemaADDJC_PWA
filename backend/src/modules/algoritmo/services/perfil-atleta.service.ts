// Servicio para clasificar el perfil del atleta
// Perfiles: VELOZ, RESISTENTE, EQUILIBRADO, NUEVO
// Basado en: docs/algoritmo_04_investigacion_tecnica.md

import { PerfilAtleta } from '@prisma/client';
import { calcularVO2max } from '../calculators/vo2max.calculator';

// Umbrales para clasificacion de perfil
export const UMBRALES_PERFIL = {
  // Palier minimo para considerar buena resistencia
  PALIER_ALTO: 10,
  PALIER_MEDIO: 8,
  // VO2max minimo para considerar buena resistencia
  VO2MAX_ALTO: 50,
  VO2MAX_MEDIO: 45,
  // Score minimo de fuerza (0-100) para considerar fuerte
  FUERZA_ALTA: 70,
  FUERZA_MEDIA: 50,
  // Meses maximos desde ultimo test para considerarlo valido
  MESES_TEST_VALIDO: 3,
} as const;

// Datos del test fisico necesarios para clasificar
export interface DatosTestParaPerfil {
  fechaTest: Date;
  // Fuerza maxima
  pressBanca: number | null;
  tiron: number | null;
  sentadilla: number | null;
  // Fuerza resistencia
  barraFija: number | null;
  paralelas: number | null;
  // Resistencia aerobica
  navettePalier: number | null;
  navetteVO2max: number | null;
}

// Resultado de la evaluacion de fuerza
export interface EvaluacionFuerza {
  score: number;
  nivel: 'ALTO' | 'MEDIO' | 'BAJO';
  detalles: {
    fuerzaMaxima: number;
    fuerzaResistencia: number;
  };
}

// Resultado de la evaluacion de resistencia
export interface EvaluacionResistencia {
  score: number;
  nivel: 'ALTO' | 'MEDIO' | 'BAJO';
  detalles: {
    palier: number | null;
    vo2max: number | null;
  };
}

// Resultado completo del perfil
export interface ResultadoPerfil {
  perfil: PerfilAtleta;
  fortalezas: string[];
  debilidades: string[];
  ajustes: {
    volumen: number;
    intensidad: number;
    enfasis: string[];
  };
  evaluacionFuerza: EvaluacionFuerza;
  evaluacionResistencia: EvaluacionResistencia;
  vo2maxEstimado: number | null;
  justificacion: string;
}

// Normaliza un valor a escala 0-100
function normalizar(valor: number, minimo: number, maximo: number): number {
  if (valor <= minimo) return 0;
  if (valor >= maximo) return 100;
  return ((valor - minimo) / (maximo - minimo)) * 100;
}

// Verifica si un test es reciente (dentro de los ultimos N meses)
export function esTestReciente(fechaTest: Date, mesesMaximo: number = 3): boolean {
  const ahora = new Date();
  const diferenciaMeses =
    (ahora.getFullYear() - fechaTest.getFullYear()) * 12 +
    (ahora.getMonth() - fechaTest.getMonth());
  return diferenciaMeses <= mesesMaximo;
}

// Evalua la fuerza del atleta basada en los tests
export function evaluarFuerza(datos: DatosTestParaPerfil): EvaluacionFuerza {
  const valoresFuerzaMaxima: number[] = [];

  // Normalizar tests de fuerza maxima (1RM)
  if (datos.pressBanca !== null) {
    // Press banca: rango esperado 40-150 kg
    valoresFuerzaMaxima.push(normalizar(datos.pressBanca, 40, 150));
  }
  if (datos.tiron !== null) {
    // Tiron: rango esperado 40-140 kg
    valoresFuerzaMaxima.push(normalizar(datos.tiron, 40, 140));
  }
  if (datos.sentadilla !== null) {
    // Sentadilla: rango esperado 60-200 kg
    valoresFuerzaMaxima.push(normalizar(datos.sentadilla, 60, 200));
  }

  const fuerzaMaxima =
    valoresFuerzaMaxima.length > 0
      ? valoresFuerzaMaxima.reduce((a, b) => a + b, 0) / valoresFuerzaMaxima.length
      : 0;

  // Normalizar tests de fuerza resistencia
  const valoresFuerzaResistencia: number[] = [];

  if (datos.barraFija !== null) {
    // Barra fija: rango esperado 0-25 repeticiones
    valoresFuerzaResistencia.push(normalizar(datos.barraFija, 0, 25));
  }
  if (datos.paralelas !== null) {
    // Paralelas: rango esperado 0-30 repeticiones
    valoresFuerzaResistencia.push(normalizar(datos.paralelas, 0, 30));
  }

  const fuerzaResistencia =
    valoresFuerzaResistencia.length > 0
      ? valoresFuerzaResistencia.reduce((a, b) => a + b, 0) / valoresFuerzaResistencia.length
      : 0;

  // Score ponderado: 60% fuerza maxima + 40% fuerza resistencia
  const score = fuerzaMaxima * 0.6 + fuerzaResistencia * 0.4;

  // Determinar nivel
  let nivel: 'ALTO' | 'MEDIO' | 'BAJO';
  if (score >= UMBRALES_PERFIL.FUERZA_ALTA) {
    nivel = 'ALTO';
  } else if (score >= UMBRALES_PERFIL.FUERZA_MEDIA) {
    nivel = 'MEDIO';
  } else {
    nivel = 'BAJO';
  }

  return {
    score: Math.round(score),
    nivel,
    detalles: {
      fuerzaMaxima: Math.round(fuerzaMaxima),
      fuerzaResistencia: Math.round(fuerzaResistencia),
    },
  };
}

// Evalua la resistencia del atleta basada en los tests
export function evaluarResistencia(
  datos: DatosTestParaPerfil,
  edadAtleta: number
): EvaluacionResistencia {
  let vo2max: number | null = null;
  const palier: number | null = datos.navettePalier;

  // Calcular VO2max si tenemos palier
  if (datos.navettePalier !== null) {
    const resultado = calcularVO2max(datos.navettePalier, edadAtleta);
    vo2max = resultado.vo2max;
  } else if (datos.navetteVO2max !== null) {
    vo2max = datos.navetteVO2max;
  }

  // Calcular score basado en palier y/o VO2max
  let score = 0;
  let contadorMetricas = 0;

  if (palier !== null) {
    // Palier: rango esperado 5-15
    score += normalizar(palier, 5, 15);
    contadorMetricas++;
  }

  if (vo2max !== null) {
    // VO2max: rango esperado 35-65
    score += normalizar(vo2max, 35, 65);
    contadorMetricas++;
  }

  if (contadorMetricas > 0) {
    score = score / contadorMetricas;
  }

  // Determinar nivel
  let nivel: 'ALTO' | 'MEDIO' | 'BAJO';
  if (score >= UMBRALES_PERFIL.FUERZA_ALTA) {
    nivel = 'ALTO';
  } else if (score >= UMBRALES_PERFIL.FUERZA_MEDIA) {
    nivel = 'MEDIO';
  } else {
    nivel = 'BAJO';
  }

  return {
    score: Math.round(score),
    nivel,
    detalles: {
      palier,
      vo2max: vo2max !== null ? Math.round(vo2max * 100) / 100 : null,
    },
  };
}

// Funcion principal que clasifica el perfil del atleta
export function clasificarPerfilAtleta(
  datosTest: DatosTestParaPerfil | null,
  edadAtleta: number
): ResultadoPerfil {
  // Si no hay test o el test es muy antiguo, es atleta NUEVO
  if (
    datosTest === null ||
    !esTestReciente(datosTest.fechaTest, UMBRALES_PERFIL.MESES_TEST_VALIDO)
  ) {
    return {
      perfil: 'NUEVO',
      fortalezas: [],
      debilidades: [],
      ajustes: {
        volumen: 0,
        intensidad: 0,
        enfasis: ['evaluacion_inicial', 'trabajo_general'],
      },
      evaluacionFuerza: {
        score: 0,
        nivel: 'BAJO',
        detalles: { fuerzaMaxima: 0, fuerzaResistencia: 0 },
      },
      evaluacionResistencia: {
        score: 0,
        nivel: 'BAJO',
        detalles: { palier: null, vo2max: null },
      },
      vo2maxEstimado: null,
      justificacion: 'Atleta sin tests recientes. Se recomienda evaluacion inicial.',
    };
  }

  // Evaluar fuerza y resistencia
  const evalFuerza = evaluarFuerza(datosTest);
  const evalResistencia = evaluarResistencia(datosTest, edadAtleta);

  // Clasificar perfil segun las evaluaciones
  let perfil: PerfilAtleta;
  let fortalezas: string[] = [];
  let debilidades: string[] = [];
  let ajustes: ResultadoPerfil['ajustes'];
  let justificacion: string;

  // VELOZ: fuerza alta, resistencia baja/media
  if (evalFuerza.nivel === 'ALTO' && evalResistencia.nivel === 'BAJO') {
    perfil = 'VELOZ';
    fortalezas = ['fuerza_maxima', 'potencia', 'explosividad'];
    debilidades = ['resistencia_aerobica'];
    ajustes = {
      volumen: -10,
      intensidad: 10,
      enfasis: ['ataques_explosivos', 'cadenas_cortas', 'uchi_mata', 'seoi_nage'],
    };
    justificacion = `Perfil VELOZ: Fuerza ${evalFuerza.score}/100, Resistencia ${evalResistencia.score}/100. Priorizar tecnicas explosivas y combates cortos.`;
  }
  // RESISTENTE: resistencia alta, fuerza baja/media
  else if (evalResistencia.nivel === 'ALTO' && evalFuerza.nivel === 'BAJO') {
    perfil = 'RESISTENTE';
    fortalezas = ['resistencia_aerobica', 'recuperacion', 'aguante'];
    debilidades = ['fuerza_maxima', 'potencia'];
    ajustes = {
      volumen: 10,
      intensidad: -10,
      enfasis: ['kumikata_prolongado', 'contra_tecnicas', 'desgaste', 'cadenas_largas'],
    };
    justificacion = `Perfil RESISTENTE: Resistencia ${evalResistencia.score}/100, Fuerza ${evalFuerza.score}/100. Priorizar trabajo de desgaste y combates largos.`;
  }
  // EQUILIBRADO: ambos en nivel similar (ambos altos, ambos medios, o mixto medio-alto)
  else if (
    (evalFuerza.nivel === 'ALTO' && evalResistencia.nivel === 'ALTO') ||
    (evalFuerza.nivel === 'MEDIO' && evalResistencia.nivel === 'MEDIO') ||
    (evalFuerza.nivel === 'ALTO' && evalResistencia.nivel === 'MEDIO') ||
    (evalFuerza.nivel === 'MEDIO' && evalResistencia.nivel === 'ALTO')
  ) {
    perfil = 'EQUILIBRADO';
    fortalezas = ['versatilidad', 'adaptabilidad'];

    // Identificar cual es un poco mas debil para trabajar
    if (evalFuerza.score < evalResistencia.score) {
      debilidades = ['fuerza_relativa'];
      ajustes = {
        volumen: 0,
        intensidad: 5,
        enfasis: ['trabajo_mixto', 'mejora_fuerza'],
      };
    } else if (evalResistencia.score < evalFuerza.score) {
      debilidades = ['resistencia_relativa'];
      ajustes = {
        volumen: 5,
        intensidad: 0,
        enfasis: ['trabajo_mixto', 'mejora_resistencia'],
      };
    } else {
      debilidades = [];
      ajustes = {
        volumen: 0,
        intensidad: 0,
        enfasis: ['trabajo_mixto', 'mantenimiento'],
      };
    }

    justificacion = `Perfil EQUILIBRADO: Fuerza ${evalFuerza.score}/100, Resistencia ${evalResistencia.score}/100. Atleta versatil con capacidades balanceadas.`;
  }
  // Por defecto, si ambos son bajos o hay otra combinacion
  else {
    perfil = 'EQUILIBRADO';
    fortalezas = [];
    debilidades = ['fuerza', 'resistencia'];
    ajustes = {
      volumen: 0,
      intensidad: 0,
      enfasis: ['desarrollo_general', 'base_fisica'],
    };
    justificacion = `Perfil EQUILIBRADO (en desarrollo): Fuerza ${evalFuerza.score}/100, Resistencia ${evalResistencia.score}/100. Requiere trabajo de base fisica general.`;
  }

  return {
    perfil,
    fortalezas,
    debilidades,
    ajustes,
    evaluacionFuerza: evalFuerza,
    evaluacionResistencia: evalResistencia,
    vo2maxEstimado: evalResistencia.detalles.vo2max,
    justificacion,
  };
}

// Convierte datos de Prisma a formato para clasificacion
export function convertirTestPrismaADatos(
  test: {
    fechaTest: Date;
    pressBanca: unknown;
    tiron: unknown;
    sentadilla: unknown;
    barraFija: number | null;
    paralelas: number | null;
    navettePalier: unknown;
    navetteVO2max: unknown;
  } | null
): DatosTestParaPerfil | null {
  if (test === null) return null;

  return {
    fechaTest: new Date(test.fechaTest),
    pressBanca: test.pressBanca !== null ? Number(test.pressBanca) : null,
    tiron: test.tiron !== null ? Number(test.tiron) : null,
    sentadilla: test.sentadilla !== null ? Number(test.sentadilla) : null,
    barraFija: test.barraFija,
    paralelas: test.paralelas,
    navettePalier: test.navettePalier !== null ? Number(test.navettePalier) : null,
    navetteVO2max: test.navetteVO2max !== null ? Number(test.navetteVO2max) : null,
  };
}
