// Generador de PDF para analisis de rendimiento de atletas
// Usa jsPDF + jspdf-autotable con dynamic import para no afectar el bundle inicial
// IMPORTANTE: Se usa autoTable(doc, opts) como funcion standalone en vez de
// doc.autoTable(opts) porque Turbopack no ejecuta el side-effect que muta el prototipo

import type { AnalisisRendimiento } from '@/features/algoritmo/types/algoritmo.types';
import type { jsPDF } from 'jspdf';

// Tipo para la funcion autoTable standalone
type AutoTableFn = (doc: jsPDF, opts: Record<string, unknown>) => void;

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

// Traduce la tendencia a texto legible, ocultando si la confianza es baja
function traducirTendencia(
  tendencia: string,
  rSquared: number
): string {
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

// Genera el PDF de analisis para UN atleta
function construirPDFAtleta(
  doc: jsPDF,
  autoTable: AutoTableFn,
  analisis: AnalisisRendimiento,
  esPrimeraPagina: boolean
) {
  const anchoPagina = doc.internal.pageSize.getWidth();
  const margenIzq = 14;
  const margenDer = 14;
  const anchoUtil = anchoPagina - margenIzq - margenDer;

  if (!esPrimeraPagina) {
    doc.addPage();
  }

  let y = 20;

  // -- ENCABEZADO --
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

  // Linea separadora
  doc.setLineWidth(0.5);
  doc.line(margenIzq, y, anchoPagina - margenDer, y);
  y += 8;

  // -- SECCION 1: RESUMEN --
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('RESUMEN', margenIzq, y);
  y += 2;

  const resumen = analisis.resumenGeneral;
  const mejorTipo = analisis.rendimientoPorTipo.length > 0
    ? [...analisis.rendimientoPorTipo].sort(
        (a, b) => b.rendimientoPromedio - a.rendimientoPromedio
      )[0]
    : null;
  const peorTipo = analisis.rendimientoPorTipo.length > 0
    ? [...analisis.rendimientoPorTipo].sort(
        (a, b) => a.rendimientoPromedio - b.rendimientoPromedio
      )[0]
    : null;

  const resumenBody = [
    ['Rendimiento Global', `${resumen.rendimientoGlobalPromedio.toFixed(1)} / 10`],
    ['Sesiones Analizadas', `${resumen.totalSesiones} (${resumen.totalRegistros} registros)`],
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
      const alternativas = e.alternativasSugeridas.length > 0
        ? e.alternativasSugeridas.map((a) => a.nombre).join(', ')
        : '-';
      return [
        e.nombre,
        `${e.rendimientoPromedio.toFixed(1)} / 10`,
        completados,
        alternativas,
      ];
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

  // -- SECCION 5: RECOMENDACIONES DEL SISTEMA --
  if (analisis.recomendaciones.length > 0) {
    y = verificarEspacio(doc, y, 30);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(
      `RECOMENDACIONES (${analisis.recomendaciones.length})`,
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

      // Cambios sugeridos
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
      const alternativas = e.alternativasSugeridas.length > 0
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
  }
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

  // Restaurar color de texto
  doc.setTextColor(0, 0, 0);
}

// Genera y descarga el PDF de analisis de UN atleta
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

  construirPDFAtleta(doc, autoTable, analisis, true);
  agregarNumeroPaginas(doc);

  const nombreArchivo = `analisis-${analisis.nombreAtleta.replace(/\s+/g, '-').toLowerCase()}.pdf`;
  doc.save(nombreArchivo);
}

// Genera y descarga el PDF con el analisis de TODOS los atletas
export async function descargarPDFAnalisisGrupal(
  listaAnalisis: AnalisisRendimiento[]
): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const autoTableModule = await import('jspdf-autotable');
  const autoTable = autoTableModule.default as unknown as AutoTableFn;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  for (let i = 0; i < listaAnalisis.length; i++) {
    construirPDFAtleta(doc, autoTable, listaAnalisis[i], i === 0);
  }

  agregarNumeroPaginas(doc);

  const fecha = new Date().toISOString().split('T')[0];
  doc.save(`analisis-grupal-${fecha}.pdf`);
}
