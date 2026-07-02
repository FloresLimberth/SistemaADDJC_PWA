// Generador de PDF para analisis de rendimiento de atletas
// Usa jsPDF + jspdf-autotable con dynamic import para no afectar el bundle inicial
// IMPORTANTE: Se usa autoTable(doc, opts) como funcion standalone en vez de
// doc.autoTable(opts) porque Turbopack no ejecuta el side-effect que muta el prototipo

import type {
  AnalisisRendimiento,
  RankingIndividual,
  Recomendacion,
} from '@/features/algoritmo/types/algoritmo.types';
import type { Dolencia } from '@/features/atleta/types/atleta.types';
import type { jsPDF } from 'jspdf';

// Tipo para la funcion autoTable standalone
type AutoTableFn = (doc: jsPDF, opts: Record<string, unknown>) => void;

// Datos completos por atleta para el reporte grupal
// El botón hace 4 fetches en paralelo y los compone en este shape
// Cualquiera de los campos opcionales puede venir null/[] si el fetch falla o
// si el atleta no tiene datos suficientes (ej. sin tests fisicos = ranking null)
export interface DatosAtletaParaPDFGrupal {
  // Identificacion garantizada (la pasa el componente padre)
  atletaId: string;
  nombreCompleto: string;
  categoriaPeso: string;
  // Datos opcionales (cualquiera puede faltar)
  analisis: AnalisisRendimiento | null;
  ranking: RankingIndividual | null;
  dolenciasActivas: Dolencia[];
  recomendacionesPendientes: Recomendacion[];
}

// Traducciones de codigos internos a texto legible para entrenadores
// Sincronizadas con analisis-dashboard.tsx y tendencia-chart.tsx
const TIPO_LABELS: Record<string, string> = {
  FISICO: 'Preparacion fisica',
  TECNICO_TACHI: 'Tecnica de pie (Tachi-waza)',
  TECNICO_NE: 'Tecnica de suelo (Ne-waza)',
  RESISTENCIA: 'Resistencia',
  VELOCIDAD: 'Velocidad',
};

const INTERPRETACION_LABELS: Record<string, string> = {
  CRITICO_BAJO: 'Muy por debajo de lo habitual',
  ALERTA_BAJA: 'Por debajo de lo habitual',
  NORMAL: 'Normal',
  ALERTA_ALTA: 'Por encima de lo habitual',
  CRITICO_ALTO: 'Muy por encima de lo habitual',
};

const PATRON_LABELS: Record<string, string> = {
  BAJO_RENDIMIENTO_TIPO: 'Bajo rendimiento general',
  EJERCICIO_RECURRENTE_FALLA: 'Ejercicio con fallas repetidas',
  TENDENCIA_NEGATIVA: 'Rendimiento en descenso',
  MEJORA_DETECTADA: 'Mejora detectada',
};

const PRIORIDAD_LABELS: Record<string, string> = {
  CRITICA: 'Critica',
  ALTA: 'Alta',
  MEDIA: 'Media',
  BAJA: 'Baja',
};

// Texto que se muestra en el bloque de aptitud y la hoja resumen
const APTITUD_LABELS: Record<string, string> = {
  COMPETIR: 'APTO',
  RESERVA: 'RESERVA',
  NO_APTO: 'NO APTO',
};

// Color RGB por aptitud (semaforo)
const APTITUD_COLORES: Record<string, [number, number, number]> = {
  COMPETIR: [0, 128, 0],
  RESERVA: [200, 130, 0],
  NO_APTO: [200, 0, 0],
};

const ESTADO_RECOMENDACION_LABELS: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  EN_PROCESO: 'En proceso',
  CUMPLIDA: 'Cumplida',
  RECHAZADA: 'Rechazada',
  MODIFICADA: 'Modificada',
};

const TIPO_RECOMENDACION_LABELS: Record<string, string> = {
  INICIAL: 'Inicial',
  AJUSTE_POST_TEST: 'Ajuste post-test',
  ALERTA_FATIGA: 'Alerta fatiga',
  AJUSTE_LESION: 'Ajuste por lesion',
  ALERTA_DESVIACION_CARGA: 'Desviacion de carga',
  PERSONALIZACION_TACTICA: 'Personalizacion tactica',
  NUTRICIONAL: 'Nutricional',
  AJUSTE_PLANIFICACION: 'Ajuste de planificacion',
};

const TIPO_LESION_LABELS: Record<string, string> = {
  MOLESTIA: 'Molestia',
  DOLOR_AGUDO: 'Dolor agudo',
  LESION_CRONICA: 'Lesion cronica',
  OTRO: 'Otro',
};

const CATEGORIA_PESO_LABELS: Record<string, string> = {
  MENOS_60K: 'Menos de 60 kg',
  MENOS_66K: 'Menos de 66 kg',
  MENOS_73K: 'Menos de 73 kg',
  MENOS_81K: 'Menos de 81 kg',
  MENOS_90K: 'Menos de 90 kg',
  MENOS_100K: 'Menos de 100 kg',
  MAS_100K: 'Mas de 100 kg',
};

// Orden ortodoxo de categorias (de menor a mayor peso)
const CATEGORIA_PESO_ORDER: string[] = [
  'MENOS_60K',
  'MENOS_66K',
  'MENOS_73K',
  'MENOS_81K',
  'MENOS_90K',
  'MENOS_100K',
  'MAS_100K',
];

// Umbral de dolencia grave (sincronizado con backend UMBRALES_ALERTA.NIVEL_DOLOR_ALTO)
// Si cambia en backend, actualizar aqui
const NIVEL_DOLOR_GRAVE = 7;

// Traduce la tendencia a texto legible, ocultando si la confianza es baja
function traducirTendencia(tendencia: string, rSquared: number): string {
  if (rSquared < 0.3) return 'Sin tendencia clara';
  if (tendencia === 'MEJORANDO') return 'Mejorando';
  if (tendencia === 'EMPEORANDO') return 'Empeorando';
  return 'Estable';
}

function formatearFecha(fecha: Date | string): string {
  return new Date(fecha).toLocaleDateString('es-BO');
}

// Obtiene la posicion Y donde termino la ultima tabla generada por autoTable
function obtenerFinalY(doc: jsPDF): number {
  return (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
    .finalY;
}

// Verifica si hay espacio suficiente en la pagina actual
// Si no hay, agrega una nueva pagina y retorna la posicion Y del margen superior
function verificarEspacio(
  doc: jsPDF,
  yActual: number,
  espacioNecesario: number,
  margenInferior: number = 25
): number {
  const alturaPagina = doc.internal.pageSize.getHeight();
  if (yActual + espacioNecesario > alturaPagina - margenInferior) {
    doc.addPage();
    return 20;
  }
  return yActual;
}

// Verifica si el ranking llego con shape completo (puntuacion, score, aptoPara)
// El backend devuelve un shape distinto cuando el atleta no tiene datos suficientes:
// { atleta, posicion: null, mensaje } SIN aptoPara/score/etc.
// fetchRankingAtleta no valida con Zod, asi que en runtime puede no tener aptoPara.
function rankingEsEvaluable(
  ranking: RankingIndividual | null
): ranking is RankingIndividual {
  if (ranking === null) return false;
  const r = ranking as unknown as Record<string, unknown>;
  return (
    'aptoPara' in r &&
    r.aptoPara !== undefined &&
    r.aptoPara !== null &&
    'puntuacion' in r &&
    typeof r.puntuacion === 'number'
  );
}

// Genera un texto compacto que describe las dolencias activas (para hoja resumen)
function dolenciasBadge(dolencias: Dolencia[]): string {
  if (dolencias.length === 0) return 'Ninguna';
  const niveles = dolencias.map((d) => d.nivel);
  const nivelMax = Math.max(...niveles);
  const graves = dolencias.filter((d) => d.nivel >= NIVEL_DOLOR_GRAVE).length;
  if (graves > 0) {
    return `${graves} grave(s) (max ${nivelMax})`;
  }
  if (dolencias.length === 1) {
    return `1 leve (nivel ${nivelMax})`;
  }
  return `${dolencias.length} leves (max ${nivelMax})`;
}

// Acorta la justificacion del ranking para la hoja resumen (1 linea legible)
function justificacionCorta(justificacion: string): string {
  // El backend produce algo como:
  // "Puntuacion total: 45/100. Areas a mejorar: estado, peso. No recomendado para competir..."
  // Tomamos las primeras 2 partes (puntuacion + fortalezas/debilidades)
  const partes = justificacion.split('. ');
  const corta = partes.slice(0, 2).join('. ');
  if (corta.length > 75) return corta.slice(0, 72) + '...';
  return corta;
}

// =====================================================================
// HOJA RESUMEN (primera pagina del PDF grupal)
// Subtablas por categoria de peso, ordenadas por aptitud y puntuacion
// =====================================================================
function construirHojaResumen(
  doc: jsPDF,
  autoTable: AutoTableFn,
  datos: DatosAtletaParaPDFGrupal[]
) {
  const anchoPagina = doc.internal.pageSize.getWidth();
  const margenIzq = 14;
  const margenDer = 14;

  let y = 20;

  // Encabezado de la hoja resumen
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Reporte Grupal de Aptitud Competitiva', margenIzq, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total de atletas: ${datos.length}`, margenIzq, y);
  const fechaGeneracion = new Date().toLocaleDateString('es-BO');
  doc.text(`Generado: ${fechaGeneracion}`, anchoPagina - margenDer, y, {
    align: 'right',
  });
  y += 6;

  doc.setLineWidth(0.5);
  doc.line(margenIzq, y, anchoPagina - margenDer, y);
  y += 8;

  // Agrupar atletas por categoria de peso
  const atletasPorCategoria = new Map<string, DatosAtletaParaPDFGrupal[]>();
  for (const atleta of datos) {
    const lista = atletasPorCategoria.get(atleta.categoriaPeso) || [];
    lista.push(atleta);
    atletasPorCategoria.set(atleta.categoriaPeso, lista);
  }

  // Orden de aptitud para sort dentro de cada subtabla
  const ordenAptitud: Record<string, number> = {
    COMPETIR: 0,
    RESERVA: 1,
    NO_APTO: 2,
  };

  // Recorrer categorias en orden ortodoxo (oculta las vacias)
  for (const categoria of CATEGORIA_PESO_ORDER) {
    const atletas = atletasPorCategoria.get(categoria);
    if (!atletas || atletas.length === 0) continue;

    y = verificarEspacio(doc, y, 30);

    // Titulo de subtabla
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(CATEGORIA_PESO_LABELS[categoria] || categoria, margenIzq, y);
    y += 2;

    // Ordenar: primero por aptitud (COMPETIR, RESERVA, NO_APTO, sin evaluar al final),
    // dentro de cada grupo por puntuacion descendente
    const ordenados = [...atletas].sort((a, b) => {
      const aEval = rankingEsEvaluable(a.ranking);
      const bEval = rankingEsEvaluable(b.ranking);
      if (!aEval && bEval) return 1;
      if (aEval && !bEval) return -1;
      if (!aEval && !bEval) return 0;
      const aApt = ordenAptitud[a.ranking!.aptoPara] ?? 99;
      const bApt = ordenAptitud[b.ranking!.aptoPara] ?? 99;
      if (aApt !== bApt) return aApt - bApt;
      return (b.ranking!.puntuacion || 0) - (a.ranking!.puntuacion || 0);
    });

    const filas = ordenados.map((atleta) => {
      const evaluable = rankingEsEvaluable(atleta.ranking);
      const apt = evaluable ? APTITUD_LABELS[atleta.ranking!.aptoPara] || atleta.ranking!.aptoPara : 'Sin evaluar';
      const score = evaluable ? `${atleta.ranking!.puntuacion.toFixed(0)}/100` : '-';
      const dol = dolenciasBadge(atleta.dolenciasActivas);
      const just = evaluable
        ? justificacionCorta(atleta.ranking!.justificacion)
        : 'Sin tests fisicos registrados';
      return [atleta.nombreCompleto, apt, score, dol, just];
    });

    autoTable(doc, {
      startY: y,
      head: [['Atleta', 'Apto', 'Score', 'Dolencias', 'Justificacion']],
      body: filas,
      theme: 'grid',
      margin: { left: margenIzq, right: margenDer },
      styles: { fontSize: 8, cellPadding: 2.5, overflow: 'linebreak' },
      headStyles: { fillColor: [60, 60, 60], fontStyle: 'bold' },
      columnStyles: {
        1: { cellWidth: 22, halign: 'center' },
        2: { cellWidth: 18, halign: 'center' },
        3: { cellWidth: 28 },
      },
    });

    y = obtenerFinalY(doc) + 10;
  }

  // Atletas con categoria desconocida (caso defensivo, no deberia pasar)
  const sinCategoriaConocida = datos.filter(
    (a) => !CATEGORIA_PESO_ORDER.includes(a.categoriaPeso)
  );
  if (sinCategoriaConocida.length > 0) {
    y = verificarEspacio(doc, y, 30);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Atletas con categoria sin clasificar', margenIzq, y);
    y += 2;

    const filas = sinCategoriaConocida.map((atleta) => [
      atleta.nombreCompleto,
      'Sin evaluar',
      '-',
      dolenciasBadge(atleta.dolenciasActivas),
      'Categoria de peso no reconocida',
    ]);

    autoTable(doc, {
      startY: y,
      head: [['Atleta', 'Apto', 'Score', 'Dolencias', 'Justificacion']],
      body: filas,
      theme: 'grid',
      margin: { left: margenIzq, right: margenDer },
      styles: { fontSize: 8, cellPadding: 2.5, overflow: 'linebreak' },
      headStyles: { fillColor: [60, 60, 60], fontStyle: 'bold' },
    });
  }
}

// =====================================================================
// BLOQUE: Aptitud competitiva (al inicio de cada pagina de atleta)
// =====================================================================
function construirBloqueAptitud(
  doc: jsPDF,
  ranking: RankingIndividual | null,
  yInicial: number,
  margenIzq: number,
  margenDer: number,
  anchoUtil: number
): number {
  let y = yInicial;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('APTITUD COMPETITIVA', margenIzq, y);
  y += 6;

  if (!rankingEsEvaluable(ranking)) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text(
      'Este atleta no tiene tests fisicos registrados. No se puede evaluar aptitud.',
      margenIzq,
      y
    );
    return y + 8;
  }

  // Texto de aptitud con color de semaforo
  const apt = ranking.aptoPara;
  const aptText = APTITUD_LABELS[apt] || apt;
  const [r, g, b] = APTITUD_COLORES[apt] || [0, 0, 0];

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(r, g, b);
  doc.text(aptText, margenIzq, y);
  doc.setTextColor(0, 0, 0);

  // Score y posicion (la posicion se oculta si es el unico atleta de su categoria)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  let textoExtra = `Score: ${ranking.puntuacion.toFixed(0)}/100`;
  if (
    ranking.totalEnCategoria > 1 &&
    ranking.posicion !== null &&
    ranking.posicion !== undefined
  ) {
    textoExtra += `   |   Posicion: ${ranking.posicion} de ${ranking.totalEnCategoria}`;
  }
  doc.text(textoExtra, margenIzq + 45, y);
  y += 8;

  // Justificacion completa (texto largo, posiblemente multilinea)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Justificacion:', margenIzq, y);
  y += 4;
  doc.setFont('helvetica', 'normal');
  const lineasJust = doc.splitTextToSize(ranking.justificacion, anchoUtil);
  doc.text(lineasJust, margenIzq, y);
  y += lineasJust.length * 3.8 + 2;

  // Alertas (si las hay)
  if (ranking.alertas && ranking.alertas.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('Alertas:', margenIzq, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    for (const alerta of ranking.alertas) {
      const lineas = doc.splitTextToSize(`- ${alerta}`, anchoUtil - 4);
      doc.text(lineas, margenIzq + 4, y);
      y += lineas.length * 3.8;
    }
  }

  return y + 4;
}

// =====================================================================
// BLOQUE: Dolencias activas
// =====================================================================
function construirBloqueDolencias(
  doc: jsPDF,
  autoTable: AutoTableFn,
  dolencias: Dolencia[],
  yInicial: number,
  margenIzq: number,
  margenDer: number
): number {
  const y = verificarEspacio(doc, yInicial, 25);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(`DOLENCIAS ACTIVAS (${dolencias.length})`, margenIzq, y);
  let yLocal = y + 4;

  if (dolencias.length === 0) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('Sin dolencias activas registradas.', margenIzq, yLocal);
    return yLocal + 6;
  }

  // Ordenar por nivel desc (las mas graves primero)
  const ordenadas = [...dolencias].sort((a, b) => b.nivel - a.nivel);

  const filas = ordenadas.map((d) => [
    d.zona,
    `${d.nivel}/10`,
    d.tipoLesion ? TIPO_LESION_LABELS[d.tipoLesion] || d.tipoLesion : '-',
    d.descripcion || '-',
  ]);

  autoTable(doc, {
    startY: yLocal,
    head: [['Zona', 'Nivel', 'Tipo', 'Descripcion']],
    body: filas,
    theme: 'grid',
    margin: { left: margenIzq, right: margenDer },
    styles: { fontSize: 8, cellPadding: 2.5, overflow: 'linebreak' },
    headStyles: {
      fillColor: [180, 60, 60],
      fontStyle: 'bold',
      textColor: [255, 255, 255],
    },
    columnStyles: {
      1: { halign: 'center', cellWidth: 18 },
      2: { cellWidth: 35 },
    },
  });

  return obtenerFinalY(doc) + 8;
}

// =====================================================================
// BLOQUE: Recomendaciones pendientes de revision (Tipo B - persistidas)
// =====================================================================
function construirBloqueRecomendacionesPendientes(
  doc: jsPDF,
  autoTable: AutoTableFn,
  recomendaciones: Recomendacion[],
  yInicial: number,
  margenIzq: number,
  margenDer: number
): number {
  const y = verificarEspacio(doc, yInicial, 25);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(
    `RECOMENDACIONES PENDIENTES DE REVISION (${recomendaciones.length})`,
    margenIzq,
    y
  );
  let yLocal = y + 4;

  if (recomendaciones.length === 0) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('Sin recomendaciones pendientes.', margenIzq, yLocal);
    return yLocal + 6;
  }

  // Ordenar por prioridad (CRITICA > ALTA > MEDIA > BAJA), luego por fecha asc
  const ordenPrio: Record<string, number> = {
    CRITICA: 0,
    ALTA: 1,
    MEDIA: 2,
    BAJA: 3,
  };
  const ordenadas = [...recomendaciones].sort((a, b) => {
    const diff = (ordenPrio[a.prioridad] ?? 99) - (ordenPrio[b.prioridad] ?? 99);
    if (diff !== 0) return diff;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  const filas = ordenadas.map((r) => [
    PRIORIDAD_LABELS[r.prioridad] || r.prioridad,
    ESTADO_RECOMENDACION_LABELS[r.estado] || r.estado,
    formatearFecha(r.createdAt),
    TIPO_RECOMENDACION_LABELS[r.tipo] || r.tipo,
    r.titulo,
  ]);

  autoTable(doc, {
    startY: yLocal,
    head: [['Prioridad', 'Estado', 'Fecha', 'Tipo', 'Titulo']],
    body: filas,
    theme: 'grid',
    margin: { left: margenIzq, right: margenDer },
    styles: { fontSize: 8, cellPadding: 2.5, overflow: 'linebreak' },
    headStyles: { fillColor: [60, 60, 60], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 20, halign: 'center' },
      1: { cellWidth: 22 },
      2: { cellWidth: 22 },
      3: { cellWidth: 35 },
    },
  });

  return obtenerFinalY(doc) + 8;
}

// =====================================================================
// SECCIONES ORIGINALES (las que el PDF ya tenia)
// Renombramos "RECOMENDACIONES" a "SUGERENCIAS DEL ANALISIS" para distinguir
// de las "RECOMENDACIONES PENDIENTES DE REVISION" del bloque nuevo
// =====================================================================
function construirSeccionesAnalisis(
  doc: jsPDF,
  autoTable: AutoTableFn,
  analisis: AnalisisRendimiento,
  yInicial: number,
  margenIzq: number,
  margenDer: number,
  anchoUtil: number
): number {
  let y = yInicial;

  // -- SECCION 1: RESUMEN --
  y = verificarEspacio(doc, y, 30);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('RESUMEN', margenIzq, y);
  y += 2;

  const resumen = analisis.resumenGeneral;
  const mejorTipo =
    analisis.rendimientoPorTipo.length > 0
      ? [...analisis.rendimientoPorTipo].sort(
          (a, b) => b.rendimientoPromedio - a.rendimientoPromedio
        )[0]
      : null;
  const peorTipo =
    analisis.rendimientoPorTipo.length > 0
      ? [...analisis.rendimientoPorTipo].sort(
          (a, b) => a.rendimientoPromedio - b.rendimientoPromedio
        )[0]
      : null;

  const resumenBody: string[][] = [
    ['Rendimiento Global', `${resumen.rendimientoGlobalPromedio.toFixed(1)} / 10`],
    [
      'Sesiones Analizadas',
      `${resumen.totalSesiones} (${resumen.totalRegistros} registros)`,
    ],
  ];

  if (mejorTipo) {
    resumenBody.push([
      'Area Mas Fuerte',
      `${TIPO_LABELS[mejorTipo.tipo] || mejorTipo.tipo} (${mejorTipo.rendimientoPromedio.toFixed(1)}/10)`,
    ]);
  }
  if (peorTipo) {
    resumenBody.push([
      'Area Critica',
      `${TIPO_LABELS[peorTipo.tipo] || peorTipo.tipo} (${peorTipo.rendimientoPromedio.toFixed(1)}/10)`,
    ]);
  }

  autoTable(doc, {
    startY: y,
    head: [['Indicador', 'Valor']],
    body: resumenBody,
    theme: 'grid',
    margin: { left: margenIzq, right: margenDer },
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [60, 60, 60], fontStyle: 'bold' },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: anchoUtil * 0.4 },
    },
  });

  y = obtenerFinalY(doc) + 10;

  // -- SECCION 2: PROBLEMAS DETECTADOS --
  if (analisis.patrones.length > 0) {
    y = verificarEspacio(doc, y, 30);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`PROBLEMAS DETECTADOS (${analisis.patrones.length})`, margenIzq, y);
    y += 2;

    const patronesBody = analisis.patrones.map((p) => [
      PRIORIDAD_LABELS[p.severidad] || p.severidad,
      PATRON_LABELS[p.tipo] || p.tipo,
      p.descripcion,
      p.ejercicioAfectado?.nombre || '-',
    ]);

    autoTable(doc, {
      startY: y,
      head: [['Severidad', 'Tipo', 'Descripcion', 'Ejercicio']],
      body: patronesBody,
      theme: 'grid',
      margin: { left: margenIzq, right: margenDer },
      styles: { fontSize: 8, cellPadding: 2.5, overflow: 'linebreak' },
      headStyles: { fillColor: [60, 60, 60], fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 22, halign: 'center' },
        1: { cellWidth: 45 },
        2: { cellWidth: anchoUtil - 22 - 45 - 35 },
        3: { cellWidth: 35 },
      },
    });

    y = obtenerFinalY(doc) + 10;
  }

  // -- SECCION 3: RENDIMIENTO POR AREA --
  if (analisis.rendimientoPorTipo.length > 0) {
    y = verificarEspacio(doc, y, 30);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('RENDIMIENTO POR AREA', margenIzq, y);
    y += 2;

    const rendimientoBody = analisis.rendimientoPorTipo.map((r) => [
      TIPO_LABELS[r.tipo] || r.tipo,
      `${r.rendimientoPromedio.toFixed(1)} / 10`,
      INTERPRETACION_LABELS[r.zScore.interpretacion] || r.zScore.interpretacion,
      traducirTendencia(r.tendencia.tendencia, r.tendencia.rSquared),
      `${r.cantidadRegistros}`,
    ]);

    autoTable(doc, {
      startY: y,
      head: [['Area', 'Rendimiento', 'Estado', 'Tendencia', 'Registros']],
      body: rendimientoBody,
      theme: 'grid',
      margin: { left: margenIzq, right: margenDer },
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: [60, 60, 60], fontStyle: 'bold' },
      columnStyles: {
        1: { halign: 'center', cellWidth: 25 },
        3: { cellWidth: 35 },
        4: { halign: 'center', cellWidth: 20 },
      },
    });

    y = obtenerFinalY(doc) + 10;
  }

  // -- SECCION 4: EJERCICIOS CON DIFICULTAD (por area) --
  for (const tipo of analisis.rendimientoPorTipo) {
    if (tipo.ejerciciosProblematicos.length === 0) continue;

    y = verificarEspacio(doc, y, 25);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(
      `Ejercicios con dificultad - ${TIPO_LABELS[tipo.tipo] || tipo.tipo}`,
      margenIzq,
      y
    );
    y += 2;

    const ejerciciosBody = tipo.ejerciciosProblematicos.map((e) => {
      const completados = `${e.vecesCompletado} de ${e.vecesAsignado}`;
      const alternativas =
        e.alternativasSugeridas.length > 0
          ? e.alternativasSugeridas.map((a) => a.nombre).join(', ')
          : '-';
      return [e.nombre, `${e.rendimientoPromedio.toFixed(1)} / 10`, completados, alternativas];
    });

    autoTable(doc, {
      startY: y,
      head: [['Ejercicio', 'Rendimiento', 'Completados', 'Alternativas sugeridas']],
      body: ejerciciosBody,
      theme: 'grid',
      margin: { left: margenIzq, right: margenDer },
      styles: { fontSize: 8, cellPadding: 2.5, overflow: 'linebreak' },
      headStyles: { fillColor: [80, 80, 80], fontStyle: 'bold' },
      columnStyles: {
        1: { halign: 'center', cellWidth: 25 },
        2: { halign: 'center', cellWidth: 25 },
      },
    });

    y = obtenerFinalY(doc) + 8;
  }

  // -- SECCION 5: SUGERENCIAS DEL ANALISIS (renombrado de "RECOMENDACIONES")
  // Son sugerencias derivadas de patrones de rendimiento (Tipo A - runtime)
  // Se diferencian del bloque "RECOMENDACIONES PENDIENTES DE REVISION" (Tipo B - persistidas)
  if (analisis.recomendaciones.length > 0) {
    y = verificarEspacio(doc, y, 30);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(
      `SUGERENCIAS DEL ANALISIS (${analisis.recomendaciones.length})`,
      margenIzq,
      y
    );
    y += 6;

    for (const rec of analisis.recomendaciones) {
      y = verificarEspacio(doc, y, 35);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      const prioridadTexto = PRIORIDAD_LABELS[rec.prioridad] || rec.prioridad;
      doc.text(`[Prioridad ${prioridadTexto}] ${rec.titulo}`, margenIzq, y);
      y += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);

      const lineasMensaje = doc.splitTextToSize(rec.mensaje, anchoUtil);
      doc.text(lineasMensaje, margenIzq, y);
      y += lineasMensaje.length * 3.5 + 2;

      if (rec.accionSugerida) {
        y = verificarEspacio(doc, y, 10);
        doc.setFont('helvetica', 'italic');
        const lineasAccion = doc.splitTextToSize(
          `Accion sugerida: ${rec.accionSugerida}`,
          anchoUtil
        );
        doc.text(lineasAccion, margenIzq, y);
        y += lineasAccion.length * 3.5 + 2;
        doc.setFont('helvetica', 'normal');
      }

      const cambios = rec.cambiosSugeridos;
      if (cambios.reducir.length > 0) {
        y = verificarEspacio(doc, y, 5);
        doc.text(
          `  Reducir: ${cambios.reducir.map((c) => c.nombre).join(', ')}`,
          margenIzq,
          y
        );
        y += 4;
      }
      if (cambios.agregar.length > 0) {
        y = verificarEspacio(doc, y, 5);
        doc.text(
          `  Agregar: ${cambios.agregar.map((c) => c.nombre).join(', ')}`,
          margenIzq,
          y
        );
        y += 4;
      }
      if (cambios.modificar.length > 0) {
        y = verificarEspacio(doc, y, 5);
        doc.text(
          `  Modificar: ${cambios.modificar.map((c) => c.cambio).join(', ')}`,
          margenIzq,
          y
        );
        y += 4;
      }

      y += 4;
    }
  }

  // -- SECCION 6: EJERCICIOS QUE NECESITAN ATENCION (lista global) --
  if (analisis.ejerciciosProblematicos.length > 0) {
    y = verificarEspacio(doc, y, 25);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(
      `EJERCICIOS QUE NECESITAN ATENCION (${analisis.ejerciciosProblematicos.length})`,
      margenIzq,
      y
    );
    y += 2;

    const globalBody = analisis.ejerciciosProblematicos.map((e) => {
      const alternativas =
        e.alternativasSugeridas.length > 0
          ? e.alternativasSugeridas.map((a) => a.nombre).join(', ')
          : '-';
      return [
        e.nombre,
        TIPO_LABELS[e.tipo] || e.tipo,
        `${e.rendimientoPromedio.toFixed(1)} / 10`,
        `${e.vecesCompletado} de ${e.vecesAsignado}`,
        alternativas,
      ];
    });

    autoTable(doc, {
      startY: y,
      head: [['Ejercicio', 'Area', 'Rendimiento', 'Completados', 'Alternativas']],
      body: globalBody,
      theme: 'grid',
      margin: { left: margenIzq, right: margenDer },
      styles: { fontSize: 8, cellPadding: 2.5, overflow: 'linebreak' },
      headStyles: { fillColor: [60, 60, 60], fontStyle: 'bold' },
      columnStyles: {
        2: { halign: 'center', cellWidth: 22 },
        3: { halign: 'center', cellWidth: 25 },
      },
    });

    y = obtenerFinalY(doc) + 8;
  }

  return y;
}

// =====================================================================
// PAGINA POR ATLETA EN EL PDF GRUPAL
// Bloques nuevos al inicio + secciones del analisis (si hay)
// =====================================================================
function construirPaginaAtletaGrupal(
  doc: jsPDF,
  autoTable: AutoTableFn,
  datos: DatosAtletaParaPDFGrupal
) {
  const anchoPagina = doc.internal.pageSize.getWidth();
  const margenIzq = 14;
  const margenDer = 14;
  const anchoUtil = anchoPagina - margenIzq - margenDer;

  // Siempre nueva pagina (la primera del grupal es la hoja resumen)
  doc.addPage();

  let y = 20;

  // Encabezado
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Analisis de Rendimiento', margenIzq, y);
  y += 8;

  doc.setFontSize(12);
  doc.text(datos.nombreCompleto, margenIzq, y);
  y += 6;

  // Categoria de peso (siempre disponible) y periodo (si hay analisis)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const catLabel = CATEGORIA_PESO_LABELS[datos.categoriaPeso] || datos.categoriaPeso;
  let lineaInfo = `Categoria: ${catLabel}`;
  if (datos.analisis) {
    const desde = formatearFecha(datos.analisis.periodoAnalisis.desde);
    const hasta = formatearFecha(datos.analisis.periodoAnalisis.hasta);
    lineaInfo += `   |   Periodo: ${desde} - ${hasta} (${datos.analisis.periodoAnalisis.diasAnalizados} dias)`;
  }
  doc.text(lineaInfo, margenIzq, y);
  const fechaGeneracion = new Date().toLocaleDateString('es-BO');
  doc.text(`Generado: ${fechaGeneracion}`, anchoPagina - margenDer, y, {
    align: 'right',
  });
  y += 5;

  if (datos.analisis?.requiereAtencion) {
    doc.setFont('helvetica', 'bold');
    doc.text('*** REQUIERE ATENCION ***', margenIzq, y);
    doc.setFont('helvetica', 'normal');
    y += 5;
  }

  doc.setLineWidth(0.5);
  doc.line(margenIzq, y, anchoPagina - margenDer, y);
  y += 6;

  // === BLOQUES NUEVOS (al inicio de cada pagina de atleta) ===
  y = construirBloqueAptitud(doc, datos.ranking, y, margenIzq, margenDer, anchoUtil);
  y = construirBloqueDolencias(doc, autoTable, datos.dolenciasActivas, y, margenIzq, margenDer);
  y = construirBloqueRecomendacionesPendientes(
    doc,
    autoTable,
    datos.recomendacionesPendientes,
    y,
    margenIzq,
    margenDer
  );

  // === SECCIONES ORIGINALES (solo si hay analisis disponible) ===
  if (datos.analisis) {
    construirSeccionesAnalisis(
      doc,
      autoTable,
      datos.analisis,
      y,
      margenIzq,
      margenDer,
      anchoUtil
    );
  } else {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text(
      'No fue posible obtener el analisis de rendimiento de este atleta.',
      margenIzq,
      y
    );
  }
}

// =====================================================================
// PAGINA INDIVIDUAL (descarga desde la pagina de detalle del atleta)
// La revisora dijo que el individual "esta bien" tal cual, asi que NO
// agregamos los bloques nuevos aqui. Solo se beneficia del rename
// "RECOMENDACIONES" -> "SUGERENCIAS DEL ANALISIS"
// =====================================================================
function construirPaginaAtletaIndividual(
  doc: jsPDF,
  autoTable: AutoTableFn,
  analisis: AnalisisRendimiento
) {
  const anchoPagina = doc.internal.pageSize.getWidth();
  const margenIzq = 14;
  const margenDer = 14;
  const anchoUtil = anchoPagina - margenIzq - margenDer;

  let y = 20;

  // Encabezado
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Analisis de Rendimiento', margenIzq, y);
  y += 8;

  doc.setFontSize(12);
  doc.text(analisis.nombreAtleta, margenIzq, y);
  y += 6;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const desde = formatearFecha(analisis.periodoAnalisis.desde);
  const hasta = formatearFecha(analisis.periodoAnalisis.hasta);
  doc.text(
    `Periodo: ${desde} - ${hasta} (${analisis.periodoAnalisis.diasAnalizados} dias)`,
    margenIzq,
    y
  );

  const fechaGeneracion = new Date().toLocaleDateString('es-BO');
  doc.text(`Generado: ${fechaGeneracion}`, anchoPagina - margenDer, y, {
    align: 'right',
  });
  y += 5;

  if (analisis.requiereAtencion) {
    doc.setFont('helvetica', 'bold');
    doc.text('*** REQUIERE ATENCION ***', margenIzq, y);
    doc.setFont('helvetica', 'normal');
    y += 5;
  }

  doc.setLineWidth(0.5);
  doc.line(margenIzq, y, anchoPagina - margenDer, y);
  y += 8;

  // Mismas secciones que el grupal usa, pero sin los bloques nuevos
  construirSeccionesAnalisis(
    doc,
    autoTable,
    analisis,
    y,
    margenIzq,
    margenDer,
    anchoUtil
  );
}

// Agrega numero de pagina en el pie de cada pagina (post-procesamiento)
function agregarNumeroPaginas(doc: jsPDF) {
  const totalPaginas = doc.getNumberOfPages();
  const anchoPagina = doc.internal.pageSize.getWidth();
  const altoPagina = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Pagina ${i} de ${totalPaginas}`,
      anchoPagina / 2,
      altoPagina - 10,
      { align: 'center' }
    );
  }

  doc.setTextColor(0, 0, 0);
}

// =====================================================================
// API PUBLICA
// =====================================================================

// Genera y descarga el PDF de analisis de UN atleta (sin bloques nuevos)
// Firma SIN cambios - usado por descargar-pdf-analisis-btn.tsx
export async function descargarPDFAnalisis(
  analisis: AnalisisRendimiento
): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const autoTableModule = await import('jspdf-autotable');
  const autoTable = autoTableModule.default as unknown as AutoTableFn;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  construirPaginaAtletaIndividual(doc, autoTable, analisis);
  agregarNumeroPaginas(doc);

  const nombreArchivo = `analisis-${analisis.nombreAtleta.replace(/\s+/g, '-').toLowerCase()}.pdf`;
  doc.save(nombreArchivo);
}

// Genera y descarga el PDF grupal con hoja resumen + detalle por atleta
// FIRMA NUEVA - el botón ahora arma el shape DatosAtletaParaPDFGrupal
export async function descargarPDFAnalisisGrupal(
  datos: DatosAtletaParaPDFGrupal[]
): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const autoTableModule = await import('jspdf-autotable');
  const autoTable = autoTableModule.default as unknown as AutoTableFn;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Pagina 1: hoja resumen agrupada por categoria de peso
  construirHojaResumen(doc, autoTable, datos);

  // Paginas siguientes: una por atleta (con bloques nuevos al inicio)
  for (const d of datos) {
    construirPaginaAtletaGrupal(doc, autoTable, d);
  }

  agregarNumeroPaginas(doc);

  const fecha = new Date().toISOString().split('T')[0];
  doc.save(`analisis-grupal-${fecha}.pdf`);
}
