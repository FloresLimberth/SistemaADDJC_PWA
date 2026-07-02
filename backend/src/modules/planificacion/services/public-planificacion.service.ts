import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

// Servicio para datos publicos de planificacion (sin autenticacion)
// Retorna solo datos minimos: nombre y etapa de mesociclos
@Injectable()
export class PublicPlanificacionService {
  constructor(private readonly prisma: PrismaService) {}

  // Obtiene la planificacion publica del macrociclo activo
  // Prioridad: primero EN_CURSO, luego PLANIFICADO
  // Solo retorna: nombre macrociclo, temporada, y mesociclos con nombre + etapa + fechas
  async obtenerPlanificacionPublica() {
    // Buscar primero un macrociclo EN_CURSO, si no hay, el PLANIFICADO mas reciente
    const macrociclo = await this.prisma.macrociclo.findFirst({
      where: {
        estado: { in: ['EN_CURSO', 'PLANIFICADO'] },
      },
      orderBy: [
        // EN_CURSO tiene prioridad sobre PLANIFICADO
        { estado: 'asc' },
        { fechaInicio: 'desc' },
      ],
      select: {
        nombre: true,
        temporada: true,
        fechaInicio: true,
        fechaFin: true,
        mesociclos: {
          select: {
            nombre: true,
            etapa: true,
            fechaInicio: true,
            fechaFin: true,
          },
          orderBy: {
            fechaInicio: 'asc',
          },
        },
      },
    });

    if (!macrociclo) {
      return {
        macrociclo: null,
        mesociclos: [],
      };
    }

    return {
      macrociclo: {
        nombre: macrociclo.nombre,
        temporada: macrociclo.temporada,
        fechaInicio: macrociclo.fechaInicio,
        fechaFin: macrociclo.fechaFin,
      },
      mesociclos: macrociclo.mesociclos,
    };
  }
}
