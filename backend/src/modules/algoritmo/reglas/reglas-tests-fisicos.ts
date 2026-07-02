// Reglas IF-THEN para generar recomendaciones basadas en tests fisicos
// Basado en el patron de reglas-rendimiento.ts
// Fuente: Rule-based reasoning systems (Jackson, 1999)
// Referencia: https://www.nected.ai/blog/rules-engine-design-pattern

import { TipoRecomendacion, Prioridad } from '@prisma/client';

// Configuracion de umbrales para las reglas
// Basado en literatura de ciencias del deporte y baremos de judo
export const CONFIGURACION_TESTS = {
  // Umbrales de cambio porcentual
  CAIDA_CRITICA_PORCENTAJE: 25, // >25% de caida es critico
  EMPEORAMIENTO_PORCENTAJE: 10, // >10% de caida es empeoramiento
  MEJORA_SIGNIFICATIVA_PORCENTAJE: 10, // >10% de mejora es significativa

  // Umbrales de VO2max (ml/kg/min)
  // Fuente: docs/analisis_excel_11-12-13.md
  VO2MAX_MUY_BAJO: 45,
  VO2MAX_OBJETIVO_MASCULINO: 60,
  VO2MAX_OBJETIVO_FEMENINO: 53,
  VO2MAX_DEFICIT_PORCENTAJE: 70, // <70% del objetivo = deficit

  // Umbrales de desbalance
  DESBALANCE_PORCENTAJE: 30, // >30% de diferencia entre areas

  // Minimo de datos para comparar
  REQUIERE_TEST_ANTERIOR: true,
};

// Datos de un test fisico individual (ya convertidos a number)
export interface DatosTestFisico {
  pressBanca: number | null;
  tiron: number | null;
  sentadilla: number | null;
  barraFija: number | null;
  paralelas: number | null;
  navettePalier: number | null;
  navetteVO2max: number | null;
  test1500m: string | null; // Formato "MM:SS"
}

// Comparacion entre test actual y anterior
export interface ComparacionCampo {
  campo: string;
  nombreLegible: string;
  valorActual: number | null;
  valorAnterior: number | null;
  diferencia: number | null;
  porcentajeCambio: number | null;
  mejoro: boolean | null;
  esSignificativo: boolean;
  esCritico: boolean;
}

// Contexto completo para evaluar reglas de tests fisicos
export interface ContextoTestFisico {
  atletaId: bigint;
  nombreAtleta: string;
  testActualId: bigint;
  testActual: DatosTestFisico;
  testAnterior: DatosTestFisico | null;
  testAnteriorId: bigint | null;
  comparaciones: ComparacionCampo[];
  tieneTestAnterior: boolean;
  objetivoVO2max: number;
  fechaTestActual: Date;
  fechaTestAnterior: Date | null;
}

// Accion recomendada por una regla (misma estructura que reglas-rendimiento.ts)
export interface AccionRecomendadaTestFisico {
  reglaId: string;
  tipoRecomendacion: TipoRecomendacion;
  titulo: string;
  mensaje: string;
  accionSugerida: string;
  prioridad: Prioridad;
  datosAnalisis: Record<string, unknown>;
}

// Definicion de una regla para tests fisicos
export interface ReglaTestFisico {
  id: string;
  nombre: string;
  descripcion: string;
  prioridad: Prioridad;
  requiereTestAnterior: boolean;
  condicion: (contexto: ContextoTestFisico) => boolean;
  accion: (contexto: ContextoTestFisico) => Omit<AccionRecomendadaTestFisico, 'reglaId'>;
}

// Nombres legibles para campos
const NOMBRES_CAMPOS: Record<string, string> = {
  pressBanca: 'Press de banca',
  tiron: 'Tiron',
  sentadilla: 'Sentadilla',
  barraFija: 'Barra fija',
  paralelas: 'Paralelas',
  navettePalier: 'Navette (palier)',
  navetteVO2max: 'VO2max (Navette)',
  test1500m: 'Test 1500m',
};

// Categorias de campos para detectar desbalances
const CAMPOS_TREN_SUPERIOR = ['pressBanca', 'tiron', 'barraFija', 'paralelas'];
const CAMPOS_TREN_INFERIOR = ['sentadilla'];
const CAMPOS_RESISTENCIA = ['navettePalier', 'navetteVO2max'];

// Helper: Obtener comparaciones con caida critica
function obtenerCaidasCriticas(ctx: ContextoTestFisico): ComparacionCampo[] {
  return ctx.comparaciones.filter(
    (c) => c.esCritico && c.porcentajeCambio !== null && c.porcentajeCambio < 0
  );
}

// Helper: Obtener comparaciones con empeoramiento significativo
function obtenerEmpeoramientos(ctx: ContextoTestFisico): ComparacionCampo[] {
  return ctx.comparaciones.filter(
    (c) =>
      c.esSignificativo && !c.esCritico && c.porcentajeCambio !== null && c.porcentajeCambio < 0
  );
}

// Helper: Obtener comparaciones con mejora significativa
function obtenerMejoras(ctx: ContextoTestFisico): ComparacionCampo[] {
  return ctx.comparaciones.filter(
    (c) => c.esSignificativo && c.porcentajeCambio !== null && c.porcentajeCambio > 0
  );
}

// Helper: Calcular promedio de un grupo de campos
function calcularPromedioGrupo(datos: DatosTestFisico, campos: string[]): number | null {
  const valores: number[] = [];
  for (const campo of campos) {
    const valor = datos[campo as keyof DatosTestFisico];
    if (typeof valor === 'number' && valor !== null) {
      valores.push(valor);
    }
  }
  if (valores.length === 0) return null;
  return valores.reduce((a, b) => a + b, 0) / valores.length;
}

// REGLA T1: Caida critica en cualquier test (>25%)
export const REGLA_CAIDA_CRITICA: ReglaTestFisico = {
  id: 'T1',
  nombre: 'Caida critica en test fisico',
  descripcion: 'Detecta cuando cualquier test fisico cae mas del 25% respecto al anterior',
  prioridad: 'CRITICA',
  requiereTestAnterior: true,

  condicion: (ctx) => {
    if (!ctx.tieneTestAnterior) return false;
    return obtenerCaidasCriticas(ctx).length > 0;
  },

  accion: (ctx) => {
    const caidas = obtenerCaidasCriticas(ctx);
    const camposAfectados = caidas.map((c) => c.nombreLegible).join(', ');

    let mensaje = `Se detecta una CAIDA CRITICA en los tests fisicos de ${ctx.nombreAtleta}.\n\n`;
    mensaje += `Tests afectados:\n`;
    for (const caida of caidas) {
      mensaje += `- ${caida.nombreLegible}: ${caida.valorAnterior} → ${caida.valorActual} (${caida.porcentajeCambio?.toFixed(1)}%)\n`;
    }
    mensaje += `\nEsto puede indicar: lesion no detectada, enfermedad, sobreentrenamiento severo, o problemas externos graves.`;

    return {
      tipoRecomendacion: 'AJUSTE_POST_TEST',
      titulo: `ALERTA: Caida critica en ${camposAfectados}`,
      mensaje,
      accionSugerida:
        'URGENTE: Detener entrenamiento intenso. Realizar evaluacion medica. Investigar causas inmediatamente.',
      prioridad: 'CRITICA',
      datosAnalisis: {
        testActualId: ctx.testActualId.toString(),
        testAnteriorId: ctx.testAnteriorId?.toString(),
        caidasDetectadas: caidas.map((c) => ({
          campo: c.campo,
          valorAnterior: c.valorAnterior,
          valorActual: c.valorActual,
          porcentajeCambio: c.porcentajeCambio,
        })),
      },
    };
  },
};

// REGLA T2: Empeoramiento significativo (>10% pero <25%)
export const REGLA_EMPEORAMIENTO: ReglaTestFisico = {
  id: 'T2',
  nombre: 'Empeoramiento en test fisico',
  descripcion: 'Detecta cuando cualquier test fisico cae entre 10% y 25% respecto al anterior',
  prioridad: 'ALTA',
  requiereTestAnterior: true,

  condicion: (ctx) => {
    if (!ctx.tieneTestAnterior) return false;
    // Solo si NO hay caidas criticas (para no duplicar alertas)
    if (obtenerCaidasCriticas(ctx).length > 0) return false;
    return obtenerEmpeoramientos(ctx).length > 0;
  },

  accion: (ctx) => {
    const empeoramientos = obtenerEmpeoramientos(ctx);
    const camposAfectados = empeoramientos.map((c) => c.nombreLegible).join(', ');

    let mensaje = `Se detecta empeoramiento en los tests fisicos de ${ctx.nombreAtleta}.\n\n`;
    mensaje += `Tests afectados:\n`;
    for (const emp of empeoramientos) {
      mensaje += `- ${emp.nombreLegible}: ${emp.valorAnterior} → ${emp.valorActual} (${emp.porcentajeCambio?.toFixed(1)}%)\n`;
    }
    mensaje += `\nPosibles causas: fatiga acumulada, recuperacion insuficiente, estres, o inicio de sobreentrenamiento.`;

    return {
      tipoRecomendacion: 'AJUSTE_POST_TEST',
      titulo: `Empeoramiento detectado en ${camposAfectados}`,
      mensaje,
      accionSugerida:
        'Revisar carga de entrenamiento. Considerar semana de descarga. Monitorear sueno y alimentacion.',
      prioridad: 'ALTA',
      datosAnalisis: {
        testActualId: ctx.testActualId.toString(),
        testAnteriorId: ctx.testAnteriorId?.toString(),
        empeoramientosDetectados: empeoramientos.map((e) => ({
          campo: e.campo,
          valorAnterior: e.valorAnterior,
          valorActual: e.valorActual,
          porcentajeCambio: e.porcentajeCambio,
        })),
      },
    };
  },
};

// REGLA T3: VO2max muy bajo (<45)
export const REGLA_VO2MAX_MUY_BAJO: ReglaTestFisico = {
  id: 'T3',
  nombre: 'VO2max muy bajo',
  descripcion: 'Detecta cuando el VO2max esta por debajo del minimo aceptable (45 ml/kg/min)',
  prioridad: 'ALTA',
  requiereTestAnterior: false,

  condicion: (ctx) => {
    const vo2max = ctx.testActual.navetteVO2max;
    if (vo2max === null) return false;
    return vo2max < CONFIGURACION_TESTS.VO2MAX_MUY_BAJO;
  },

  accion: (ctx) => {
    const vo2max = ctx.testActual.navetteVO2max!;
    const deficit = CONFIGURACION_TESTS.VO2MAX_MUY_BAJO - vo2max;

    const mensaje =
      `El VO2max de ${ctx.nombreAtleta} es de ${vo2max.toFixed(1)} ml/kg/min, ` +
      `${deficit.toFixed(1)} puntos por debajo del minimo aceptable (${CONFIGURACION_TESTS.VO2MAX_MUY_BAJO}).\n\n` +
      `Esto indica una capacidad aerobica deficiente que limitara el rendimiento en competencia ` +
      `y la recuperacion entre esfuerzos.\n\n` +
      `Objetivo recomendado: ${ctx.objetivoVO2max} ml/kg/min`;

    return {
      tipoRecomendacion: 'AJUSTE_POST_TEST',
      titulo: `VO2max muy bajo: ${vo2max.toFixed(1)} ml/kg/min`,
      mensaje,
      accionSugerida:
        'Priorizar trabajo aerobico. Incluir minimo 3 sesiones de resistencia por semana. Considerar trabajo de intervalos.',
      prioridad: 'ALTA',
      datosAnalisis: {
        testActualId: ctx.testActualId.toString(),
        vo2maxActual: vo2max,
        minimoAceptable: CONFIGURACION_TESTS.VO2MAX_MUY_BAJO,
        objetivo: ctx.objetivoVO2max,
        deficit: deficit,
      },
    };
  },
};

// REGLA T4: Deficit respecto al objetivo (<70% del objetivo)
export const REGLA_DEFICIT_OBJETIVO: ReglaTestFisico = {
  id: 'T4',
  nombre: 'Deficit respecto al objetivo de VO2max',
  descripcion: 'Detecta cuando el VO2max esta por debajo del 70% del objetivo',
  prioridad: 'MEDIA',
  requiereTestAnterior: false,

  condicion: (ctx) => {
    const vo2max = ctx.testActual.navetteVO2max;
    if (vo2max === null) return false;
    // No disparar si ya se disparo T3 (VO2max muy bajo)
    if (vo2max < CONFIGURACION_TESTS.VO2MAX_MUY_BAJO) return false;

    const umbralMinimo = ctx.objetivoVO2max * (CONFIGURACION_TESTS.VO2MAX_DEFICIT_PORCENTAJE / 100);
    return vo2max < umbralMinimo;
  },

  accion: (ctx) => {
    const vo2max = ctx.testActual.navetteVO2max!;
    const porcentajeDelObjetivo = (vo2max / ctx.objetivoVO2max) * 100;
    const faltante = ctx.objetivoVO2max - vo2max;

    const mensaje =
      `El VO2max de ${ctx.nombreAtleta} es de ${vo2max.toFixed(1)} ml/kg/min ` +
      `(${porcentajeDelObjetivo.toFixed(0)}% del objetivo de ${ctx.objetivoVO2max}).\n\n` +
      `Faltan ${faltante.toFixed(1)} puntos para alcanzar el objetivo.\n\n` +
      `Se recomienda incrementar gradualmente el trabajo de resistencia aerobica.`;

    return {
      tipoRecomendacion: 'AJUSTE_POST_TEST',
      titulo: `VO2max por debajo del objetivo: ${vo2max.toFixed(1)}/${ctx.objetivoVO2max}`,
      mensaje,
      accionSugerida:
        'Aumentar trabajo aerobico progresivamente. Incluir intervalos de alta intensidad 1-2 veces por semana.',
      prioridad: 'MEDIA',
      datosAnalisis: {
        testActualId: ctx.testActualId.toString(),
        vo2maxActual: vo2max,
        objetivo: ctx.objetivoVO2max,
        porcentajeDelObjetivo: porcentajeDelObjetivo,
        faltante: faltante,
      },
    };
  },
};

// REGLA T5: Desbalance entre tren superior e inferior
export const REGLA_DESBALANCE_FUERZA: ReglaTestFisico = {
  id: 'T5',
  nombre: 'Desbalance de fuerza',
  descripcion: 'Detecta diferencia significativa (>30%) entre fuerza de tren superior e inferior',
  prioridad: 'MEDIA',
  requiereTestAnterior: false,

  condicion: (ctx) => {
    // Necesitamos al menos pressBanca/tiron Y sentadilla para comparar
    const tieneSuper = ctx.testActual.pressBanca !== null || ctx.testActual.tiron !== null;
    const tieneInferior = ctx.testActual.sentadilla !== null;

    if (!tieneSuper || !tieneInferior) return false;

    // Calcular ratio press banca vs sentadilla (tipicamente sentadilla deberia ser 1.5x press)
    // O tiron vs sentadilla
    const pressBanca = ctx.testActual.pressBanca;
    const sentadilla = ctx.testActual.sentadilla;

    if (pressBanca !== null && sentadilla !== null && sentadilla > 0) {
      // Ratio esperado: sentadilla = 1.3-1.5 * pressBanca para judokas
      const ratioEsperado = 1.4;
      const ratioActual = sentadilla / pressBanca;

      // Si el ratio esta muy lejos del esperado (>30% de diferencia)
      const diferenciaPorcentaje = Math.abs((ratioActual - ratioEsperado) / ratioEsperado) * 100;
      return diferenciaPorcentaje > CONFIGURACION_TESTS.DESBALANCE_PORCENTAJE;
    }

    return false;
  },

  accion: (ctx) => {
    const pressBanca = ctx.testActual.pressBanca!;
    const sentadilla = ctx.testActual.sentadilla!;
    const ratioActual = sentadilla / pressBanca;
    const ratioEsperado = 1.4;

    let mensaje = `Se detecta un desbalance de fuerza en ${ctx.nombreAtleta}.\n\n`;
    mensaje += `Press banca: ${pressBanca} kg\n`;
    mensaje += `Sentadilla: ${sentadilla} kg\n`;
    mensaje += `Ratio actual (sentadilla/press): ${ratioActual.toFixed(2)}\n`;
    mensaje += `Ratio esperado: ${ratioEsperado}\n\n`;

    let accionSugerida: string;
    if (ratioActual < ratioEsperado) {
      mensaje += `El tren inferior esta relativamente debil comparado con el superior.`;
      accionSugerida =
        'Incrementar trabajo de fuerza de piernas. Priorizar sentadilla y ejercicios de tren inferior.';
    } else {
      mensaje += `El tren superior esta relativamente debil comparado con el inferior.`;
      accionSugerida = 'Incrementar trabajo de fuerza de brazos y torso. Priorizar press y tiron.';
    }

    return {
      tipoRecomendacion: 'PERSONALIZACION_TACTICA',
      titulo: `Desbalance de fuerza detectado`,
      mensaje,
      accionSugerida,
      prioridad: 'MEDIA',
      datosAnalisis: {
        testActualId: ctx.testActualId.toString(),
        pressBanca,
        sentadilla,
        ratioActual,
        ratioEsperado,
        trenDebil: ratioActual < ratioEsperado ? 'inferior' : 'superior',
      },
    };
  },
};

// REGLA T6: Mejora significativa (>10%)
export const REGLA_MEJORA_SIGNIFICATIVA: ReglaTestFisico = {
  id: 'T6',
  nombre: 'Mejora significativa en test fisico',
  descripcion: 'Detecta cuando cualquier test fisico mejora mas del 10% respecto al anterior',
  prioridad: 'BAJA',
  requiereTestAnterior: true,

  condicion: (ctx) => {
    if (!ctx.tieneTestAnterior) return false;
    return obtenerMejoras(ctx).length > 0;
  },

  accion: (ctx) => {
    const mejoras = obtenerMejoras(ctx);
    const camposAfectados = mejoras.map((c) => c.nombreLegible).join(', ');

    let mensaje = `Se detecta mejora significativa en los tests fisicos de ${ctx.nombreAtleta}.\n\n`;
    mensaje += `Tests mejorados:\n`;
    for (const mejora of mejoras) {
      mensaje += `- ${mejora.nombreLegible}: ${mejora.valorAnterior} → ${mejora.valorActual} (+${mejora.porcentajeCambio?.toFixed(1)}%)\n`;
    }
    mensaje += `\nEl atleta muestra progreso positivo. Considerar incrementar gradualmente la dificultad.`;

    return {
      tipoRecomendacion: 'AJUSTE_POST_TEST',
      titulo: `Mejora detectada en ${camposAfectados}`,
      mensaje,
      accionSugerida:
        'Mantener el plan actual. Considerar progresion gradual de cargas en las proximas semanas.',
      prioridad: 'BAJA',
      datosAnalisis: {
        testActualId: ctx.testActualId.toString(),
        testAnteriorId: ctx.testAnteriorId?.toString(),
        mejorasDetectadas: mejoras.map((m) => ({
          campo: m.campo,
          valorAnterior: m.valorAnterior,
          valorActual: m.valorActual,
          porcentajeCambio: m.porcentajeCambio,
        })),
      },
    };
  },
};

// REGLA T7: Objetivo de VO2max alcanzado
export const REGLA_OBJETIVO_ALCANZADO: ReglaTestFisico = {
  id: 'T7',
  nombre: 'Objetivo de VO2max alcanzado',
  descripcion: 'Detecta cuando el atleta alcanza o supera el objetivo de VO2max',
  prioridad: 'BAJA',
  requiereTestAnterior: false,

  condicion: (ctx) => {
    const vo2max = ctx.testActual.navetteVO2max;
    if (vo2max === null) return false;
    return vo2max >= ctx.objetivoVO2max;
  },

  accion: (ctx) => {
    const vo2max = ctx.testActual.navetteVO2max!;
    const exceso = vo2max - ctx.objetivoVO2max;

    let mensaje = `${ctx.nombreAtleta} ha alcanzado el objetivo de VO2max.\n\n`;
    mensaje += `VO2max actual: ${vo2max.toFixed(1)} ml/kg/min\n`;
    mensaje += `Objetivo: ${ctx.objetivoVO2max} ml/kg/min\n`;

    if (exceso > 0) {
      mensaje += `Supera el objetivo por ${exceso.toFixed(1)} puntos.\n\n`;
    }
    mensaje += `Esto indica una excelente capacidad aerobica. Se puede enfocar en otras areas de mejora.`;

    return {
      tipoRecomendacion: 'AJUSTE_POST_TEST',
      titulo: `Objetivo VO2max alcanzado: ${vo2max.toFixed(1)} ml/kg/min`,
      mensaje,
      accionSugerida:
        'Mantener trabajo aerobico de mantenimiento. Enfocar recursos en otras areas de desarrollo.',
      prioridad: 'BAJA',
      datosAnalisis: {
        testActualId: ctx.testActualId.toString(),
        vo2maxActual: vo2max,
        objetivo: ctx.objetivoVO2max,
        excesoSobreObjetivo: exceso,
      },
    };
  },
};

// Lista de todas las reglas ordenadas por prioridad
// Las reglas se evaluan en orden: CRITICA -> ALTA -> MEDIA -> BAJA
export const TODAS_LAS_REGLAS_TEST_FISICO: ReglaTestFisico[] = [
  REGLA_CAIDA_CRITICA, // T1 - CRITICA
  REGLA_EMPEORAMIENTO, // T2 - ALTA
  REGLA_VO2MAX_MUY_BAJO, // T3 - ALTA
  REGLA_DEFICIT_OBJETIVO, // T4 - MEDIA
  REGLA_DESBALANCE_FUERZA, // T5 - MEDIA
  REGLA_MEJORA_SIGNIFICATIVA, // T6 - BAJA
  REGLA_OBJETIVO_ALCANZADO, // T7 - BAJA
];

// Evalua todas las reglas de tests fisicos y retorna las acciones a ejecutar
export function evaluarReglasTestFisico(
  contexto: ContextoTestFisico
): AccionRecomendadaTestFisico[] {
  const acciones: AccionRecomendadaTestFisico[] = [];

  for (const regla of TODAS_LAS_REGLAS_TEST_FISICO) {
    try {
      // Verificar si la regla requiere test anterior y si existe
      if (regla.requiereTestAnterior && !contexto.tieneTestAnterior) {
        continue;
      }

      if (regla.condicion(contexto)) {
        const accion = regla.accion(contexto);
        // Agregar el ID de la regla a la accion
        acciones.push({ ...accion, reglaId: regla.id });
      }
    } catch (error) {
      // Log pero continuar con otras reglas
      console.error(`Error evaluando regla ${regla.id} de test fisico:`, error);
    }
  }

  return acciones;
}

// Construir comparaciones entre test actual y anterior
export function construirComparaciones(
  testActual: DatosTestFisico,
  testAnterior: DatosTestFisico | null
): ComparacionCampo[] {
  const comparaciones: ComparacionCampo[] = [];

  // Campos numericos a comparar (excluye test1500m que es string)
  const camposNumericos: (keyof DatosTestFisico)[] = [
    'pressBanca',
    'tiron',
    'sentadilla',
    'barraFija',
    'paralelas',
    'navettePalier',
    'navetteVO2max',
  ];

  for (const campo of camposNumericos) {
    const valorActual = testActual[campo] as number | null;
    const valorAnterior = testAnterior ? (testAnterior[campo] as number | null) : null;

    let diferencia: number | null = null;
    let porcentajeCambio: number | null = null;
    let mejoro: boolean | null = null;
    let esSignificativo = false;
    let esCritico = false;

    if (valorActual !== null && valorAnterior !== null && valorAnterior !== 0) {
      diferencia = valorActual - valorAnterior;
      porcentajeCambio = (diferencia / valorAnterior) * 100;
      mejoro = diferencia > 0;

      // Determinar si es significativo o critico
      const porcentajeAbsoluto = Math.abs(porcentajeCambio);
      esSignificativo = porcentajeAbsoluto >= CONFIGURACION_TESTS.EMPEORAMIENTO_PORCENTAJE;
      esCritico = porcentajeAbsoluto >= CONFIGURACION_TESTS.CAIDA_CRITICA_PORCENTAJE;
    }

    comparaciones.push({
      campo,
      nombreLegible: NOMBRES_CAMPOS[campo] || campo,
      valorActual,
      valorAnterior,
      diferencia,
      porcentajeCambio,
      mejoro,
      esSignificativo,
      esCritico,
    });
  }

  return comparaciones;
}

// Obtiene la prioridad mas alta de las acciones
export function obtenerPrioridadMaximaTestFisico(
  acciones: AccionRecomendadaTestFisico[]
): Prioridad {
  const ordenPrioridad: Prioridad[] = ['CRITICA', 'ALTA', 'MEDIA', 'BAJA'];

  for (const prioridad of ordenPrioridad) {
    if (acciones.some((a) => a.prioridad === prioridad)) {
      return prioridad;
    }
  }

  return 'BAJA';
}
