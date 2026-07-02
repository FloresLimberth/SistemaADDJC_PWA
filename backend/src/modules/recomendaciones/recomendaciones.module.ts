// Modulo de Recomendaciones
// Maneja el flujo de aprobacion de recomendaciones del algoritmo
// Implementa: Human-in-the-Loop, State Machine, Audit Trail

import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { AlgoritmoModule } from '../algoritmo/algoritmo.module';
import { PrismaService } from '../../database/prisma.service';
import { RecomendacionesController } from './recomendaciones.controller';
import { RecomendacionesService } from './recomendaciones.service';

@Module({
  imports: [DatabaseModule, AuthModule, AlgoritmoModule],
  controllers: [RecomendacionesController],
  providers: [PrismaService, RecomendacionesService],
  exports: [RecomendacionesService],
})
export class RecomendacionesModule {}
