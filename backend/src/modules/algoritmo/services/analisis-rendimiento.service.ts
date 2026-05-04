// Servicio de Analisis de Rendimiento por Ejercicio
// Integra Z-Score, tendencias, y deteccion de patrones
// Analiza el rendimiento de atletas por tipo de ejercicio (FISICO, TECNICO_TACHI, etc.)
// Fuente: docs/algoritmo_10_especificacion_funcional.md

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { TipoEjercicio } from '@prisma/client';
import { calcularZScore, ResultadoZScore, calcularMedia } from '../calculators/zscore.calculator';
import {
  calcularTendencia,
  ResultadoTendencia,
  PuntoTemporal,
} from '../calculators/tendencia.calculator';

// Configuracion de umbrales y ventanas temporales
export const CONFIGURACION_ANALISIS = {
  // Ventanas temporales
  DIAS_ANALISIS_DEFAULT: 30,
  DIAS_HISTORICO_ZSCORE: 28,
  DIAS_TENDENCIA: 14,

  // Umbrales de rendimiento (escala 1-10)
  RENDIMIENTO_BAJO: 5,
  RENDIMIENTO_MUY_BAJO: 3,

  // Umbrales de deteccion
  MINIMO_ASIGNACIONES_PARA_PROBLEMA: 3,
  MINIMO_NO_COMPLETADOS_PARA_ALERTA: 2,
  MINIMO_REGISTROS_ANALISIS: 3, // Unificado con MINIMO_ASIGNACIONES_PARA_PROBLEMA

  // Limites de salida
  MAX_EJERCICIOS_PROBLEMATICOS: 10,
  MAX_ALTERNATIVAS_POR_EJERCICIO: 3,
} as const;

// Datos de rendimiento con contexto del ejercicio y sesion
interface RendimientoConContexto {
  rendimientoId: bigint;
  ejercicioId: bigint;
  ejercicioNombre: string;
  ejercicioTipo: TipoEjercicio;
  ejercicioNivel: number;
  sesionId: bigint;
  fechaSesion: Date;
  fechaRegistro: Date;
  completado: boolean;
  rendimiento: number | null;
  dificultadPercibida: number | null;
}

// Datos de dolencia activa precargada
interface DolenciaActiva {
  zona: string;
  tipoLesion: string | null;
}

// Alternativa sugerida para un ejercicio problematico
export interface AlternativaSugerida {
  ejercicioId: bigint;
  nombre: string;
  nivelDificultad: number;
  razon: string;
}

// Ejercicio identificado como problematico
export interface EjercicioProblematico {
  ejercicioId: bigint;
  nombre: string;
  tipo: TipoEjercicio;
  rendimientoPromedio: number;
  vecesAsignado: number;
  vecesCompletado: number;
  vecesNoCompletado: number;
  zScore: number | null;
  tendencia: 'MEJORANDO' | 'ESTABLE' | 'EMPEORANDO' | null;
  alternativasSugeridas: AlternativaSugerida[];
}

// Rendimiento agrupado por tipo de ejercicio
export interface RendimientoPorTipo {
  tipo: TipoEjercicio;
  rendimientoPromedio: number;
  cantidadRegistros: number;
  zScore: ResultadoZScore;
  tendencia: ResultadoTendencia;
  ejerciciosProblematicos: EjercicioProblematico[];
  // Alternativas sugeridas para el tipo completo (cuando no hay ejercicios problematicos especificos)
  alternativasSugeridasDelTipo: AlternativaSugerida[];
}

// Patron detectado en el rendimiento
export interface PatronDetectado {
  tipo:
    | 'BAJO_RENDIMIENTO_TIPO'
    | 'EJERCICIO_RECURRENTE_FALLA'
    | 'TENDENCIA_NEGATIVA'
    | 'MEJORA_DETECTADA';
  severidad: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
  descripcion: string;
  tipoEjercicioAfectado?: TipoEjercicio;
  ejercicioAfectado?: { id: bigint; nombre: string };
  datos: Record<string, unknown>;
}

// Resultado completo del analisis de rendimiento
export interface AnalisisRendimientoAtleta {
  atletaId: bigint;
  nombreAtleta: string;
  periodoAnalisis: {
    desde: Date;
    hasta: Date;
    diasAnalizados: number;
  };
  resumenGeneral: {
    totalSesiones: number;
    totalRegistros: number;
    rendimientoGlobalPromedio: number;
  };
  rendimientoPorTipo: RendimientoPorTipo[];
  ejerciciosProblematicos: EjercicioProblematico[];
  patrones: PatronDetectado[];
  requiereAtencion: boolean;
  prioridadAtencion: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
}

@Injectable()
export class AnalisisRendimientoService {
  constructor(private readonly prisma: PrismaService) {}

  // Analiza el rendimiento completo de un atleta en un periodo
  async analizarRendimientoAtleta(
    atletaId: bigint,
    diasAtras: number = CONFIGURACION_ANALISIS.DIAS_ANALISIS_DEFAULT
  ): Promise<AnalisisRendimientoAtleta> {
    // 1. Obtener datos del atleta
    const atleta = await this.prisma.atleta.findUnique({
      where: { id: atletaId },
      include: { usuario: { select: { nombreCompleto: true } } },
    });

    if (!atleta) {
      throw new Error(`Atleta ${atletaId} no encontrado`);
    }

    // 2. Definir periodo de analisis
    const hasta = new Date();
    const desde = new Date();
    desde.setDate(desde.getDate() - diasAtras);

    // 3. Obtener registros de rendimiento por ejercicio
    const rendimientos = await this.obtenerRendimientosPorEjercicio(atletaId, desde, hasta);

    // 4. Si no hay datos suficientes, retornar analisis vacio
    if (rendimientos.length < CONFIGURACION_ANALISIS.MINIMO_REGISTROS_ANALISIS) {
      return this.crearAnalisisVacio(
        atletaId,
        atleta,
        desde,
        hasta,
        diasAtras,
        rendimientos.length
      );
    }

    // 5. Preconsultar dolencias activas UNA sola vez para reutilizar
    const dolenciasActivas = await this.prisma.dolencia.findMany({
      where: {
        recuperado: false,
        registroPostEntrenamiento: { atletaId },
      },
      select: { zona: true, tipoLesion: true },
    });

    // 6. Agrupar por tipo de ejercicio
    const porTipo = this.agruparPorTipoEjercicio(rendimientos);

    // 7. Calcular metricas por tipo (pasando dolencias precargadas)
    const rendimientoPorTipo = await this.calcularMetricasPorTipo(
      porTipo,
      atletaId,
      dolenciasActivas
    );

    // 8. Identificar ejercicios problematicos (pasando dolencias precargadas)
    const ejerciciosProblematicos = await this.identificarEjerciciosProblematicos(
      rendimientos,
      dolenciasActivas
    );

    // 9. Detectar patrones
    const patrones = this.detectarPatrones(rendimientoPorTipo, ejerciciosProblematicos);

    // 10. Determinar si requiere atencion
    const { requiereAtencion, prioridadAtencion } = this.evaluarAtencion(patrones);

    return {
      atletaId,
      nombreAtleta: atleta.usuario.nombreCompleto,
      periodoAnalisis: {
        desde,
        hasta,
        diasAnalizados: diasAtras,
      },
      resumenGeneral: {
        totalSesiones: new Set(rendimientos.map((r) => r.sesionId.toString())).size,
        totalRegistros: rendimientos.length,
        rendimientoGlobalPromedio: this.calcularPromedioGlobal(rendimientos),
      },
      rendimientoPorTipo,
      ejerciciosProblematicos,
      patrones,
      requiereAtencion,
      prioridadAtencion,
    };
  }

  // Obtiene los rendimientos por ejercicio de un atleta en un periodo
  private async obtenerRendimientosPorEjercicio(
    atletaId: bigint,
    desde: Date,
    hasta: Date
  ): Promise<RendimientoConContexto[]> {
    // Usamos fechaSesion (fecha real del entrenamiento) en lugar de fechaRegistro
    // (cuando el entrenador capturo los datos) para analisis temporal correcto
    const registros = await this.prisma.rendimientoEjercicio.findMany({
      where: {
        registro: { atletaId },
        ejercicioSesion: {
          sesion: {
            fecha: { gte: desde, lte: hasta },
          },
        },
      },
      include: {
        ejercicioSesion: {
          include: {
            ejercicio: {
              select: {
                id: true,
                nombre: true,
                tipo: true,
                nivelDificultad: true,
              },
            },
            sesion: {
              select: { id: true, fecha: true },
            },
          },
        },
        registro: {
          select: { fechaRegistro: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return registros.map((r) => ({
      rendimientoId: r.id,
      ejercicioId: r.ejercicioSesion.ejercicio.id,
      ejercicioNombre: r.ejercicioSesion.ejercicio.nombre,
      ejercicioTipo: r.ejercicioSesion.ejercicio.tipo,
      ejercicioNivel: r.ejercicioSesion.ejercicio.nivelDificultad || 1,
      sesionId: r.ejercicioSesion.sesion.id,
      fechaSesion: r.ejercicioSesion.sesion.fecha,
      fechaRegistro: r.registro.fechaRegistro,
      completado: r.completado,
      rendimiento: r.rendimiento,
      dificultadPercibida: r.dificultadPercibida,
    }));
  }

  // Agrupa los rendimientos por tipo de ejercicio
  private agruparPorTipoEjercicio(
    rendimientos: RendimientoConContexto[]
  ): Map<TipoEjercicio, RendimientoConContexto[]> {
    const grupos = new Map<TipoEjercicio, RendimientoConContexto[]>();

    for (const r of rendimientos) {
      const existente = grupos.get(r.ejercicioTipo) || [];
      existente.push(r);
      grupos.set(r.ejercicioTipo, existente);
    }

    return grupos;
  }

  // Calcula metricas (Z-Score, tendencia) por cada tipo de ejercicio
  private async calcularMetricasPorTipo(
    porTipo: Map<TipoEjercicio, RendimientoConContexto[]>,
    atletaId: bigint,
    dolenciasActivas: DolenciaActiva[]
  ): Promise<RendimientoPorTipo[]> {
    const resultado: RendimientoPorTipo[] = [];

    for (const [tipo, registros] of porTipo) {
      // Filtrar solo registros con rendimiento valido
      const conRendimiento = registros.filter((r) => r.rendimiento !== null);

      if (conRendimiento.length === 0) {
        continue;
      }

      // Calcular promedio actual
      const valores = conRendimiento.map((r) => r.rendimiento as number);
      const rendimientoPromedio = Math.round(calcularMedia(valores) * 100) / 100;

      // Obtener historico para Z-Score (ultimos 28 dias adicionales)
      const historico = await this.obtenerHistoricoZScore(atletaId, tipo);

      // Calcular Z-Score
      const zScore = calcularZScore(rendimientoPromedio, historico);

      // Preparar puntos temporales para tendencia (usando fecha de la sesion)
      const puntosTendencia: PuntoTemporal[] = conRendimiento.map((r) => ({
        fecha: new Date(r.fechaSesion),
        valor: r.rendimiento as number,
      }));

      // Calcular tendencia
      const tendencia = calcularTendencia(puntosTendencia);

      // Identificar ejercicios problematicos de este tipo (reutilizando dolencias)
      const ejerciciosProblematicos = await this.identificarEjerciciosProblematicosEnTipo(
        registros,
        dolenciasActivas
      );

      // Buscar alternativas a nivel de tipo (reutilizando dolencias)
      const alternativasSugeridasDelTipo = await this.buscarAlternativasPorTipo(
        tipo,
        dolenciasActivas,
        atletaId
      );

      resultado.push({
        tipo,
        rendimientoPromedio,
        cantidadRegistros: conRendimiento.length,
        zScore,
        tendencia,
        ejerciciosProblematicos,
        alternativasSugeridasDelTipo,
      });
    }

    return resultado;
  }

  // Obtiene el historico de rendimiento para calcular Z-Score
  // Usa fechaSesion (fecha del entrenamiento) para el rango temporal
  private async obtenerHistoricoZScore(atletaId: bigint, tipo: TipoEjercicio): Promise<number[]> {
    const hace28Dias = new Date();
    hace28Dias.setDate(hace28Dias.getDate() - CONFIGURACION_ANALISIS.DIAS_HISTORICO_ZSCORE);

    const registros = await this.prisma.rendimientoEjercicio.findMany({
      where: {
        registro: { atletaId },
        ejercicioSesion: {
          sesion: {
            fecha: { gte: hace28Dias },
          },
          ejercicio: { tipo },
        },
        rendimiento: { not: null },
      },
      select: { rendimiento: true },
    });

    return registros.map((r) => r.rendimiento as number);
  }

  // Identifica ejercicios problematicos en un tipo especifico
  private async identificarEjerciciosProblematicosEnTipo(
    registros: RendimientoConContexto[],
    dolenciasActivas: DolenciaActiva[]
  ): Promise<EjercicioProblematico[]> {
    // Agrupar por ejercicio
    const porEjercicio = new Map<
      string,
      { ejercicio: RendimientoConContexto; registros: RendimientoConContexto[] }
    >();

    for (const r of registros) {
      const key = r.ejercicioId.toString();
      const existente = porEjercicio.get(key);
      if (existente) {
        existente.registros.push(r);
      } else {
        porEjercicio.set(key, { ejercicio: r, registros: [r] });
      }
    }

    const problematicos: EjercicioProblematico[] = [];

    for (const [_, datos] of porEjercicio) {
      const { ejercicio, registros: regs } = datos;

      // Calcular estadisticas
      const vecesAsignado = regs.length;
      const vecesCompletado = regs.filter((r) => r.completado).length;
      const vecesNoCompletado = vecesAsignado - vecesCompletado;

      const conRendimiento = regs.filter((r) => r.rendimiento !== null);
      const rendimientos = conRendimiento.map((r) => r.rendimiento as number);
      const rendimientoPromedio =
        rendimientos.length > 0 ? Math.round(calcularMedia(rendimientos) * 100) / 100 : 0;

      // Verificar si es problematico
      // Caso 1: Ejercicio asignado 3+ veces con rendimiento bajo (< 5) - patron confirmado
      // Caso 2: Ejercicio con rendimiento MUY bajo (<= 3) aunque aparezca 1 sola vez
      // Caso 3: Ejercicio no completado 2+ veces
      const esProblematico =
        (vecesAsignado >= CONFIGURACION_ANALISIS.MINIMO_ASIGNACIONES_PARA_PROBLEMA &&
          rendimientoPromedio < CONFIGURACION_ANALISIS.RENDIMIENTO_BAJO) ||
        (conRendimiento.length > 0 &&
          rendimientoPromedio <= CONFIGURACION_ANALISIS.RENDIMIENTO_MUY_BAJO) ||
        vecesNoCompletado >= CONFIGURACION_ANALISIS.MINIMO_NO_COMPLETADOS_PARA_ALERTA;

      if (esProblematico) {
        // Calcular tendencia del ejercicio (usando fecha de la sesion)
        const puntos: PuntoTemporal[] = conRendimiento.map((r) => ({
          fecha: new Date(r.fechaSesion),
          valor: r.rendimiento as number,
        }));
        const tendenciaEj = calcularTendencia(puntos);

        // Buscar alternativas (reutilizando dolencias precargadas)
        const alternativas = await this.buscarAlternativas(
          ejercicio.ejercicioTipo,
          ejercicio.ejercicioNivel,
          dolenciasActivas
        );

        problematicos.push({
          ejercicioId: ejercicio.ejercicioId,
          nombre: ejercicio.ejercicioNombre,
          tipo: ejercicio.ejercicioTipo,
          rendimientoPromedio,
          vecesAsignado,
          vecesCompletado,
          vecesNoCompletado,
          zScore: null, // Se calcula a nivel de tipo, no de ejercicio individual
          tendencia: tendenciaEj.datosInsuficientes ? null : tendenciaEj.tendencia,
          alternativasSugeridas: alternativas,
        });
      }
    }

    // Ordenar por rendimiento (peor primero) y limitar
    return problematicos
      .sort((a, b) => a.rendimientoPromedio - b.rendimientoPromedio)
      .slice(0, CONFIGURACION_ANALISIS.MAX_EJERCICIOS_PROBLEMATICOS);
  }

  // Identifica todos los ejercicios problematicos del atleta
  private async identificarEjerciciosProblematicos(
    rendimientos: RendimientoConContexto[],
    dolenciasActivas: DolenciaActiva[]
  ): Promise<EjercicioProblematico[]> {
    return this.identificarEjerciciosProblematicosEnTipo(rendimientos, dolenciasActivas);
  }

  // Busca ejercicios alternativos del mismo tipo pero menor dificultad
  // Recibe dolencias precargadas para evitar queries redundantes
  private async buscarAlternativas(
    tipo: TipoEjercicio,
    nivelActual: number,
    dolenciasActivas: DolenciaActiva[]
  ): Promise<AlternativaSugerida[]> {
    // Buscar ejercicios del mismo tipo con menor o igual dificultad
    const alternativas = await this.prisma.catalogoEjercicios.findMany({
      where: {
        tipo,
        activo: true,
        nivelDificultad: { lte: nivelActual },
      },
      select: {
        id: true,
        nombre: true,
        nivelDificultad: true,
      },
      orderBy: { nivelDificultad: 'asc' },
      take: CONFIGURACION_ANALISIS.MAX_ALTERNATIVAS_POR_EJERCICIO + 2, // Tomar extras por si hay que filtrar
    });

    // Zonas afectadas para futuro filtrado por zonasCuerpo del ejercicio
    const _zonasAfectadas = new Set(dolenciasActivas.map((d) => d.zona));

    // Filtrar ejercicios que no afecten zonas lesionadas
    const filtradas: AlternativaSugerida[] = [];
    for (const alt of alternativas) {
      if (filtradas.length >= CONFIGURACION_ANALISIS.MAX_ALTERNATIVAS_POR_EJERCICIO) {
        break;
      }

      // Verificar zonas (simplificado, idealmente verificar zonasCuerpo del ejercicio)
      filtradas.push({
        ejercicioId: alt.id,
        nombre: alt.nombre,
        nivelDificultad: alt.nivelDificultad || 1,
        razon:
          alt.nivelDificultad && alt.nivelDificultad < nivelActual
            ? 'Menor dificultad para reforzar fundamentos'
            : 'Alternativa del mismo nivel',
      });
    }

    return filtradas;
  }

  // Busca alternativas para un TIPO de ejercicio completo
  // Se usa cuando hay bajo rendimiento en un tipo pero no hay ejercicios especificos que se repitan
  // Recibe dolencias precargadas para evitar queries redundantes
  async buscarAlternativasPorTipo(
    tipo: TipoEjercicio,
    dolenciasActivas: DolenciaActiva[],
    atletaId?: bigint
  ): Promise<AlternativaSugerida[]> {
    // 1. Determinar nivel de dificultad apropiado segun el perfil del atleta
    let nivelMaximo = 3; // Por defecto, nivel basico-intermedio
    if (atletaId) {
      const ultimoTest = await this.prisma.testFisico.findFirst({
        where: { atletaId },
        orderBy: { fechaTest: 'desc' },
        select: { navettePalier: true },
      });
      if (ultimoTest?.navettePalier) {
        const palier = Number(ultimoTest.navettePalier);
        // Palier 1-4: nivel 1-2, Palier 5-8: nivel 2-3, Palier 9+: nivel 3-5
        if (palier <= 4) {
          nivelMaximo = 2;
        } else if (palier <= 8) {
          nivelMaximo = 3;
        } else {
          nivelMaximo = 5;
        }
      }
    }

    const zonasAfectadas = dolenciasActivas.map((d) => d.zona.toLowerCase());

    // 3. Buscar ejercicios del tipo especificado con dificultad apropiada
    const ejerciciosDelTipo = await this.prisma.catalogoEjercicios.findMany({
      where: {
        tipo,
        activo: true,
        nivelDificultad: { lte: nivelMaximo },
      },
      select: {
        id: true,
        nombre: true,
        nivelDificultad: true,
        contraindicaciones: true,
        zonasCuerpo: true,
        perfilesRecomendados: true,
      },
      orderBy: { nivelDificultad: 'asc' },
    });

    // 4. Filtrar ejercicios que no agraven lesiones activas
    const alternativasFiltradas: AlternativaSugerida[] = [];

    for (const ejercicio of ejerciciosDelTipo) {
      // Verificar si tiene contraindicaciones que coincidan con zonas afectadas
      let tieneContraindicacion = false;

      if (ejercicio.contraindicaciones && zonasAfectadas.length > 0) {
        const contraindicacionesLower = ejercicio.contraindicaciones.toLowerCase();
        for (const zona of zonasAfectadas) {
          if (contraindicacionesLower.includes(zona)) {
            tieneContraindicacion = true;
            break;
          }
        }
      }

      // Verificar si las zonas del ejercicio coinciden con zonas lesionadas
      if (!tieneContraindicacion && ejercicio.zonasCuerpo && zonasAfectadas.length > 0) {
        for (const zonaCuerpo of ejercicio.zonasCuerpo) {
          const zonaCuerpoLower = zonaCuerpo.toLowerCase();
          for (const zonaAfectada of zonasAfectadas) {
            if (zonaCuerpoLower.includes(zonaAfectada) || zonaAfectada.includes(zonaCuerpoLower)) {
              tieneContraindicacion = true;
              break;
            }
          }
          if (tieneContraindicacion) break;
        }
      }

      if (!tieneContraindicacion) {
        // Determinar razon de la sugerencia
        let razon = 'Ejercicio alternativo del mismo tipo';
        if (ejercicio.nivelDificultad && ejercicio.nivelDificultad <= 2) {
          razon = 'Ejercicio basico para reforzar fundamentos';
        } else if (ejercicio.nivelDificultad && ejercicio.nivelDificultad <= 3) {
          razon = 'Ejercicio de dificultad intermedia para consolidar';
        }

        alternativasFiltradas.push({
          ejercicioId: ejercicio.id,
          nombre: ejercicio.nombre,
          nivelDificultad: ejercicio.nivelDificultad || 1,
          razon,
        });
      }

      // Limitar cantidad de alternativas
      if (alternativasFiltradas.length >= CONFIGURACION_ANALISIS.MAX_ALTERNATIVAS_POR_EJERCICIO) {
        break;
      }
    }

    return alternativasFiltradas;
  }

  // Detecta patrones de bajo rendimiento
  private detectarPatrones(
    rendimientoPorTipo: RendimientoPorTipo[],
    ejerciciosProblematicos: EjercicioProblematico[]
  ): PatronDetectado[] {
    const patrones: PatronDetectado[] = [];

    // Patron 1: Bajo rendimiento en un tipo de ejercicio
    for (const tipo of rendimientoPorTipo) {
      if (
        tipo.rendimientoPromedio < CONFIGURACION_ANALISIS.RENDIMIENTO_BAJO &&
        tipo.cantidadRegistros >= CONFIGURACION_ANALISIS.MINIMO_ASIGNACIONES_PARA_PROBLEMA
      ) {
        patrones.push({
          tipo: 'BAJO_RENDIMIENTO_TIPO',
          severidad: tipo.zScore.interpretacion === 'CRITICO_BAJO' ? 'CRITICA' : 'ALTA',
          descripcion: `Bajo rendimiento en ejercicios de tipo ${tipo.tipo}`,
          tipoEjercicioAfectado: tipo.tipo,
          datos: {
            rendimientoPromedio: tipo.rendimientoPromedio,
            zScore: tipo.zScore.zScore,
            tendencia: tipo.tendencia.tendencia,
          },
        });
      }
    }

    // Patron 2: Ejercicio especifico que falla repetidamente
    for (const ejercicio of ejerciciosProblematicos) {
      if (ejercicio.vecesNoCompletado >= CONFIGURACION_ANALISIS.MINIMO_NO_COMPLETADOS_PARA_ALERTA) {
        patrones.push({
          tipo: 'EJERCICIO_RECURRENTE_FALLA',
          severidad: 'MEDIA',
          descripcion: `Ejercicio "${ejercicio.nombre}" no completado en ${ejercicio.vecesNoCompletado} de ${ejercicio.vecesAsignado} sesiones`,
          ejercicioAfectado: {
            id: ejercicio.ejercicioId,
            nombre: ejercicio.nombre,
          },
          datos: {
            vecesAsignado: ejercicio.vecesAsignado,
            vecesNoCompletado: ejercicio.vecesNoCompletado,
            rendimientoPromedio: ejercicio.rendimientoPromedio,
          },
        });
      }
    }

    // Patron 3: Tendencia negativa sostenida
    for (const tipo of rendimientoPorTipo) {
      if (tipo.tendencia.tendencia === 'EMPEORANDO' && tipo.tendencia.rSquared > 0.5) {
        patrones.push({
          tipo: 'TENDENCIA_NEGATIVA',
          severidad: 'ALTA',
          descripcion: `Tendencia de empeoramiento en ejercicios ${tipo.tipo}`,
          tipoEjercicioAfectado: tipo.tipo,
          datos: {
            pendiente: tipo.tendencia.pendiente,
            confianza: tipo.tendencia.rSquared,
          },
        });
      }
    }

    // Patron 4: Mejora detectada (informativo)
    for (const tipo of rendimientoPorTipo) {
      if (
        tipo.tendencia.tendencia === 'MEJORANDO' &&
        tipo.tendencia.rSquared > 0.5 &&
        tipo.zScore.interpretacion === 'ALERTA_ALTA'
      ) {
        patrones.push({
          tipo: 'MEJORA_DETECTADA',
          severidad: 'BAJA',
          descripcion: `Mejora significativa detectada en ejercicios ${tipo.tipo}`,
          tipoEjercicioAfectado: tipo.tipo,
          datos: {
            pendiente: tipo.tendencia.pendiente,
            zScore: tipo.zScore.zScore,
          },
        });
      }
    }

    return patrones;
  }

  // Evalua si el atleta requiere atencion y con que prioridad
  private evaluarAtencion(patrones: PatronDetectado[]): {
    requiereAtencion: boolean;
    prioridadAtencion: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
  } {
    if (patrones.length === 0) {
      return { requiereAtencion: false, prioridadAtencion: 'BAJA' };
    }

    // Determinar prioridad maxima
    const severidades = patrones.map((p) => p.severidad);

    if (severidades.includes('CRITICA')) {
      return { requiereAtencion: true, prioridadAtencion: 'CRITICA' };
    }
    if (severidades.includes('ALTA')) {
      return { requiereAtencion: true, prioridadAtencion: 'ALTA' };
    }
    if (severidades.includes('MEDIA')) {
      return { requiereAtencion: true, prioridadAtencion: 'MEDIA' };
    }

    return { requiereAtencion: false, prioridadAtencion: 'BAJA' };
  }

  // Calcula el promedio global de rendimiento
  private calcularPromedioGlobal(rendimientos: RendimientoConContexto[]): number {
    const conRendimiento = rendimientos.filter((r) => r.rendimiento !== null);
    if (conRendimiento.length === 0) return 0;

    const valores = conRendimiento.map((r) => r.rendimiento as number);
    return Math.round(calcularMedia(valores) * 100) / 100;
  }

  // Crea un analisis vacio cuando no hay datos suficientes
  private crearAnalisisVacio(
    atletaId: bigint,
    atleta: { usuario: { nombreCompleto: string } },
    desde: Date,
    hasta: Date,
    diasAtras: number,
    totalRegistros: number
  ): AnalisisRendimientoAtleta {
    return {
      atletaId,
      nombreAtleta: atleta.usuario.nombreCompleto,
      periodoAnalisis: {
        desde,
        hasta,
        diasAnalizados: diasAtras,
      },
      resumenGeneral: {
        totalSesiones: 0,
        totalRegistros,
        rendimientoGlobalPromedio: 0,
      },
      rendimientoPorTipo: [],
      ejerciciosProblematicos: [],
      patrones: [],
      requiereAtencion: false,
      prioridadAtencion: 'BAJA',
    };
  }
}
