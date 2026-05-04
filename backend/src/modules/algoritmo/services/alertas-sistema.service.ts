// Servicio de Alertas del Sistema con integracion a BD
// Usa las funciones de alertas.service.ts y persiste en tablas:
// - alertas_sistema: alertas generadas por el algoritmo (datos unicos)
// - alerta_destinatarios: junction table con estado de lectura por usuario
// - notificaciones: notificaciones enviadas a usuarios

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Severidad } from '@prisma/client';
import {
  analizarAlertas,
  DatosRegistroParaAlerta,
  DatosSesionParaAlerta,
  DatosDolencia,
  DatosTolerancia,
  ResultadoAlertas,
  AlertaGenerada,
} from './alertas.service';
import { CategoriaPeso, PeriodoTolerancia, EtapaMesociclo } from '@prisma/client';

// Resultado del procesamiento de alertas
export interface ResultadoProcesamiento {
  alertasCreadas: number;
  alertasActualizadas: number;
  notificacionesCreadas: number;
  alertas: AlertaGenerada[];
  resumen: string;
}

@Injectable()
export class AlertasSistemaService {
  constructor(private prisma: PrismaService) {}

  // Procesa alertas despues de un registro post-entrenamiento
  // Evalua reglas y crea alertas/notificaciones en la BD
  async procesarAlertasPostEntrenamiento(
    atletaId: bigint,
    registroId: bigint,
    sesionId: bigint
  ): Promise<ResultadoProcesamiento> {
    // 1. Obtener datos del atleta
    const atleta = await this.prisma.atleta.findUnique({
      where: { id: atletaId },
      select: {
        id: true,
        categoriaPeso: true,
        pesoActual: true,
        entrenadorAsignadoId: true,
        usuario: {
          select: { nombreCompleto: true },
        },
      },
    });

    if (!atleta) {
      return {
        alertasCreadas: 0,
        alertasActualizadas: 0,
        notificacionesCreadas: 0,
        alertas: [],
        resumen: 'Atleta no encontrado',
      };
    }

    // 2. Obtener el registro actual
    const registroActual = await this.prisma.registroPostEntrenamiento.findUnique({
      where: { id: registroId },
      include: {
        dolencias: true,
        sesion: {
          select: {
            intensidadPlanificada: true,
            volumenPlanificado: true,
          },
        },
      },
    });

    if (!registroActual) {
      return {
        alertasCreadas: 0,
        alertasActualizadas: 0,
        notificacionesCreadas: 0,
        alertas: [],
        resumen: 'Registro no encontrado',
      };
    }

    // 3. Obtener historial de registros (ultimos 7 dias)
    const hace7Dias = new Date();
    hace7Dias.setDate(hace7Dias.getDate() - 7);

    const historialRegistros = await this.prisma.registroPostEntrenamiento.findMany({
      where: {
        atletaId,
        id: { not: registroId },
        fechaRegistro: { gte: hace7Dias },
        asistio: true,
      },
      orderBy: { fechaRegistro: 'desc' },
      take: 10,
    });

    // 4. Obtener dolencias activas del atleta
    const dolenciasActivas = await this.prisma.dolencia.findMany({
      where: {
        recuperado: false,
        registroPostEntrenamiento: {
          atletaId,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 5. Obtener historial de dolencias (ultimos 30 dias)
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);

    const historialDolencias = await this.prisma.dolencia.findMany({
      where: {
        registroPostEntrenamiento: {
          atletaId,
        },
        createdAt: { gte: hace30Dias },
      },
    });

    // 6. Preparar datos para el analizador
    const datosRegistroActual: DatosRegistroParaAlerta = {
      fechaRegistro: registroActual.fechaRegistro,
      rpe: registroActual.rpe,
      calidadSueno: registroActual.calidadSueno,
      estadoAnimico: registroActual.estadoAnimico,
      duracionReal: registroActual.duracionReal,
      ejerciciosCompletados: Number(registroActual.ejerciciosCompletados),
      intensidadAlcanzada: Number(registroActual.intensidadAlcanzada),
    };

    const historialParaAlerta: DatosRegistroParaAlerta[] = historialRegistros.map((r) => ({
      fechaRegistro: r.fechaRegistro,
      rpe: r.rpe,
      calidadSueno: r.calidadSueno,
      estadoAnimico: r.estadoAnimico,
      duracionReal: r.duracionReal,
      ejerciciosCompletados: Number(r.ejerciciosCompletados),
      intensidadAlcanzada: Number(r.intensidadAlcanzada),
    }));

    const datosSesion: DatosSesionParaAlerta = {
      intensidadPlanificada: registroActual.sesion.intensidadPlanificada,
      volumenPlanificado: registroActual.sesion.volumenPlanificado,
    };

    const dolenciasParaAlerta: DatosDolencia[] = dolenciasActivas.map((d) => ({
      zona: d.zona,
      nivel: d.nivel,
      recuperado: d.recuperado,
      fechaCreacion: d.createdAt,
    }));

    const historialDolenciasParaAlerta: DatosDolencia[] = historialDolencias.map((d) => ({
      zona: d.zona,
      nivel: d.nivel,
      recuperado: d.recuperado,
      fechaCreacion: d.createdAt,
    }));

    // 6.5. Obtener tolerancia de peso dinamica
    const toleranciaPeso = await this.obtenerToleranciaPeso(
      atletaId,
      atleta.categoriaPeso,
      sesionId
    );

    // 7. Ejecutar analisis de alertas
    const resultado: ResultadoAlertas = analizarAlertas(
      datosRegistroActual,
      historialParaAlerta,
      datosSesion,
      dolenciasParaAlerta,
      historialDolenciasParaAlerta,
      atleta.pesoActual ? Number(atleta.pesoActual) : null,
      atleta.categoriaPeso,
      toleranciaPeso
    );

    // 8. Si no hay alertas, retornar
    if (!resultado.hayAlertas) {
      return {
        alertasCreadas: 0,
        alertasActualizadas: 0,
        notificacionesCreadas: 0,
        alertas: [],
        resumen: resultado.resumen,
      };
    }

    // 9. Obtener destinatarios (COMITE_TECNICO y entrenador asignado)
    const destinatarios = await this.obtenerDestinatarios(atleta.entrenadorAsignadoId);

    // 10. Crear o actualizar alertas usando deduplicacion
    // Ventana de tiempo: 48 horas (estandar de la industria)
    const hace48Horas = new Date();
    hace48Horas.setHours(hace48Horas.getHours() - 48);

    let alertasCreadas = 0;
    let alertasActualizadas = 0;
    // notificacionesCreadas ya no se usa - alertas se consultan directamente
    const notificacionesCreadas = 0;

    for (const alerta of resultado.alertas) {
      // Buscar alerta similar existente (deduplicacion key-based)
      // Clave: atletaId + tipo + titulo dentro de las ultimas 48 horas
      const alertaExistente = await this.prisma.alertaSistema.findFirst({
        where: {
          atletaId,
          tipo: alerta.tipo,
          titulo: alerta.titulo,
          createdAt: { gte: hace48Horas },
        },
        orderBy: { createdAt: 'desc' },
      });

      let alertaFinal: { id: bigint };

      if (alertaExistente) {
        // Alerta ya existe: incrementar contador y actualizar
        // Si la nueva severidad es mayor, actualizar tambien
        const nuevaSeveridadMayor =
          this.compararSeveridad(alerta.severidad, alertaExistente.severidad) > 0;

        await this.prisma.alertaSistema.update({
          where: { id: alertaExistente.id },
          data: {
            ocurrencias: { increment: 1 },
            ultimaOcurrencia: new Date(),
            // Actualizar severidad solo si es mayor
            ...(nuevaSeveridadMayor && { severidad: alerta.severidad }),
            // Actualizar contexto con datos mas recientes
            datosContexto: JSON.parse(
              JSON.stringify({
                valorDetectado: alerta.valorDetectado,
                umbral: alerta.umbral,
                accionSugerida: alerta.accionSugerida,
                registroPostEntrenamientoId: registroId.toString(),
                sesionId: sesionId.toString(),
                acwr: resultado.acwr,
                ocurrenciasAnteriores: alertaExistente.ocurrencias,
              })
            ),
          },
        });
        alertaFinal = alertaExistente;
        alertasActualizadas++;
      } else {
        // Alerta nueva: crear
        const alertaCreada = await this.prisma.alertaSistema.create({
          data: {
            atletaId,
            tipo: alerta.tipo,
            titulo: alerta.titulo,
            descripcion: alerta.mensaje,
            severidad: alerta.severidad,
            ocurrencias: 1,
            ultimaOcurrencia: new Date(),
            datosContexto: JSON.parse(
              JSON.stringify({
                valorDetectado: alerta.valorDetectado,
                umbral: alerta.umbral,
                accionSugerida: alerta.accionSugerida,
                registroPostEntrenamientoId: registroId.toString(),
                sesionId: sesionId.toString(),
                acwr: resultado.acwr,
              })
            ),
          },
        });
        alertaFinal = alertaCreada;
        alertasCreadas++;

        // Solo crear destinatarios para alertas NUEVAS
        // NOTA: No se crean notificaciones duplicadas, las alertas se consultan directamente
        // desde la tabla alertas_sistema via el Centro de Notificaciones unificado
        for (const destinatarioId of destinatarios) {
          await this.prisma.alertaDestinatario.create({
            data: {
              alertaId: alertaFinal.id,
              destinatarioId,
            },
          });
        }
      }
    }

    return {
      alertasCreadas,
      alertasActualizadas,
      notificacionesCreadas,
      alertas: resultado.alertas,
      resumen: `${resultado.resumen} (${alertasCreadas} nuevas, ${alertasActualizadas} actualizadas)`,
    };
  }

  // Compara severidades y retorna: >0 si a>b, <0 si a<b, 0 si iguales
  private compararSeveridad(a: Severidad, b: Severidad): number {
    const orden: Record<Severidad, number> = {
      BAJA: 1,
      MEDIA: 2,
      ALTA: 3,
      CRITICA: 4,
    };
    return orden[a] - orden[b];
  }

  // Obtiene los IDs de usuarios que deben recibir alertas
  private async obtenerDestinatarios(entrenadorAsignadoId: bigint | null): Promise<bigint[]> {
    const destinatarios: bigint[] = [];

    // 1. Obtener todos los usuarios COMITE_TECNICO
    const comiteTecnico = await this.prisma.usuario.findMany({
      where: {
        rol: 'COMITE_TECNICO',
        estado: true,
      },
      select: { id: true },
    });

    destinatarios.push(...comiteTecnico.map((u) => u.id));

    // 2. Agregar el entrenador asignado si existe
    if (entrenadorAsignadoId) {
      const entrenador = await this.prisma.entrenador.findUnique({
        where: { id: entrenadorAsignadoId },
        select: { usuarioId: true },
      });

      if (entrenador && !destinatarios.includes(entrenador.usuarioId)) {
        destinatarios.push(entrenador.usuarioId);
      }
    }

    return destinatarios;
  }


  // Obtiene alertas de un atleta (todas, sin filtrar por destinatario)
  async obtenerAlertasAtleta(atletaId: bigint, soloNoLeidas: boolean = false) {
    // Si soloNoLeidas, filtrar por alertas que tengan al menos un destinatario sin leer
    const whereClause: any = { atletaId };

    if (soloNoLeidas) {
      whereClause.destinatarios = {
        some: { leida: false },
      };
    }

    const alertas = await this.prisma.alertaSistema.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        atleta: {
          include: {
            usuario: { select: { nombreCompleto: true } },
          },
        },
        destinatarios: {
          include: {
            destinatario: { select: { id: true, nombreCompleto: true } },
          },
        },
      },
    });

    return alertas.map((a) => ({
      id: a.id.toString(),
      atletaId: a.atletaId.toString(),
      atletaNombre: a.atleta.usuario.nombreCompleto,
      tipo: a.tipo,
      titulo: a.titulo,
      descripcion: a.descripcion,
      severidad: a.severidad,
      ocurrencias: a.ocurrencias,
      ultimaOcurrencia: a.ultimaOcurrencia,
      datosContexto: a.datosContexto,
      createdAt: a.createdAt,
      destinatarios: a.destinatarios.map((d) => ({
        destinatarioId: d.destinatarioId.toString(),
        nombreDestinatario: d.destinatario.nombreCompleto,
        leida: d.leida,
        fechaLeida: d.fechaLeida,
      })),
    }));
  }

  // Obtiene alertas para un destinatario (usuario) via junction table
  async obtenerAlertasDestinatario(
    destinatarioId: bigint,
    soloNoLeidas: boolean = false,
    page: number = 1,
    limit: number = 10
  ) {
    const skip = (page - 1) * limit;
    const whereClause: any = { destinatarioId };
    if (soloNoLeidas) {
      whereClause.leida = false;
    }

    const [alertaDestinatarios, total] = await Promise.all([
      this.prisma.alertaDestinatario.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          alerta: {
            include: {
              atleta: {
                include: {
                  usuario: { select: { nombreCompleto: true } },
                },
              },
            },
          },
        },
      }),
      this.prisma.alertaDestinatario.count({ where: whereClause }),
    ]);

    return {
      data: alertaDestinatarios.map((ad) => ({
        id: ad.alerta.id.toString(),
        alertaDestinatarioId: ad.id.toString(),
        atletaId: ad.alerta.atletaId.toString(),
        atletaNombre: ad.alerta.atleta.usuario.nombreCompleto,
        tipo: ad.alerta.tipo,
        titulo: ad.alerta.titulo,
        descripcion: ad.alerta.descripcion,
        severidad: ad.alerta.severidad,
        ocurrencias: ad.alerta.ocurrencias,
        ultimaOcurrencia: ad.alerta.ultimaOcurrencia,
        leida: ad.leida,
        fechaLeida: ad.fechaLeida,
        datosContexto: ad.alerta.datosContexto,
        createdAt: ad.alerta.createdAt,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Marca una alerta como leida para un destinatario especifico
  async marcarAlertaLeida(alertaId: bigint, destinatarioId: bigint) {
    const alertaDestinatario = await this.prisma.alertaDestinatario.findFirst({
      where: {
        alertaId,
        destinatarioId,
      },
    });

    if (!alertaDestinatario) {
      return null;
    }

    const actualizada = await this.prisma.alertaDestinatario.update({
      where: { id: alertaDestinatario.id },
      data: {
        leida: true,
        fechaLeida: new Date(),
      },
    });

    return {
      id: actualizada.id.toString(),
      alertaId: actualizada.alertaId.toString(),
      leida: actualizada.leida,
      fechaLeida: actualizada.fechaLeida,
    };
  }

  // Marca todas las alertas de un destinatario como leidas
  async marcarTodasLeidas(destinatarioId: bigint) {
    const resultado = await this.prisma.alertaDestinatario.updateMany({
      where: {
        destinatarioId,
        leida: false,
      },
      data: {
        leida: true,
        fechaLeida: new Date(),
      },
    });

    return {
      alertasMarcadas: resultado.count,
    };
  }

  // Cuenta alertas no leidas de un destinatario
  async contarAlertasNoLeidas(destinatarioId: bigint) {
    const count = await this.prisma.alertaDestinatario.count({
      where: {
        destinatarioId,
        leida: false,
      },
    });

    return { noLeidas: count };
  }

  // Mapea EtapaMesociclo a PeriodoTolerancia
  // Los enums tienen valores diferentes, necesitan conversion
  private mapearEtapaAPeriodo(etapa: EtapaMesociclo): PeriodoTolerancia {
    const mapa: Record<EtapaMesociclo, PeriodoTolerancia> = {
      PREPARACION_GENERAL: 'GENERAL',
      PREPARACION_ESPECIFICA: 'ESPECIFICA_I',
      COMPETITIVA: 'COMPETITIVA',
      TRANSICION: 'GENERAL', // Transicion usa tolerancias de periodo general
    };
    return mapa[etapa];
  }

  // Obtiene la tolerancia de peso dinamica segun periodo y dia
  // Consulta la tabla tolerancias_peso
  private async obtenerToleranciaPeso(
    atletaId: bigint,
    categoriaPeso: CategoriaPeso,
    sesionId: bigint
  ): Promise<DatosTolerancia | undefined> {
    try {
      // 1. Obtener la sesion para saber el dia de la semana
      const sesion = await this.prisma.sesion.findUnique({
        where: { id: sesionId },
        select: {
          diaSemana: true,
          microciclo: {
            select: {
              mesociclo: {
                select: { etapa: true },
              },
            },
          },
        },
      });

      if (!sesion) {
        return undefined;
      }

      // 2. Determinar si es inicio o fin de semana
      // Lunes-Miercoles = toleranciaLunes (mas flexible)
      // Jueves-Domingo = toleranciaViernes (mas estricto, cerca del pesaje)
      const diasInicioSemana = ['LUNES', 'MARTES', 'MIERCOLES'];
      const esInicioSemana = diasInicioSemana.includes(sesion.diaSemana);

      // 3. Obtener el periodo del mesociclo (si existe)
      // Si no hay mesociclo, usar GENERAL como default
      // Mapear EtapaMesociclo a PeriodoTolerancia
      let periodo: PeriodoTolerancia = 'GENERAL';
      if (sesion.microciclo?.mesociclo?.etapa) {
        periodo = this.mapearEtapaAPeriodo(sesion.microciclo.mesociclo.etapa);
      }

      // 4. Consultar la tolerancia
      const toleranciaDB = await this.prisma.toleranciasPeso.findUnique({
        where: {
          categoriaPeso_periodo: {
            categoriaPeso: categoriaPeso,
            periodo: periodo,
          },
        },
      });

      if (!toleranciaDB) {
        return undefined;
      }

      // 5. Seleccionar tolerancia segun dia y convertir de % a kg
      // Los valores en la tabla estan en porcentaje (ej: 4.00 = 4%)
      // Necesitamos el limite maximo de la categoria para calcular
      const limitesPeso: Record<CategoriaPeso, number> = {
        MENOS_60K: 60,
        MENOS_66K: 66,
        MENOS_73K: 73,
        MENOS_81K: 81,
        MENOS_90K: 90,
        MENOS_100K: 100,
        MAS_100K: 130, // Usar 130 como referencia para peso pesado
      };

      const limitePeso = limitesPeso[categoriaPeso];
      const toleranciaPorcentaje = esInicioSemana
        ? Number(toleranciaDB.toleranciaLunes)
        : Number(toleranciaDB.toleranciaViernes);

      // Convertir porcentaje a kg
      const toleranciaKg = (toleranciaPorcentaje / 100) * limitePeso;

      return {
        toleranciaKg: Math.round(toleranciaKg * 100) / 100, // Redondear a 2 decimales
      };
    } catch {
      // Si hay error, retornar undefined (usara tolerancia 0)
      return undefined;
    }
  }
}
