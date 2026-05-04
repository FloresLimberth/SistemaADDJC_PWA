import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AsignacionesController } from './asignaciones.controller';
import { AsignacionesService } from './asignaciones.service';
import { PrismaService } from '../../database/prisma.service';

// Modulo de Asignaciones de Atletas a Microciclos
// Gestiona la relacion entre atletas y microciclos:
// - Asignar atletas a microciclos (COMITE_TECNICO)
// - Listar asignaciones con filtros
// - Actualizar observaciones y eliminar asignaciones (hard delete)
@Module({
  imports: [DatabaseModule],
  controllers: [AsignacionesController],
  providers: [AsignacionesService, PrismaService],
  exports: [AsignacionesService],
})
export class AsignacionesModule {}
