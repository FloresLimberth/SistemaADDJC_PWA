// Servicio de generacion de alertas automaticas
// Evalua reglas de: fatiga, lesion, peso, desviacion de carga
// Basado en: docs/algoritmo_04_investigacion_tecnica.md

import { TipoAlerta, Severidad, CategoriaPeso } from '@prisma/client';
import { calcularACWRDesdeRegistros, ResultadoACWR } from '../calculators/acwr.calculator';

// Umbrales para deteccion de alertas
export const UMBRALES_ALERTA = {
  // Fatiga
  RPE_ALTO: 8,
  RPE_CRITICO: 9,
  SUENO_MALO: 5,
  SUENO_CRITICO: 3,
  ACWR_PELIGRO: 1.3,
  ACWR_CRITICO: 1.5,
  DIAS_CONSECUTIVOS: 3,
  // Lesion
  NIVEL_DOLOR_ALTO: 7,
  DOLENCIAS_RECURRENTES: 2,
  DIAS_RECURRENCIA: 30,
  // Peso
  KG_SOBREPESO_ALERTA: 0,
  KG_SOBREPESO_CRITICO: 2,
  KG_BAJOPESO_ALERTA: 2,
  // Desviacion
  EJERCICIOS_MINIMO: 70,
  DESVIACION_INTENSIDAD: 20,
} as const;

// Limites de peso por categoria
const LIMITES_PESO: Record<CategoriaPeso, { min: number; max: number }> = {
  MENOS_60K: { min: 0, max: 60 },
  MENOS_66K: { min: 60, max: 66 },
  MENOS_73K: { min: 66, max: 73 },
  MENOS_81K: { min: 73, max: 81 },
  MENOS_90K: { min: 81, max: 90 },
  MENOS_100K: { min: 90, max: 100 },
  MAS_100K: { min: 100, max: 999 },
};

// Estructura de una alerta generada
export interface AlertaGenerada {
  tipo: TipoAlerta;
  severidad: Severidad;
  titulo: string;
  mensaje: string;
  valorDetectado: number | string;
  umbral: number | string;
  accionSugerida: string;
}

// Datos de entrada para evaluar fatiga
export interface DatosRegistroParaAlerta {
  fechaRegistro: Date;
  rpe: number;
  calidadSueno: number;
  estadoAnimico: number;
  duracionReal: number;
  ejerciciosCompletados: number;
  intensidadAlcanzada: number;
}

// Datos de sesion para comparar desviacion
export interface DatosSesionParaAlerta {
  intensidadPlanificada: number | null;
  volumenPlanificado: number | null;
}

// Datos de dolencia
export interface DatosDolencia {
  zona: string;
  nivel: number;
  recuperado: boolean;
  fechaCreacion: Date;
}

// Datos de tolerancia de peso (obtenidos de tabla tolerancias_peso)
export interface DatosTolerancia {
  toleranciaKg: number; // Tolerancia en kg sobre el limite de la categoria
}

// Resultado del analisis de alertas
export interface ResultadoAlertas {
  hayAlertas: boolean;
  alertas: AlertaGenerada[];
  acwr: ResultadoACWR | null;
  resumen: string;
}

// Calcula promedio de un array
function promedio(valores: number[]): number {
  if (valores.length === 0) return 0;
  return valores.reduce((a, b) => a + b, 0) / valores.length;
}

// Evalua reglas de fatiga
export function evaluarFatiga(
  registroActual: DatosRegistroParaAlerta,
  historial: DatosRegistroParaAlerta[]
): AlertaGenerada[] {
  const alertas: AlertaGenerada[] = [];

  // Regla 1: RPE critico en sesion actual
  if (registroActual.rpe >= UMBRALES_ALERTA.RPE_CRITICO) {
    alertas.push({
      tipo: 'FATIGA_ALTA',
      severidad: 'ALTA',
      titulo: 'RPE muy alto detectado',
      mensaje: `El atleta reporto un RPE de ${registroActual.rpe}/10, indicando esfuerzo excesivo.`,
      valorDetectado: registroActual.rpe,
      umbral: UMBRALES_ALERTA.RPE_CRITICO,
      accionSugerida: 'Reducir carga de entrenamiento. Programar sesion de recuperacion activa.',
    });
  } else if (registroActual.rpe >= UMBRALES_ALERTA.RPE_ALTO) {
    alertas.push({
      tipo: 'FATIGA_ALTA',
      severidad: 'MEDIA',
      titulo: 'RPE elevado',
      mensaje: `RPE de ${registroActual.rpe}/10 detectado. Monitorear en proximas sesiones.`,
      valorDetectado: registroActual.rpe,
      umbral: UMBRALES_ALERTA.RPE_ALTO,
      accionSugerida: 'Monitorear sintomas de fatiga. Considerar reducir volumen si persiste.',
    });
  }

  // Regla 2: Sueno deficiente
  if (registroActual.calidadSueno <= UMBRALES_ALERTA.SUENO_CRITICO) {
    alertas.push({
      tipo: 'FATIGA_ALTA',
      severidad: 'ALTA',
      titulo: 'Calidad de sueno critica',
      mensaje: `Calidad de sueno ${registroActual.calidadSueno}/10. La recuperacion esta comprometida.`,
      valorDetectado: registroActual.calidadSueno,
      umbral: UMBRALES_ALERTA.SUENO_CRITICO,
      accionSugerida: 'Priorizar descanso. Reducir intensidad hasta mejorar sueno.',
    });
  } else if (registroActual.calidadSueno <= UMBRALES_ALERTA.SUENO_MALO) {
    alertas.push({
      tipo: 'FATIGA_ALTA',
      severidad: 'MEDIA',
      titulo: 'Calidad de sueno deficiente',
      mensaje: `Calidad de sueno ${registroActual.calidadSueno}/10. Puede afectar rendimiento.`,
      valorDetectado: registroActual.calidadSueno,
      umbral: UMBRALES_ALERTA.SUENO_MALO,
      accionSugerida: 'Revisar habitos de sueno. Considerar reducir volumen 10%.',
    });
  }

  // Regla 3: RPE alto sostenido (ultimos 3 dias)
  if (historial.length >= UMBRALES_ALERTA.DIAS_CONSECUTIVOS) {
    const ultimosRegistros = historial.slice(0, UMBRALES_ALERTA.DIAS_CONSECUTIVOS);
    const rpePromedio = promedio(ultimosRegistros.map((r) => r.rpe));

    if (rpePromedio >= UMBRALES_ALERTA.RPE_ALTO) {
      alertas.push({
        tipo: 'FATIGA_ALTA',
        severidad: 'CRITICA',
        titulo: 'Fatiga acumulada detectada',
        mensaje: `RPE promedio de ${rpePromedio.toFixed(1)} en ultimos ${UMBRALES_ALERTA.DIAS_CONSECUTIVOS} dias.`,
        valorDetectado: rpePromedio,
        umbral: UMBRALES_ALERTA.RPE_ALTO,
        accionSugerida: 'Programar microciclo de descarga. El atleta necesita recuperacion.',
      });
    }
  }

  return alertas;
}

// Evalua ACWR y genera alertas
export function evaluarACWR(historial: DatosRegistroParaAlerta[]): {
  alertas: AlertaGenerada[];
  acwr: ResultadoACWR | null;
} {
  const alertas: AlertaGenerada[] = [];

  // Necesitamos al menos 7 dias de datos para calcular ACWR
  if (historial.length < 7) {
    return { alertas: [], acwr: null };
  }

  const registrosParaACWR = historial.map((r) => ({
    duracionReal: r.duracionReal,
    rpe: r.rpe,
    fechaRegistro: r.fechaRegistro,
  }));

  const acwr = calcularACWRDesdeRegistros(registrosParaACWR);

  if (acwr.acwr >= UMBRALES_ALERTA.ACWR_CRITICO) {
    alertas.push({
      tipo: 'FATIGA_ALTA',
      severidad: 'CRITICA',
      titulo: 'ACWR en zona de alto riesgo',
      mensaje: `ACWR de ${acwr.acwr} indica alto riesgo de lesion. Zona: ${acwr.zona}.`,
      valorDetectado: acwr.acwr,
      umbral: UMBRALES_ALERTA.ACWR_CRITICO,
      accionSugerida: 'Reducir carga de entrenamiento urgentemente. Riesgo elevado de lesion.',
    });
  } else if (acwr.acwr >= UMBRALES_ALERTA.ACWR_PELIGRO) {
    alertas.push({
      tipo: 'FATIGA_ALTA',
      severidad: 'ALTA',
      titulo: 'ACWR en zona de peligro',
      mensaje: `ACWR de ${acwr.acwr} esta en zona de peligro. Zona: ${acwr.zona}.`,
      valorDetectado: acwr.acwr,
      umbral: UMBRALES_ALERTA.ACWR_PELIGRO,
      accionSugerida: 'Moderar incremento de carga. Monitorear sintomas de fatiga.',
    });
  }

  return { alertas, acwr };
}

// Evalua reglas de lesion
export function evaluarLesiones(
  dolenciasActivas: DatosDolencia[],
  historialDolencias: DatosDolencia[]
): AlertaGenerada[] {
  const alertas: AlertaGenerada[] = [];

  // Regla 1: Dolencias activas con nivel alto
  const dolenciasGraves = dolenciasActivas.filter(
    (d) => d.nivel >= UMBRALES_ALERTA.NIVEL_DOLOR_ALTO
  );

  if (dolenciasGraves.length > 0) {
    alertas.push({
      tipo: 'LESION_DETECTADA',
      severidad: 'CRITICA',
      titulo: 'Dolor intenso reportado',
      mensaje: `${dolenciasGraves.length} dolencia(s) con nivel alto: ${dolenciasGraves.map((d) => d.zona).join(', ')}.`,
      valorDetectado: dolenciasGraves[0].nivel,
      umbral: UMBRALES_ALERTA.NIVEL_DOLOR_ALTO,
      accionSugerida: 'Evitar ejercicios de zona afectada. Evaluacion medica recomendada.',
    });
  } else if (dolenciasActivas.length > 0) {
    alertas.push({
      tipo: 'LESION_DETECTADA',
      severidad: 'MEDIA',
      titulo: 'Dolencias activas',
      mensaje: `${dolenciasActivas.length} dolencia(s) reportada(s): ${dolenciasActivas.map((d) => d.zona).join(', ')}.`,
      valorDetectado: dolenciasActivas.length,
      umbral: 1,
      accionSugerida: 'Adaptar entrenamiento para evitar agravar zonas afectadas.',
    });
  }

  // Regla 2: Dolor recurrente en misma zona (ultimos 30 dias)
  const hace30Dias = new Date();
  hace30Dias.setDate(hace30Dias.getDate() - UMBRALES_ALERTA.DIAS_RECURRENCIA);

  const dolenciasRecientes = historialDolencias.filter(
    (d) => new Date(d.fechaCreacion) >= hace30Dias
  );

  // Agrupar por zona
  const zonasCont: Record<string, number> = {};
  dolenciasRecientes.forEach((d) => {
    zonasCont[d.zona] = (zonasCont[d.zona] || 0) + 1;
  });

  const zonasRecurrentes = Object.entries(zonasCont).filter(
    ([, count]) => count >= UMBRALES_ALERTA.DOLENCIAS_RECURRENTES
  );

  if (zonasRecurrentes.length > 0) {
    alertas.push({
      tipo: 'LESION_DETECTADA',
      severidad: 'CRITICA',
      titulo: 'Dolor recurrente detectado',
      mensaje: `Dolor recurrente en: ${zonasRecurrentes.map(([zona, count]) => `${zona} (${count} veces)`).join(', ')}.`,
      valorDetectado: zonasRecurrentes.map(([z]) => z).join(', '),
      umbral: `${UMBRALES_ALERTA.DOLENCIAS_RECURRENTES} ocurrencias en ${UMBRALES_ALERTA.DIAS_RECURRENCIA} dias`,
      accionSugerida: 'Evaluacion medica urgente. Posible lesion cronica.',
    });
  }

  return alertas;
}

// Evalua reglas de peso con tolerancia dinamica
// La tolerancia se obtiene de la tabla tolerancias_peso segun periodo y dia
export function evaluarPeso(
  pesoActual: number | null,
  categoriaPeso: CategoriaPeso,
  tolerancia?: DatosTolerancia
): AlertaGenerada[] {
  const alertas: AlertaGenerada[] = [];

  if (pesoActual === null) {
    return alertas;
  }

  const limites = LIMITES_PESO[categoriaPeso];
  // Usar tolerancia si se proporciona, sino tolerancia 0 (estricto)
  const toleranciaKg = tolerancia?.toleranciaKg ?? 0;
  // Limite efectivo = limite de categoria + tolerancia
  const limiteEfectivo = limites.max + toleranciaKg;

  // Regla 1: Sobrepeso (considerando tolerancia)
  if (pesoActual > limiteEfectivo) {
    const sobrepeso = pesoActual - limites.max; // Siempre mostrar sobrepeso real
    const sobreTolerancia = pesoActual - limiteEfectivo;

    if (sobreTolerancia >= UMBRALES_ALERTA.KG_SOBREPESO_CRITICO) {
      alertas.push({
        tipo: 'PESO_FUERA_RANGO',
        severidad: 'CRITICA',
        titulo: 'Peso muy por encima de categoria',
        mensaje: `Peso actual ${pesoActual}kg, ${sobrepeso.toFixed(1)}kg sobre el limite de ${limites.max}kg (tolerancia actual: ${toleranciaKg}kg).`,
        valorDetectado: pesoActual,
        umbral: limiteEfectivo,
        accionSugerida: 'Revisar plan nutricional urgente. No podra competir en esta categoria.',
      });
    } else {
      alertas.push({
        tipo: 'PESO_FUERA_RANGO',
        severidad: 'ALTA',
        titulo: 'Peso sobre categoria',
        mensaje: `Peso actual ${pesoActual}kg, ${sobrepeso.toFixed(1)}kg sobre el limite (tolerancia: ${toleranciaKg}kg).`,
        valorDetectado: pesoActual,
        umbral: limiteEfectivo,
        accionSugerida: 'Ajustar plan nutricional. Monitorear peso semanalmente.',
      });
    }
  }

  // Regla 2: Bajo peso excesivo (sin tolerancia, siempre es alerta)
  if (pesoActual < limites.min - UMBRALES_ALERTA.KG_BAJOPESO_ALERTA) {
    const bajopeso = limites.min - pesoActual;
    alertas.push({
      tipo: 'PESO_FUERA_RANGO',
      severidad: 'ALTA',
      titulo: 'Peso muy bajo',
      mensaje: `Peso actual ${pesoActual}kg, ${bajopeso.toFixed(1)}kg bajo el minimo de la categoria.`,
      valorDetectado: pesoActual,
      umbral: limites.min,
      accionSugerida: 'Riesgo de debilidad. Revisar nutricion y considerar cambio de categoria.',
    });
  }

  return alertas;
}

// Evalua desviacion de carga
// Segun investigacion en ciencias del deporte, las desviaciones positivas (superar)
// y negativas (no alcanzar) tienen significados diferentes:
// - Positiva: Posible adaptacion, considerar aumentar planificacion
// - Negativa: Posible fatiga/problema, investigar causa
export function evaluarDesviacion(
  registro: DatosRegistroParaAlerta,
  sesion: DatosSesionParaAlerta
): AlertaGenerada[] {
  const alertas: AlertaGenerada[] = [];

  // Regla 1: Baja ejecucion de ejercicios (siempre es negativo)
  if (registro.ejerciciosCompletados < UMBRALES_ALERTA.EJERCICIOS_MINIMO) {
    alertas.push({
      tipo: 'BAJO_RENDIMIENTO',
      severidad: 'MEDIA',
      titulo: 'Baja ejecucion de ejercicios',
      mensaje: `Solo se completaron ${registro.ejerciciosCompletados}% de los ejercicios planificados.`,
      valorDetectado: registro.ejerciciosCompletados,
      umbral: UMBRALES_ALERTA.EJERCICIOS_MINIMO,
      accionSugerida: 'Revisar dificultad de la sesion. Investigar causa de baja ejecucion.',
    });
  }

  // Regla 2: Desviacion de intensidad - distinguir positiva vs negativa
  if (sesion.intensidadPlanificada !== null && sesion.intensidadPlanificada > 0) {
    const diferencia = registro.intensidadAlcanzada - sesion.intensidadPlanificada;
    const porcentajeDesviacion = (Math.abs(diferencia) / sesion.intensidadPlanificada) * 100;

    // Solo alertar si la desviacion supera el umbral
    if (porcentajeDesviacion > UMBRALES_ALERTA.DESVIACION_INTENSIDAD) {
      if (diferencia > 0) {
        // DESVIACION POSITIVA: Atleta supero lo planificado
        // Esto puede indicar: buena recuperacion, subestimacion de capacidad, o riesgo de sobreentrenamiento
        alertas.push({
          tipo: 'DESVIACION_CARGA',
          severidad: 'BAJA',
          titulo: 'Intensidad superior a lo planificado',
          mensaje: `Intensidad alcanzada ${registro.intensidadAlcanzada}% supera lo planificado (${sesion.intensidadPlanificada}%) en ${porcentajeDesviacion.toFixed(0)}%.`,
          valorDetectado: registro.intensidadAlcanzada,
          umbral: sesion.intensidadPlanificada,
          accionSugerida:
            'Revisar si el atleta esta bien recuperado. Considerar ajustar planificacion al alza.',
        });
      } else {
        // DESVIACION NEGATIVA: Atleta no alcanzo lo planificado
        // Esto puede indicar: fatiga, lesion, problema tecnico, o sobreestimacion
        alertas.push({
          tipo: 'BAJO_RENDIMIENTO',
          severidad: 'MEDIA',
          titulo: 'Intensidad inferior a lo planificado',
          mensaje: `Intensidad alcanzada ${registro.intensidadAlcanzada}% por debajo de lo planificado (${sesion.intensidadPlanificada}%) en ${porcentajeDesviacion.toFixed(0)}%.`,
          valorDetectado: registro.intensidadAlcanzada,
          umbral: sesion.intensidadPlanificada,
          accionSugerida:
            'Investigar causa: fatiga, lesion o dificultad excesiva. Considerar reducir carga.',
        });
      }
    }
  }

  return alertas;
}

// Funcion principal que analiza todas las alertas
export function analizarAlertas(
  registroActual: DatosRegistroParaAlerta,
  historialRegistros: DatosRegistroParaAlerta[],
  sesion: DatosSesionParaAlerta,
  dolenciasActivas: DatosDolencia[],
  historialDolencias: DatosDolencia[],
  pesoActual: number | null,
  categoriaPeso: CategoriaPeso,
  toleranciaPeso?: DatosTolerancia
): ResultadoAlertas {
  const alertas: AlertaGenerada[] = [];

  // Evaluar fatiga
  const alertasFatiga = evaluarFatiga(registroActual, historialRegistros);
  alertas.push(...alertasFatiga);

  // Evaluar ACWR
  const resultadoACWR = evaluarACWR([registroActual, ...historialRegistros]);
  alertas.push(...resultadoACWR.alertas);

  // Evaluar lesiones
  const alertasLesion = evaluarLesiones(dolenciasActivas, historialDolencias);
  alertas.push(...alertasLesion);

  // Evaluar peso (con tolerancia dinamica si se proporciona)
  const alertasPeso = evaluarPeso(pesoActual, categoriaPeso, toleranciaPeso);
  alertas.push(...alertasPeso);

  // Evaluar desviacion
  const alertasDesviacion = evaluarDesviacion(registroActual, sesion);
  alertas.push(...alertasDesviacion);

  // Ordenar alertas por severidad (CRITICA primero)
  const ordenSeveridad: Record<Severidad, number> = {
    CRITICA: 0,
    ALTA: 1,
    MEDIA: 2,
    BAJA: 3,
  };

  alertas.sort((a, b) => ordenSeveridad[a.severidad] - ordenSeveridad[b.severidad]);

  // Generar resumen
  const conteoSeveridad = {
    CRITICA: alertas.filter((a) => a.severidad === 'CRITICA').length,
    ALTA: alertas.filter((a) => a.severidad === 'ALTA').length,
    MEDIA: alertas.filter((a) => a.severidad === 'MEDIA').length,
    BAJA: alertas.filter((a) => a.severidad === 'BAJA').length,
  };

  let resumen = 'Sin alertas activas.';
  if (alertas.length > 0) {
    const partes: string[] = [];
    if (conteoSeveridad.CRITICA > 0) partes.push(`${conteoSeveridad.CRITICA} critica(s)`);
    if (conteoSeveridad.ALTA > 0) partes.push(`${conteoSeveridad.ALTA} alta(s)`);
    if (conteoSeveridad.MEDIA > 0) partes.push(`${conteoSeveridad.MEDIA} media(s)`);
    if (conteoSeveridad.BAJA > 0) partes.push(`${conteoSeveridad.BAJA} baja(s)`);
    resumen = `${alertas.length} alerta(s): ${partes.join(', ')}.`;
  }

  return {
    hayAlertas: alertas.length > 0,
    alertas,
    acwr: resultadoACWR.acwr,
    resumen,
  };
}
