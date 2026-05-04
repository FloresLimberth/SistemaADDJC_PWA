import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class DateRangeValidator {
  constructor(private readonly prisma: PrismaService) {}

  // Valida que las fechas del mesociclo estén dentro del rango del macrociclo
  async validateMesocicloInMacrociclo(
    macrocicloId: bigint,
    fechaInicio: Date,
    fechaFin: Date
  ): Promise<void> {
    const macrociclo = await this.prisma.macrociclo.findUnique({
      where: { id: macrocicloId },
      select: { fechaInicio: true, fechaFin: true, nombre: true },
    });

    if (!macrociclo) {
      throw new BadRequestException('Macrociclo no encontrado');
    }

    // Validar que fechaInicio del mesociclo >= fechaInicio del macrociclo
    if (fechaInicio < macrociclo.fechaInicio) {
      throw new BadRequestException(
        `La fecha de inicio del mesociclo (${fechaInicio.toISOString().split('T')[0]}) ` +
          `debe ser mayor o igual a la fecha de inicio del macrociclo "${macrociclo.nombre}" ` +
          `(${macrociclo.fechaInicio.toISOString().split('T')[0]})`
      );
    }

    // Validar que fechaFin del mesociclo <= fechaFin del macrociclo
    if (fechaFin > macrociclo.fechaFin) {
      throw new BadRequestException(
        `La fecha de fin del mesociclo (${fechaFin.toISOString().split('T')[0]}) ` +
          `debe ser menor o igual a la fecha de fin del macrociclo "${macrociclo.nombre}" ` +
          `(${macrociclo.fechaFin.toISOString().split('T')[0]})`
      );
    }
  }

  // Valida que las fechas del microciclo estén dentro del rango del mesociclo
  async validateMicrocicloInMesociclo(
    mesocicloId: bigint,
    fechaInicio: Date,
    fechaFin: Date
  ): Promise<void> {
    const mesociclo = await this.prisma.mesociclo.findUnique({
      where: { id: mesocicloId },
      select: { fechaInicio: true, fechaFin: true, nombre: true },
    });

    if (!mesociclo) {
      throw new BadRequestException('Mesociclo no encontrado');
    }

    // Validar que fechaInicio del microciclo >= fechaInicio del mesociclo
    if (fechaInicio < mesociclo.fechaInicio) {
      throw new BadRequestException(
        `La fecha de inicio del microciclo (${fechaInicio.toISOString().split('T')[0]}) ` +
          `debe ser mayor o igual a la fecha de inicio del mesociclo "${mesociclo.nombre}" ` +
          `(${mesociclo.fechaInicio.toISOString().split('T')[0]})`
      );
    }

    // Validar que fechaFin del microciclo <= fechaFin del mesociclo
    if (fechaFin > mesociclo.fechaFin) {
      throw new BadRequestException(
        `La fecha de fin del microciclo (${fechaFin.toISOString().split('T')[0]}) ` +
          `debe ser menor o igual a la fecha de fin del mesociclo "${mesociclo.nombre}" ` +
          `(${mesociclo.fechaFin.toISOString().split('T')[0]})`
      );
    }
  }

  // Validación genérica de que fechaFin > fechaInicio
  validateDateOrder(fechaInicio: Date, fechaFin: Date, entityName: string): void {
    if (fechaFin <= fechaInicio) {
      throw new BadRequestException(
        `La fecha de fin de ${entityName} debe ser posterior a la fecha de inicio`
      );
    }
  }
}
