import { Module, forwardRef } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { RegistroPostEntrenamientoController } from './registro-post-entrenamiento.controller';
import { RegistroPostEntrenamientoService } from './registro-post-entrenamiento.service';
import { PrismaService } from '../../database/prisma.service';
import { AtletaOwnershipGuard } from '../../common/guards/atleta-ownership.guard';
import { AlgoritmoModule } from '../algoritmo/algoritmo.module';

// Modulo de Registro Post-Entrenamiento (Fase 4)
// Permite a ENTRENADORES registrar datos despues de cada sesion:
// - RPE, calidad de sueno, estado animico
// - Dolencias/lesiones con nivel de dolor
// - Asistencia y observaciones
// Integra con el modulo de Algoritmo para generar alertas automaticas
@Module({
  imports: [DatabaseModule, AuthModule, forwardRef(() => AlgoritmoModule)],
  controllers: [RegistroPostEntrenamientoController],
  providers: [RegistroPostEntrenamientoService, PrismaService, AtletaOwnershipGuard],
  exports: [RegistroPostEntrenamientoService],
})
export class RegistroPostEntrenamientoModule {}
