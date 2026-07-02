// Reglas IF-THEN para generar recomendaciones basadas en rendimiento
// Basado en: docs/algoritmo_10_especificacion_funcional.md seccion 5
// Fuente academica: Rule-based reasoning systems (Jackson, 1999)

import { TipoEjercicio, TipoRecomendacion, Prioridad } from '@prisma/client';
import {
  RendimientoPorTipo,
  EjercicioProblematico,
  CONFIGURACION_ANALISIS,
} from '../services/analisis-rendimiento.service';

// Contexto para evaluar las reglas
export interface ContextoEvaluacion {
  atletaId: bigint;
  nombreAtleta: string;
  rendimientoPorTipo: RendimientoPorTipo[];
  ejerciciosProblematicos: EjercicioProblematico[];
  diasAnalizados: number;
}

// Accion recomendada por una regla
export interface AccionRecomendada {
  reglaId: string;
  tipoRecomendacion: TipoRecomendacion;
  titulo: string;
  mensaje: string;
  accionSugerida: string;
  cambiosSugeridos: {
    reducir: { ejercicioId: bigint; nombre: string; razon: string }[];
    agregar: { ejercicioId: bigint; nombre: string; razon: string }[];
    modificar: { ejercicioId: bigint; cambio: string }[];
  };
  prioridad: Prioridad;
  datosAnalisis: Record<string, unknown>;
}

// Definicion de una regla
// La accion retorna AccionRecomendada sin reglaId, que se agrega en evaluarReglas
export interface Regla {
  id: string;
  nombre: string;
  descripcion: string;
  prioridad: Prioridad;
  condicion: (contexto: ContextoEvaluacion) => boolean;
  accion: (contexto: ContextoEvaluacion) => Omit<AccionRecomendada, 'reglaId'>;
}

// Nombres legibles para tipos de ejercicio
const NOMBRES_TIPO: Record<string, string> = {
  FISICO: 'fisicos',
  TECNICO_TACHI: 'tecnicos de pie (tachi-waza)',
  TECNICO_NE: 'tecnicos de suelo (ne-waza)',
  RESISTENCIA: 'de resistencia',
  VELOCIDAD: 'de velocidad',
};

// REGLA R1: Bajo rendimiento sostenido en un tipo de ejercicio
export const REGLA_BAJO_RENDIMIENTO_TIPO: Regla = {
  id: 'R1',
  nombre: 'Bajo rendimiento en tipo de ejercicio',
  descripcion:
    'Detecta cuando el atleta tiene rendimiento promedio < 5 en un tipo de ejercicio con al menos 5 registros',
  prioridad: 'ALTA',

  condicion: (ctx) => {
    return ctx.rendimientoPorTipo.some(
      (tipo) =>
        tipo.rendimientoPromedio < CONFIGURACION_ANALISIS.RENDIMIENTO_BAJO &&
        tipo.cantidadRegistros >= CONFIGURACION_ANALISIS.MINIMO_REGISTROS_ANALISIS &&
        tipo.tendencia.tendencia !== 'MEJORANDO'
    );
  },

  accion: (ctx) => {
    const tipoProblematico = ctx.rendimientoPorTipo.find(
      (tipo) =>
        tipo.rendimientoPromedio < CONFIGURACION_ANALISIS.RENDIMIENTO_BAJO &&
        tipo.cantidadRegistros >= CONFIGURACION_ANALISIS.MINIMO_REGISTROS_ANALISIS &&
        tipo.tendencia.tendencia !== 'MEJORANDO'
    )!;

    const nombreTipo = NOMBRES_TIPO[tipoProblematico.tipo] || tipoProblematico.tipo;

    // Construir mensaje detallado
    let mensaje = `${ctx.nombreAtleta} ha mostrado rendimiento promedio de ${tipoProblematico.rendimientoPromedio.toFixed(1)}/10 `;
    mensaje += `en ejercicios ${nombreTipo} durante las ultimas ${tipoProblematico.cantidadRegistros} sesiones.\n\n`;

    if (tipoProblematico.ejerciciosProblematicos.length > 0) {
      mensaje += 'Ejercicios problematicos detectados:\n';
      for (const ej of tipoProblematico.ejerciciosProblematicos.slice(0, 3)) {
        mensaje += `- ${ej.nombre}: ${ej.rendimientoPromedio.toFixed(1)}/10 `;
        mensaje += `(${ej.vecesAsignado} sesiones`;
        if (ej.vecesNoCompletado > 0) {
          mensaje += `, ${ej.vecesNoCompletado} no completadas`;
        }
        mensaje += ')\n';
      }
      mensaje += '\n';
    }

    mensaje += `Analisis estadistico:\n`;
    mensaje += `- Z-Score: ${tipoProblematico.zScore.zScore} (${tipoProblematico.zScore.interpretacion.toLowerCase().replace('_', ' ')})\n`;
    mensaje += `- Tendencia: ${tipoProblematico.tendencia.tendencia}\n`;
    mensaje += `- Confianza del analisis: ${Math.round(tipoProblematico.tendencia.rSquared * 100)}%`;

    // Determinar que alternativas usar:
    // - Si hay ejercicios problematicos especificos, usar sus alternativas
    // - Si no hay ejercicios especificos (porque no se repiten), usar alternativas del tipo
    const hayEjerciciosProblematicos = tipoProblematico.ejerciciosProblematicos.length > 0;

    let reducir: { ejercicioId: bigint; nombre: string; razon: string }[] = [];
    let agregar: { ejercicioId: bigint; nombre: string; razon: string }[] = [];

    if (hayEjerciciosProblematicos) {
      // Ejercicios a reducir: los que tienen bajo rendimiento
      reducir = tipoProblematico.ejerciciosProblematicos.slice(0, 2).map((ej) => ({
        ejercicioId: ej.ejercicioId,
        nombre: ej.nombre,
        razon: `Rendimiento bajo sostenido (${ej.rendimientoPromedio.toFixed(1)}/10)`,
      }));

      // Ejercicios a agregar: alternativas del tipo, excluyendo los problematicos
      const idsProblematicos = new Set(
        tipoProblematico.ejerciciosProblematicos.map((ej) => ej.ejercicioId.toString())
      );
      agregar = (tipoProblematico.alternativasSugeridasDelTipo || [])
        .filter((alt) => !idsProblematicos.has(alt.ejercicioId.toString()))
        .slice(0, 3)
        .map((alt) => ({
          ejercicioId: alt.ejercicioId,
          nombre: alt.nombre,
          razon: alt.razon,
        }));
    } else if (tipoProblematico.alternativasSugeridasDelTipo?.length > 0) {
      // Caso especial: no hay ejercicios especificos pero hay bajo rendimiento en el tipo
      // Usar alternativas a nivel de tipo para sugerir ejercicios mas apropiados
      agregar = tipoProblematico.alternativasSugeridasDelTipo.slice(0, 3).map((alt) => ({
        ejercicioId: alt.ejercicioId,
        nombre: alt.nombre,
        razon: alt.razon,
      }));
    }

    return {
      tipoRecomendacion: 'PERSONALIZACION_TACTICA',
      titulo: `Bajo rendimiento en ejercicios ${nombreTipo}`,
      mensaje,
      accionSugerida:
        'Revisar los ejercicios problematicos y considerar las alternativas sugeridas. Se recomienda reforzar fundamentos antes de continuar con tecnicas avanzadas.',
      cambiosSugeridos: {
        reducir,
        agregar,
        modificar: [],
      },
      prioridad: 'ALTA',
      datosAnalisis: {
        tipoEjercicioAfectado: tipoProblematico.tipo,
        rendimientoPromedio: tipoProblematico.rendimientoPromedio,
        zScore: tipoProblematico.zScore.zScore,
        tendencia: tipoProblematico.tendencia.tendencia,
        cantidadRegistros: tipoProblematico.cantidadRegistros,
      },
    };
  },
};

// REGLA R2: Ejercicio especifico que falla repetidamente
export const REGLA_EJERCICIO_RECURRENTE_FALLA: Regla = {
  id: 'R2',
  nombre: 'Ejercicio con fallas recurrentes',
  descripcion: 'Detecta ejercicios que no se completan en 2+ de las ultimas 3 asignaciones',
  prioridad: 'MEDIA',

  condicion: (ctx) => {
    return ctx.ejerciciosProblematicos.some(
      (ej) =>
        (ej.vecesNoCompletado >= CONFIGURACION_ANALISIS.MINIMO_NO_COMPLETADOS_PARA_ALERTA &&
          ej.vecesAsignado >= CONFIGURACION_ANALISIS.MINIMO_ASIGNACIONES_PARA_PROBLEMA) ||
        (ej.rendimientoPromedio < 4 &&
          ej.vecesAsignado >= CONFIGURACION_ANALISIS.MINIMO_ASIGNACIONES_PARA_PROBLEMA)
    );
  },

  accion: (ctx) => {
    const ejercicio = ctx.ejerciciosProblematicos.find(
      (ej) =>
        (ej.vecesNoCompletado >= CONFIGURACION_ANALISIS.MINIMO_NO_COMPLETADOS_PARA_ALERTA &&
          ej.vecesAsignado >= CONFIGURACION_ANALISIS.MINIMO_ASIGNACIONES_PARA_PROBLEMA) ||
        (ej.rendimientoPromedio < 4 &&
          ej.vecesAsignado >= CONFIGURACION_ANALISIS.MINIMO_ASIGNACIONES_PARA_PROBLEMA)
    )!;

    let mensaje = `${ctx.nombreAtleta} ha mostrado dificultades con "${ejercicio.nombre}" `;
    mensaje += `en las ultimas ${ejercicio.vecesAsignado} sesiones.\n\n`;
    mensaje += `Rendimiento promedio: ${ejercicio.rendimientoPromedio.toFixed(1)}/10\n`;
    mensaje += `No completado: ${ejercicio.vecesNoCompletado} veces de ${ejercicio.vecesAsignado}`;

    if (ejercicio.tendencia) {
      mensaje += `\nTendencia: ${ejercicio.tendencia}`;
    }

    return {
      tipoRecomendacion: 'PERSONALIZACION_TACTICA',
      titulo: `Ejercicio "${ejercicio.nombre}" con bajo rendimiento recurrente`,
      mensaje,
      accionSugerida: 'Sustituir por ejercicio alternativo de menor dificultad',
      cambiosSugeridos: {
        reducir: [
          {
            ejercicioId: ejercicio.ejercicioId,
            nombre: ejercicio.nombre,
            razon: 'Bajo rendimiento recurrente',
          },
        ],
        agregar: ejercicio.alternativasSugeridas.map((alt) => ({
          ejercicioId: alt.ejercicioId,
          nombre: alt.nombre,
          razon: alt.razon,
        })),
        modificar: [],
      },
      prioridad: 'MEDIA',
      datosAnalisis: {
        ejercicioId: ejercicio.ejercicioId.toString(),
        ejercicioNombre: ejercicio.nombre,
        vecesAsignado: ejercicio.vecesAsignado,
        vecesNoCompletado: ejercicio.vecesNoCompletado,
        rendimientoPromedio: ejercicio.rendimientoPromedio,
      },
    };
  },
};

// REGLA R3: Z-Score critico bajo
export const REGLA_ZSCORE_CRITICO: Regla = {
  id: 'R3',
  nombre: 'Desviacion critica del rendimiento normal',
  descripcion: 'Detecta cuando el Z-Score de un tipo de ejercicio es critico (<-2.0)',
  prioridad: 'CRITICA',

  condicion: (ctx) => {
    return ctx.rendimientoPorTipo.some((tipo) => tipo.zScore.interpretacion === 'CRITICO_BAJO');
  },

  accion: (ctx) => {
    const tipoCritico = ctx.rendimientoPorTipo.find(
      (tipo) => tipo.zScore.interpretacion === 'CRITICO_BAJO'
    )!;

    const nombreTipo = NOMBRES_TIPO[tipoCritico.tipo] || tipoCritico.tipo;

    let mensaje = `El rendimiento de ${ctx.nombreAtleta} en ejercicios ${nombreTipo} esta `;
    mensaje += `significativamente por debajo de su nivel normal.\n\n`;
    mensaje += `Z-Score: ${tipoCritico.zScore.zScore} (critico)\n`;
    mensaje += `Rendimiento actual: ${tipoCritico.rendimientoPromedio.toFixed(1)}/10\n`;
    mensaje += `Media historica: ${tipoCritico.zScore.media}/10\n\n`;
    mensaje += `Esto puede indicar: fatiga acumulada, lesion no reportada, problemas externos, o sobrecarga de entrenamiento.`;

    return {
      tipoRecomendacion: 'ALERTA_FATIGA',
      titulo: `Caida critica en rendimiento de ejercicios ${nombreTipo}`,
      mensaje,
      accionSugerida:
        'URGENTE: Investigar causa. Considerar reducir carga significativamente o dar descanso. Hablar con el atleta.',
      cambiosSugeridos: {
        reducir: [],
        agregar: [],
        modificar: [
          {
            ejercicioId: BigInt(0),
            cambio: `Reducir frecuencia e intensidad de ejercicios ${nombreTipo} en 30-50% hasta recuperar rendimiento normal`,
          },
        ],
      },
      prioridad: 'CRITICA',
      datosAnalisis: {
        tipoEjercicioAfectado: tipoCritico.tipo,
        zScore: tipoCritico.zScore.zScore,
        interpretacion: tipoCritico.zScore.interpretacion,
        rendimientoActual: tipoCritico.rendimientoPromedio,
        mediaHistorica: tipoCritico.zScore.media,
      },
    };
  },
};

// REGLA R4: Tendencia de empeoramiento sostenida
export const REGLA_TENDENCIA_NEGATIVA: Regla = {
  id: 'R4',
  nombre: 'Tendencia de empeoramiento detectada',
  descripcion: 'Detecta tendencia EMPEORANDO con alta confianza (R^2 > 0.5)',
  prioridad: 'ALTA',

  condicion: (ctx) => {
    return ctx.rendimientoPorTipo.some(
      (tipo) =>
        tipo.tendencia.tendencia === 'EMPEORANDO' &&
        tipo.tendencia.rSquared > 0.5 &&
        tipo.cantidadRegistros >= CONFIGURACION_ANALISIS.MINIMO_REGISTROS_ANALISIS
    );
  },

  accion: (ctx) => {
    const tipoEmpeorando = ctx.rendimientoPorTipo.find(
      (tipo) => tipo.tendencia.tendencia === 'EMPEORANDO' && tipo.tendencia.rSquared > 0.5
    )!;

    const nombreTipo = NOMBRES_TIPO[tipoEmpeorando.tipo] || tipoEmpeorando.tipo;

    let mensaje = `Se detecta una tendencia de empeoramiento en ejercicios ${nombreTipo} `;
    mensaje += `para ${ctx.nombreAtleta}.\n\n`;
    mensaje += `Pendiente: ${tipoEmpeorando.tendencia.pendiente}/sesion\n`;
    mensaje += `Confianza: ${Math.round(tipoEmpeorando.tendencia.rSquared * 100)}%\n`;
    mensaje += `Rendimiento actual: ${tipoEmpeorando.rendimientoPromedio.toFixed(1)}/10\n\n`;
    mensaje += `Si continua esta tendencia, se proyecta un rendimiento de `;
    mensaje += `${tipoEmpeorando.tendencia.prediccionProximaSesion}/10 en la proxima sesion.`;

    return {
      tipoRecomendacion: 'AJUSTE_PLANIFICACION',
      titulo: `Tendencia negativa en ejercicios ${nombreTipo}`,
      mensaje,
      accionSugerida:
        'Revisar planificacion. Considerar periodo de consolidacion antes de progresar. Posiblemente necesario microciclo de DESCARGA.',
      cambiosSugeridos: {
        reducir: tipoEmpeorando.ejerciciosProblematicos.slice(0, 2).map((ej) => ({
          ejercicioId: ej.ejercicioId,
          nombre: ej.nombre,
          razon: 'Contribuye a tendencia negativa',
        })),
        agregar: [],
        modificar: [
          {
            ejercicioId: BigInt(0),
            cambio: 'Considerar microciclo de DESCARGA o RECUPERACION',
          },
        ],
      },
      prioridad: 'ALTA',
      datosAnalisis: {
        tipoEjercicioAfectado: tipoEmpeorando.tipo,
        pendiente: tipoEmpeorando.tendencia.pendiente,
        confianza: tipoEmpeorando.tendencia.rSquared,
        prediccion: tipoEmpeorando.tendencia.prediccionProximaSesion,
        rendimientoActual: tipoEmpeorando.rendimientoPromedio,
      },
    };
  },
};

// REGLA R5: Mejora significativa detectada (informativa)
export const REGLA_MEJORA_DETECTADA: Regla = {
  id: 'R5',
  nombre: 'Mejora significativa detectada',
  descripcion: 'Detecta cuando hay una mejora notable en el rendimiento (Z-Score > 1.5)',
  prioridad: 'BAJA',

  condicion: (ctx) => {
    return ctx.rendimientoPorTipo.some(
      (tipo) =>
        (tipo.zScore.interpretacion === 'ALERTA_ALTA' ||
          tipo.zScore.interpretacion === 'CRITICO_ALTO') &&
        tipo.tendencia.tendencia === 'MEJORANDO'
    );
  },

  accion: (ctx) => {
    const tipoMejorando = ctx.rendimientoPorTipo.find(
      (tipo) =>
        (tipo.zScore.interpretacion === 'ALERTA_ALTA' ||
          tipo.zScore.interpretacion === 'CRITICO_ALTO') &&
        tipo.tendencia.tendencia === 'MEJORANDO'
    )!;

    const nombreTipo = NOMBRES_TIPO[tipoMejorando.tipo] || tipoMejorando.tipo;

    const mensaje =
      `Se detecta una mejora significativa en ejercicios ${nombreTipo} para ${ctx.nombreAtleta}.\n\n` +
      `Z-Score: +${tipoMejorando.zScore.zScore} (por encima de su media historica)\n` +
      `Rendimiento actual: ${tipoMejorando.rendimientoPromedio.toFixed(1)}/10\n` +
      `Tendencia: ${tipoMejorando.tendencia.tendencia}\n\n` +
      `Esto es positivo. Considerar progresar gradualmente la dificultad.`;

    return {
      tipoRecomendacion: 'PERSONALIZACION_TACTICA',
      titulo: `Mejora detectada en ejercicios ${nombreTipo}`,
      mensaje,
      accionSugerida:
        'Considerar incrementar gradualmente la dificultad o agregar ejercicios mas avanzados.',
      cambiosSugeridos: {
        reducir: [],
        agregar: [],
        modificar: [
          {
            ejercicioId: BigInt(0),
            cambio: `Considerar progresar a ejercicios ${nombreTipo} de mayor dificultad`,
          },
        ],
      },
      prioridad: 'BAJA',
      datosAnalisis: {
        tipoEjercicioAfectado: tipoMejorando.tipo,
        zScore: tipoMejorando.zScore.zScore,
        rendimientoActual: tipoMejorando.rendimientoPromedio,
        tendencia: tipoMejorando.tendencia.tendencia,
      },
    };
  },
};

// Lista de todas las reglas ordenadas por prioridad
// Las reglas se evaluan en orden: CRITICA -> ALTA -> MEDIA -> BAJA
export const TODAS_LAS_REGLAS: Regla[] = [
  REGLA_ZSCORE_CRITICO, // Prioridad CRITICA - evaluar primero
  REGLA_BAJO_RENDIMIENTO_TIPO, // Prioridad ALTA
  REGLA_TENDENCIA_NEGATIVA, // Prioridad ALTA
  REGLA_EJERCICIO_RECURRENTE_FALLA, // Prioridad MEDIA
  REGLA_MEJORA_DETECTADA, // Prioridad BAJA (informativa)
];

// Evalua todas las reglas y retorna las acciones a ejecutar
export function evaluarReglas(contexto: ContextoEvaluacion): AccionRecomendada[] {
  const acciones: AccionRecomendada[] = [];

  for (const regla of TODAS_LAS_REGLAS) {
    try {
      if (regla.condicion(contexto)) {
        const accion = regla.accion(contexto);
        // Agregar el ID de la regla a la accion
        acciones.push({ ...accion, reglaId: regla.id });
      }
    } catch (error) {
      // Log pero continuar con otras reglas
      console.error(`Error evaluando regla ${regla.id}: ${error}`);
    }
  }

  return acciones;
}

// Obtiene la prioridad mas alta de las acciones
export function obtenerPrioridadMaxima(acciones: AccionRecomendada[]): Prioridad {
  const ordenPrioridad: Prioridad[] = ['CRITICA', 'ALTA', 'MEDIA', 'BAJA'];

  for (const prioridad of ordenPrioridad) {
    if (acciones.some((a) => a.prioridad === prioridad)) {
      return prioridad;
    }
  }

  return 'BAJA';
}
