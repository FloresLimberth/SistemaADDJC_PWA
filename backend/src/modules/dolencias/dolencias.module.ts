import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { DolenciasController } from './dolencias.controller';
import { DolenciasService } from './dolencias.service';
import { PrismaService } from '../../database/prisma.service';

// Modulo de Dolencias (Fase 4)
// Gestiona lesiones y dolores de atletas:
// - Listar dolencias activas y recuperadas
// - Marcar como recuperado con fecha y responsable
// - Filtrar por atleta y estado
// - Crear notificaciones al marcar recuperacion
@Module({
  imports: [
    DatabaseModule, // Para PrismaService
    AuthModule, // Para autenticacion y autorizacion
  ],
  controllers: [DolenciasController],
  providers: [DolenciasService, PrismaService],
  exports: [DolenciasService],
})
export class DolenciasModule {}
