import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AccessControlService } from '../../common/services/access-control.service';
import { RolUsuario } from '@prisma/client';

// Punto de datos para el grafico de bienestar temporal
interface BienestarDataPoint {
  fecha: string;
  rpe: number;
  calidadSueno: number;
  estadoAnimico: number;
  horasSueno: number | null;
  dolenciasCount: number;
}

// Punto de datos para el grafico de RPE grupal
interface BienestarGrupalDataPoint {
  fecha: string;
  rpePromedio: number;
  rpeMax: number;
  rpeMin: number;
  calidadSuenoPromedio: number;
  estadoAnimicoPromedio: number;
  atletasConRegistro: number;
}

// Punto de datos para el grafico de asistencia grupal
interface AsistenciaGrupalDataPoint {
  semana: string;
  semanaLabel: string;
  asistieron: number;
  faltaron: number;
  porcentajeAsistencia: number;
}

// Punto de datos para el grafico de intensidad plan vs real
interface CargaPlanVsRealDataPoint {
  fecha: string;
  sesionId: string;
  tipoSesion: string;
  numeroSesion: number;
  intensidadPlanificada: number | null;
  intensidadAlcanzada: number;
  cumplimiento: number | null;
}

@Injectable()
export class EstadisticasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessControl: AccessControlService,
  ) {}

  // Obtener datos de bienestar temporal de un atleta
  // Retorna serie temporal con RPE, calidad sueno, estado animico y dolencias
  async getBienestarAtleta(
    atletaId: bigint,
    userId: bigint,
    userRole: RolUsuario,
    dias: number,
  ): Promise<{ data: BienestarDataPoint[]; meta: { atletaId: string; dias: number; totalRegistros: number } }> {
    // Verificar acceso
    const hasAccess = await this.accessControl.checkAtletaOwnership(userId, userRole, atletaId);
    if (!hasAccess) {
      throw new ForbiddenException('No tienes permiso para ver datos de este atleta');
    }

    // Calcular fecha limite
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - dias);

    // Obtener registros post-entrenamiento con dolencias
    const registros = await this.prisma.registroPostEntrenamiento.findMany({
      where: {
        atletaId,
        asistio: true,
        fechaRegistro: { gte: fechaLimite },
      },
      orderBy: { fechaRegistro: 'asc' },
      select: {
        fechaRegistro: true,
        rpe: true,
        calidadSueno: true,
        estadoAnimico: true,
        horasSueno: true,
        dolencias: {
          select: { id: true },
        },
      },
    });

    const data: BienestarDataPoint[] = registros.map((r) => ({
      fecha: r.fechaRegistro.toISOString(),
      rpe: r.rpe,
      calidadSueno: r.calidadSueno,
      estadoAnimico: r.estadoAnimico,
      horasSueno: r.horasSueno ? parseFloat(r.horasSueno.toString()) : null,
      dolenciasCount: r.dolencias.length,
    }));

    return {
      data,
      meta: {
        atletaId: atletaId.toString(),
        dias,
        totalRegistros: data.length,
      },
    };
  }

  // Obtener datos de intensidad planificada vs real de un atleta
  // Cruza sesiones (plan) con registros post-entrenamiento (real)
  async getCargaPlanVsReal(
    atletaId: bigint,
    userId: bigint,
    userRole: RolUsuario,
    desde?: string,
    hasta?: string,
  ): Promise<{ data: CargaPlanVsRealDataPoint[]; meta: { atletaId: string; totalSesiones: number; cumplimientoPromedio: number | null } }> {
    // Verificar acceso
    const hasAccess = await this.accessControl.checkAtletaOwnership(userId, userRole, atletaId);
    if (!hasAccess) {
      throw new ForbiddenException('No tienes permiso para ver datos de este atleta');
    }

    // Buscar microciclos donde el atleta esta asignado
    const asignaciones = await this.prisma.asignacionAtletaMicrociclo.findMany({
      where: { atletaId },
      select: { microcicloId: true },
    });

    if (asignaciones.length === 0) {
      return {
        data: [],
        meta: {
          atletaId: atletaId.toString(),
          totalSesiones: 0,
          cumplimientoPromedio: null,
        },
      };
    }

    const microcicloIds = asignaciones.map((a) => a.microcicloId);

    // Filtro de fechas opcional
    const fechaFilter: any = {};
    if (desde) fechaFilter.gte = new Date(desde);
    if (hasta) {
      const hastaDate = new Date(hasta);
      hastaDate.setHours(23, 59, 59, 999);
      fechaFilter.lte = hastaDate;
    }

    // Buscar sesiones de tipo ENTRENAMIENTO, RECUPERACION o COMPETENCIA
    const sesiones = await this.prisma.sesion.findMany({
      where: {
        microcicloId: { in: microcicloIds },
        aprobado: true,
        tipoSesion: { in: ['ENTRENAMIENTO', 'RECUPERACION', 'COMPETENCIA'] },
        ...(Object.keys(fechaFilter).length > 0 && { fecha: fechaFilter }),
      },
      orderBy: { fecha: 'asc' },
      select: {
        id: true,
        fecha: true,
        tipoSesion: true,
        numeroSesion: true,
        intensidadPlanificada: true,
      },
    });

    if (sesiones.length === 0) {
      return {
        data: [],
        meta: {
          atletaId: atletaId.toString(),
          totalSesiones: 0,
          cumplimientoPromedio: null,
        },
      };
    }

    // Buscar registros post-entrenamiento del atleta para esas sesiones
    const sesionIds = sesiones.map((s) => s.id);
    const registros = await this.prisma.registroPostEntrenamiento.findMany({
      where: {
        atletaId,
        sesionId: { in: sesionIds },
        asistio: true,
      },
      select: {
        sesionId: true,
        intensidadAlcanzada: true,
      },
    });

    // Crear mapa de registros por sesionId para lookup O(1)
    const registroMap = new Map<string, number>();
    for (const r of registros) {
      registroMap.set(r.sesionId.toString(), parseFloat(r.intensidadAlcanzada.toString()));
    }

    // Combinar datos
    const data: CargaPlanVsRealDataPoint[] = [];
    let sumaCumplimiento = 0;
    let countCumplimiento = 0;

    for (const sesion of sesiones) {
      const sesionIdStr = sesion.id.toString();
      const intensidadReal = registroMap.get(sesionIdStr);

      // Solo incluir sesiones que tienen registro
      if (intensidadReal !== undefined) {
        const planificada = sesion.intensidadPlanificada;
        const cumplimiento = planificada && planificada > 0
          ? Math.round((intensidadReal / planificada) * 100)
          : null;

        if (cumplimiento !== null) {
          sumaCumplimiento += cumplimiento;
          countCumplimiento++;
        }

        data.push({
          fecha: sesion.fecha.toISOString(),
          sesionId: sesionIdStr,
          tipoSesion: sesion.tipoSesion,
          numeroSesion: sesion.numeroSesion,
          intensidadPlanificada: planificada,
          intensidadAlcanzada: intensidadReal,
          cumplimiento,
        });
      }
    }

    return {
      data,
      meta: {
        atletaId: atletaId.toString(),
        totalSesiones: data.length,
        cumplimientoPromedio: countCumplimiento > 0
          ? Math.round(sumaCumplimiento / countCumplimiento)
          : null,
      },
    };
  }

  // Obtener bienestar grupal (RPE promedio/max/min de todos los atletas por fecha)
  // Solo COMITE_TECNICO puede ver datos agregados de todos los atletas
  async getBienestarGrupal(
    dias: number,
  ): Promise<{ data: BienestarGrupalDataPoint[]; meta: { dias: number; totalRegistros: number; atletasUnicos: number } }> {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - dias);

    const registros = await this.prisma.registroPostEntrenamiento.findMany({
      where: {
        asistio: true,
        fechaRegistro: { gte: fechaLimite },
      },
      orderBy: { fechaRegistro: 'asc' },
      select: {
        atletaId: true,
        fechaRegistro: true,
        rpe: true,
        calidadSueno: true,
        estadoAnimico: true,
      },
    });

    if (registros.length === 0) {
      return {
        data: [],
        meta: { dias, totalRegistros: 0, atletasUnicos: 0 },
      };
    }

    // Agrupar por fecha (dia)
    const porFecha = new Map<string, { rpes: number[]; suenos: number[]; animos: number[]; atletaIds: Set<bigint> }>();

    for (const r of registros) {
      const fechaKey = r.fechaRegistro.toISOString().split('T')[0];
      if (!porFecha.has(fechaKey)) {
        porFecha.set(fechaKey, { rpes: [], suenos: [], animos: [], atletaIds: new Set() });
      }
      const grupo = porFecha.get(fechaKey)!;
      grupo.rpes.push(r.rpe);
      grupo.suenos.push(r.calidadSueno);
      grupo.animos.push(r.estadoAnimico);
      grupo.atletaIds.add(r.atletaId);
    }

    // Calcular promedios por fecha
    const data: BienestarGrupalDataPoint[] = [];
    const atletasUnicosTotal = new Set<bigint>();

    for (const [fecha, grupo] of porFecha) {
      const rpes = grupo.rpes;
      const sumaRpe = rpes.reduce((a, b) => a + b, 0);

      for (const id of grupo.atletaIds) {
        atletasUnicosTotal.add(id);
      }

      data.push({
        fecha,
        rpePromedio: Math.round((sumaRpe / rpes.length) * 10) / 10,
        rpeMax: Math.max(...rpes),
        rpeMin: Math.min(...rpes),
        calidadSuenoPromedio: Math.round((grupo.suenos.reduce((a, b) => a + b, 0) / grupo.suenos.length) * 10) / 10,
        estadoAnimicoPromedio: Math.round((grupo.animos.reduce((a, b) => a + b, 0) / grupo.animos.length) * 10) / 10,
        atletasConRegistro: grupo.atletaIds.size,
      });
    }

    // Ordenar por fecha
    data.sort((a, b) => a.fecha.localeCompare(b.fecha));

    return {
      data,
      meta: {
        dias,
        totalRegistros: registros.length,
        atletasUnicos: atletasUnicosTotal.size,
      },
    };
  }

  // Obtener asistencia grupal por semana
  // Solo COMITE_TECNICO puede ver datos agregados
  async getAsistenciaGrupal(
    semanas: number,
  ): Promise<{ data: AsistenciaGrupalDataPoint[]; meta: { semanas: number; totalRegistros: number } }> {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - (semanas * 7));

    const registros = await this.prisma.registroPostEntrenamiento.findMany({
      where: {
        fechaRegistro: { gte: fechaLimite },
      },
      orderBy: { fechaRegistro: 'asc' },
      select: {
        fechaRegistro: true,
        asistio: true,
      },
    });

    if (registros.length === 0) {
      return {
        data: [],
        meta: { semanas, totalRegistros: 0 },
      };
    }

    // Agrupar por semana ISO
    const porSemana = new Map<string, { asistieron: number; faltaron: number; fechaInicio: Date }>();

    for (const r of registros) {
      const fecha = r.fechaRegistro;
      // Calcular inicio de semana (lunes)
      const dia = fecha.getDay();
      const diffLunes = dia === 0 ? -6 : 1 - dia;
      const lunes = new Date(fecha);
      lunes.setDate(fecha.getDate() + diffLunes);
      lunes.setHours(0, 0, 0, 0);

      const semanaKey = lunes.toISOString().split('T')[0];

      if (!porSemana.has(semanaKey)) {
        porSemana.set(semanaKey, { asistieron: 0, faltaron: 0, fechaInicio: lunes });
      }

      const grupo = porSemana.get(semanaKey)!;
      if (r.asistio) {
        grupo.asistieron++;
      } else {
        grupo.faltaron++;
      }
    }

    // Convertir a array y formatear
    const data: AsistenciaGrupalDataPoint[] = [];

    for (const [semanaKey, grupo] of porSemana) {
      const total = grupo.asistieron + grupo.faltaron;
      const fin = new Date(grupo.fechaInicio);
      fin.setDate(fin.getDate() + 6);

      // Formato: "20 ene - 26 ene"
      const formatFecha = (d: Date) => {
        return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
      };

      data.push({
        semana: semanaKey,
        semanaLabel: `${formatFecha(grupo.fechaInicio)} - ${formatFecha(fin)}`,
        asistieron: grupo.asistieron,
        faltaron: grupo.faltaron,
        porcentajeAsistencia: total > 0 ? Math.round((grupo.asistieron / total) * 100) : 0,
      });
    }

    // Ordenar por semana
    data.sort((a, b) => a.semana.localeCompare(b.semana));

    return {
      data,
      meta: {
        semanas,
        totalRegistros: registros.length,
      },
    };
  }
}
