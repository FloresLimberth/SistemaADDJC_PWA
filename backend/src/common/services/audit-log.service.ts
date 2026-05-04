import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

// DTO interno para registrar audit logs
interface RegistrarAuditLogDto {
  usuarioId: bigint | null;
  accion: string;
  recurso: string;
  recursoId: bigint | null;
  ip: string;
  userAgent: string;
  exito: boolean;
}

// Servicio para registrar activity logs en la tabla auditorias_acceso
// Usado por AuditLogInterceptor para guardar acciones automaticamente
@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  // Registra una accion en la tabla auditorias_acceso
  // Se ejecuta de forma asincrona sin bloquear la respuesta
  async registrar(data: RegistrarAuditLogDto): Promise<void> {
    try {
      await this.prisma.auditoriaAcceso.create({
        data: {
          usuarioId: data.usuarioId,
          accion: data.accion,
          recurso: data.recurso,
          recursoId: data.recursoId,
          ip: data.ip || 'unknown',
          userAgent: data.userAgent || 'unknown',
          exito: data.exito,
        },
      });
    } catch (error) {
      // No lanzar error para no afectar la operacion principal
      // Solo loggear el error para debugging
      console.error('[AuditLogService] Error al registrar audit log:', error);
    }
  }

  // Obtener logs con filtros (para futuro endpoint de consulta)
  async findAll(options?: {
    usuarioId?: bigint;
    recurso?: string;
    accion?: string;
    desde?: Date;
    hasta?: Date;
    page?: number;
    limit?: number;
  }) {
    const { usuarioId, recurso, accion, desde, hasta, page = 1, limit = 50 } = options || {};

    const where: any = {};

    if (usuarioId) where.usuarioId = usuarioId;
    if (recurso) where.recurso = recurso;
    if (accion) where.accion = { contains: accion, mode: 'insensitive' };
    if (desde || hasta) {
      where.createdAt = {};
      if (desde) where.createdAt.gte = desde;
      if (hasta) where.createdAt.lte = hasta;
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.prisma.auditoriaAcceso.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          usuario: {
            select: {
              id: true,
              nombreCompleto: true,
              email: true,
              rol: true,
            },
          },
        },
      }),
      this.prisma.auditoriaAcceso.count({ where }),
    ]);

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
